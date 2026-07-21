import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DiscrepancyLog, DiscrepancyStatus, DiscrepancySeverity } from '../../project/entities/discrepancy-log.entity';
import { SiteSurvey } from '../../project/entities/site-survey.entity';
import { ExternalApproval, ApprovalStatus } from '../../project/entities/external-approval.entity';
import { Project } from '../../project/entities/project.entity';
import { BOQItem } from '../../project/entities/boq-item.entity';
import { DrawingVerification } from '../entities/drawing-verification.entity';
import * as crypto from 'crypto';

@Injectable()
export class DesignVerificationService {
    constructor(
        @InjectRepository(DiscrepancyLog)
        private discrepancyRepository: Repository<DiscrepancyLog>,
        @InjectRepository(SiteSurvey)
        private surveyRepository: Repository<SiteSurvey>,
        @InjectRepository(ExternalApproval)
        private approvalRepository: Repository<ExternalApproval>,
        @InjectRepository(Project)
        private projectRepository: Repository<Project>,
        @InjectRepository(BOQItem)
        private boqItemRepository: Repository<BOQItem>,
        @InjectRepository(DrawingVerification)
        private drawingVerificationRepository: Repository<DrawingVerification>,
    ) { }

    /**
     * Record (upsert) a verify/reject decision for a drawing. Returns the saved
     * row so the client can reflect persisted status.
     */
    async verifyDrawing(
        drawingId: string,
        data: { status?: string; notes?: string; verifiedBy?: string; projectId?: string },
    ): Promise<DrawingVerification> {
        let row = await this.drawingVerificationRepository.findOne({ where: { drawingId } });
        if (!row) {
            row = this.drawingVerificationRepository.create({ drawingId });
        }
        row.status = data.status ?? 'Verified';
        if (data.notes !== undefined) row.notes = data.notes;
        if (data.verifiedBy !== undefined) row.verifiedBy = data.verifiedBy;
        if (data.projectId !== undefined) row.projectId = data.projectId;
        return this.drawingVerificationRepository.save(row);
    }

    async getDrawingVerifications(projectId: string): Promise<DrawingVerification[]> {
        return this.drawingVerificationRepository.find({
            where: { projectId },
            order: { updatedAt: 'DESC' },
        });
    }

    // --- Discrepancy Log Methods ---

    async getDiscrepancies(projectId: string): Promise<DiscrepancyLog[]> {
        return this.discrepancyRepository.find({
            where: { projectId },
            order: { createdAt: 'DESC' },
        });
    }

    async createDiscrepancy(data: Partial<DiscrepancyLog>): Promise<DiscrepancyLog> {
        const log = this.discrepancyRepository.create(data);
        return this.discrepancyRepository.save(log);
    }

    async resolveDiscrepancy(id: string, resolvedBy: string, notes: string): Promise<DiscrepancyLog> {
        const log = await this.discrepancyRepository.findOne({ where: { id } });
        if (!log) throw new NotFoundException('Discrepancy log not found');

        log.status = DiscrepancyStatus.RESOLVED;
        log.resolvedBy = resolvedBy;
        log.resolvedAt = new Date();
        log.resolutionNotes = notes;

        return this.discrepancyRepository.save(log);
    }

    // --- Site Survey Methods ---

    async getSurveys(projectId: string): Promise<SiteSurvey[]> {
        return this.surveyRepository.find({
            where: { projectId },
            order: { date: 'DESC' },
        });
    }

    async createSurvey(data: Partial<SiteSurvey>): Promise<SiteSurvey> {
        const survey = this.surveyRepository.create(data);
        return this.surveyRepository.save(survey);
    }

    // --- External Approval Methods ---

    async createApprovalRequest(projectId: string, attachmentId: string, clientEmail: string): Promise<ExternalApproval> {
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 48); // 48 hour expiry

        const approval = this.approvalRepository.create({
            projectId,
            attachmentId,
            clientEmail,
            magicToken: token, // Changed from 'token' to 'magicToken' to match entity property
            expiresAt,
            status: ApprovalStatus.SENT,
        });

        const savedApproval = await this.approvalRepository.save(approval);

        // Simulate sending email
        console.log(`[EMAIL SIMULATION] Sending magic link to ${clientEmail}`);
        console.log(`URL: http://localhost:3000/public/approval/${token}`);

        return savedApproval;
    }

    async getApprovalByToken(token: string): Promise<ExternalApproval> {
        const approval = await this.approvalRepository.findOne({
            where: { magicToken: token },
            relations: ['project'],
        });

        if (!approval) throw new NotFoundException('Invalid or expired approval token');

        if (approval.status === ApprovalStatus.SENT) {
            approval.status = ApprovalStatus.VIEWED;
            await this.approvalRepository.save(approval);
        }

        return approval;
    }

    async submitApproval(token: string, status: ApprovalStatus, signatureUrl?: string, comments?: string): Promise<ExternalApproval> {
        const approval = await this.approvalRepository.findOne({ where: { magicToken: token } });
        if (!approval) throw new NotFoundException('Invalid token');

        approval.status = status;
        approval.signatureUrl = signatureUrl;
        approval.comments = comments;

        return this.approvalRepository.save(approval);
    }

    // --- Automated Detection (Simplified) ---

    async detectDiscrepancies(projectId: string): Promise<number> {
        const boqItems = await this.boqItemRepository.find({ where: { boq: { projectId } } });
        // In a real app, you'd fetch drawing quantities from an Engineering module
        // Here we simulate the mismatch detection logic
        let found = 0;
        for (const item of boqItems) {
            // Simulated drawing quantity (randomly +/- 2)
            const drawingQty = Math.max(0, item.quantity + (Math.random() > 0.7 ? (Math.random() > 0.5 ? 2 : -2) : 0));

            if (drawingQty !== item.quantity) {
                await this.createDiscrepancy({
                    projectId,
                    type: 'QUANTITY_MISMATCH' as any,
                    description: `BOQ Item: ${item.description}. BOQ Qty: ${item.quantity}, Drawing Qty: ${drawingQty}.`,
                    severity: drawingQty > item.quantity ? DiscrepancySeverity.CRITICAL : DiscrepancySeverity.MEDIUM,
                });
                found++;
            }
        }
        return found;
    }
}
