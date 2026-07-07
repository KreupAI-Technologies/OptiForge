
import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { WorkflowApproval } from '../entities/workflow-approval.entity';
import { ApprovalStep } from '../entities/approval-step.entity';
import { EventBusService } from './event-bus.service';
import { WorkflowEventType, ApprovalEventPayload } from '../events/event-types';

@Injectable()
export class ApprovalService {
    private readonly logger = new Logger(ApprovalService.name);

    constructor(
        @InjectRepository(WorkflowApproval)
        private approvalRepository: Repository<WorkflowApproval>,
        @InjectRepository(ApprovalStep)
        private stepRepository: Repository<ApprovalStep>,
        private readonly eventBusService: EventBusService,
        private readonly dataSource: DataSource,
    ) { }

    /**
     * Create a new approval workflow
     */
    async createApproval(
        projectId: string,
        approvalType: string,
        referenceId: string,
        workflowType: 'sequential' | 'parallel' | 'conditional' = 'sequential',
        steps: { approverId: string; approverRole?: string; stepNumber: number }[],
        createdBy: string,
        description?: string,
    ): Promise<WorkflowApproval> {
        const approval = this.approvalRepository.create({
            projectId,
            approvalType,
            referenceId,
            workflowType,
            createdBy,
            description,
            status: 'pending',
            currentStep: 1,
        });

        const savedApproval = await this.approvalRepository.save(approval);

        const approvalSteps = steps.map((step) =>
            this.stepRepository.create({
                approvalId: savedApproval.id,
                approverId: step.approverId,
                approverRole: step.approverRole,
                stepNumber: step.stepNumber,
                status: 'pending',
            }),
        );

        await this.stepRepository.save(approvalSteps);

        // Emit event
        await this.eventBusService.emit<ApprovalEventPayload>(WorkflowEventType.APPROVAL_REQUIRED, {
            approvalId: savedApproval.id,
            entityType: approvalType,
            entityId: referenceId,
            entityNumber: referenceId, // Assuming ID is number for now, or fetch entity
            requiredApprovers: steps.map(s => s.approverId),
            currentLevel: 1,
            maxLevel: steps.length, // Simplified
            userId: createdBy,
        });

        return this.getApproval(savedApproval.id);
    }

    /**
     * Process an approval action
     */
    async processAction(
        approvalId: string,
        userId: string,
        action: 'approve' | 'reject',
        comments?: string,
    ): Promise<WorkflowApproval> {
        const approval = await this.getApproval(approvalId);

        // Find relevant step
        const currentSteps = approval.steps.filter(
            (s) => s.stepNumber === approval.currentStep && s.status === 'pending',
        );

        const step = currentSteps.find((s) => s.approverId === userId);

        if (!step) {
            throw new NotFoundException(`No pending approval found for user ${userId} in step ${approval.currentStep}`);
        }

        // Update step
        step.status = action === 'approve' ? 'approved' : 'rejected';
        step.decidedAt = new Date();
        step.comments = comments ?? '';
        await this.stepRepository.save(step);

        // Check if we need to move to next step or complete workflow
        if (action === 'reject') {
            approval.status = 'rejected';
            approval.completedAt = new Date();
            await this.approvalRepository.save(approval);

            // Emit rejection event
            await this.eventBusService.emit<ApprovalEventPayload>(WorkflowEventType.APPROVAL_REJECTED, {
                approvalId: approval.id,
                entityType: approval.approvalType,
                entityId: approval.referenceId,
                entityNumber: approval.referenceId,
                requiredApprovers: [userId],
                currentLevel: approval.currentStep,
                maxLevel: 0,
                decision: 'rejected',
                comments,
                userId,
            });
        } else {
            // Check if all steps in current sequence are approved
            const allCurrentApproved = currentSteps.every((s) =>
                s.id === step.id ? true : s.status === 'approved'
            );

            if (allCurrentApproved) {
                // Check if there are more steps
                const nextStepNumber = approval.currentStep + 1;
                const nextSteps = await this.stepRepository.count({
                    where: { approvalId: approval.id, stepNumber: nextStepNumber },
                });

                if (nextSteps > 0) {
                    approval.currentStep = nextStepNumber;
                } else {
                    approval.status = 'approved';
                    approval.completedAt = new Date();

                    // Emit approval granted event
                    await this.eventBusService.emit<ApprovalEventPayload>(WorkflowEventType.APPROVAL_GRANTED, {
                        approvalId: approval.id,
                        entityType: approval.approvalType,
                        entityId: approval.referenceId,
                        entityNumber: approval.referenceId,
                        requiredApprovers: [userId],
                        currentLevel: approval.currentStep,
                        maxLevel: 0,
                        decision: 'approved',
                        comments,
                        userId,
                    });
                }
                await this.approvalRepository.save(approval);
            }
        }

        return this.getApproval(approvalId);
    }

    /**
     * Delegate (reassign) the current pending approval step to another user.
     * Reassigns the pending step at the current level and records the
     * delegation trail in the step's `metadata` jsonb column (no schema change).
     */
    async delegate(
        approvalId: string,
        fromUserId: string,
        toUserId: string,
        reason?: string,
    ): Promise<WorkflowApproval> {
        if (!toUserId || !toUserId.trim()) {
            throw new BadRequestException('toUserId is required');
        }
        const approval = await this.getApproval(approvalId);

        const pendingSteps = approval.steps.filter(
            (s) => s.stepNumber === approval.currentStep && s.status === 'pending',
        );
        if (pendingSteps.length === 0) {
            throw new NotFoundException(
                `No pending step to delegate for approval ${approvalId}`,
            );
        }

        // Prefer the step assigned to the delegating user; otherwise take the
        // first pending step at the current level.
        const step =
            pendingSteps.find((s) => s.approverId === fromUserId) ?? pendingSteps[0];
        const previousApproverId = step.approverId;

        step.approverId = toUserId.trim();
        step.metadata = {
            ...(step.metadata ?? {}),
            delegatedFrom: previousApproverId,
            delegatedBy: fromUserId ?? previousApproverId,
            delegatedAt: new Date().toISOString(),
            delegationReason: reason ?? null,
        };
        await this.stepRepository.save(step);

        this.logger.log(
            `Approval ${approvalId} step ${step.stepNumber} delegated from ${previousApproverId} to ${toUserId}`,
        );

        return this.getApproval(approvalId);
    }

    async getApproval(id: string): Promise<WorkflowApproval> {
        const approval = await this.approvalRepository.findOne({
            where: { id },
            relations: ['steps'],
        });
        if (!approval) {
            throw new NotFoundException(`Approval ${id} not found`);
        }
        return approval;
    }

    async getApprovalHistory(referenceId: string, approvalType: string): Promise<WorkflowApproval[]> {
        return this.approvalRepository.find({
            where: { referenceId, approvalType },
            relations: ['steps'],
            order: { createdAt: 'DESC' },
        });
    }
}
