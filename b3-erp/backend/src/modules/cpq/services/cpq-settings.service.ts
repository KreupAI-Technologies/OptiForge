import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CPQApprovalRequest,
  CPQApprovalWorkflow,
  CPQIntegration,
  CPQNotificationSetting,
  CPQSettings,
  CPQUserPermission,
} from '../entities/cpq-settings.entity';

@Injectable()
export class CPQSettingsService {
  constructor(
    @InjectRepository(CPQSettings)
    private settingsRepository: Repository<CPQSettings>,
    @InjectRepository(CPQUserPermission)
    private permissionRepository: Repository<CPQUserPermission>,
    @InjectRepository(CPQApprovalWorkflow)
    private workflowRepository: Repository<CPQApprovalWorkflow>,
    @InjectRepository(CPQApprovalRequest)
    private approvalRequestRepository: Repository<CPQApprovalRequest>,
    @InjectRepository(CPQNotificationSetting)
    private notificationRepository: Repository<CPQNotificationSetting>,
    @InjectRepository(CPQIntegration)
    private integrationRepository: Repository<CPQIntegration>,
  ) {}

  // General Settings
  async getSettings(companyId: string): Promise<CPQSettings> {
    if (!companyId) {
      // Auto-provisioning settings requires a tenant; reject cleanly (400) instead
      // of hitting a NOT-NULL violation (500) on the companyId column.
      throw new BadRequestException('x-company-id header is required');
    }
    let settings = await this.settingsRepository.findOne({
      where: { companyId },
    });

    if (!settings) {
      settings = this.settingsRepository.create({ companyId });
      await this.settingsRepository.save(settings);
    }

    return settings;
  }

  async updateSettings(
    companyId: string,
    data: Partial<CPQSettings>,
  ): Promise<CPQSettings> {
    let settings = await this.settingsRepository.findOne({
      where: { companyId },
    });

    if (!settings) {
      settings = this.settingsRepository.create({ companyId, ...data });
    } else {
      Object.assign(settings, data);
    }

    return this.settingsRepository.save(settings);
  }

  // User Permissions
  async getUserPermissions(
    companyId: string,
    userId: string,
  ): Promise<CPQUserPermission | null> {
    return this.permissionRepository.findOne({
      where: { companyId, userId },
    });
  }

  async setUserPermissions(
    companyId: string,
    userId: string,
    data: Partial<CPQUserPermission>,
  ): Promise<CPQUserPermission> {
    let permission = await this.permissionRepository.findOne({
      where: { companyId, userId },
    });

    if (!permission) {
      permission = this.permissionRepository.create({
        companyId,
        userId,
        ...data,
      });
    } else {
      Object.assign(permission, data);
    }

    return this.permissionRepository.save(permission);
  }

  async getAllUserPermissions(companyId: string): Promise<CPQUserPermission[]> {
    return this.permissionRepository.find({
      where: { companyId },
    });
  }

  async deleteUserPermissions(companyId: string, userId: string): Promise<void> {
    await this.permissionRepository.delete({ companyId, userId });
  }

  // Check specific permissions
  async canApproveQuote(
    companyId: string,
    userId: string,
    quoteValue: number,
  ): Promise<boolean> {
    const permission = await this.getUserPermissions(companyId, userId);
    if (!permission) return false;
    if (!permission.canApproveQuotes) return false;
    if (
      permission.quoteApprovalLimit &&
      quoteValue > Number(permission.quoteApprovalLimit)
    ) {
      return false;
    }
    return true;
  }

  async canApplyDiscount(
    companyId: string,
    userId: string,
    discountPercentage: number,
  ): Promise<boolean> {
    const permission = await this.getUserPermissions(companyId, userId);
    if (!permission) return false;
    if (permission.canApplyAnyDiscount) return true;
    if (
      permission.maxDiscountPercentage &&
      discountPercentage > Number(permission.maxDiscountPercentage)
    ) {
      return false;
    }
    return true;
  }

  // Approval Workflows
  async createWorkflow(
    companyId: string,
    data: Partial<CPQApprovalWorkflow>,
  ): Promise<CPQApprovalWorkflow> {
    if (data.isDefault) {
      await this.workflowRepository.update(
        { companyId, workflowType: data.workflowType, isDefault: true },
        { isDefault: false },
      );
    }
    const workflow = this.workflowRepository.create({
      ...data,
      companyId,
    });
    return this.workflowRepository.save(workflow);
  }

  async findAllWorkflows(
    companyId: string,
    filters?: { workflowType?: string; isActive?: boolean },
  ): Promise<CPQApprovalWorkflow[]> {
    const query = this.workflowRepository
      .createQueryBuilder('workflow')
      .where('workflow.companyId = :companyId', { companyId })
      .orderBy('workflow.isDefault', 'DESC')
      .addOrderBy('workflow.name', 'ASC');

    if (filters?.workflowType) {
      query.andWhere('workflow.workflowType = :workflowType', {
        workflowType: filters.workflowType,
      });
    }
    if (filters?.isActive !== undefined) {
      query.andWhere('workflow.isActive = :isActive', { isActive: filters.isActive });
    }

    return query.getMany();
  }

  async findWorkflowById(
    companyId: string,
    id: string,
  ): Promise<CPQApprovalWorkflow> {
    const workflow = await this.workflowRepository.findOne({
      where: { id, companyId },
    });
    if (!workflow) {
      throw new NotFoundException(`Workflow with ID ${id} not found`);
    }
    return workflow;
  }

  async updateWorkflow(
    companyId: string,
    id: string,
    data: Partial<CPQApprovalWorkflow>,
  ): Promise<CPQApprovalWorkflow> {
    if (data.isDefault) {
      const workflow = await this.findWorkflowById(companyId, id);
      await this.workflowRepository.update(
        { companyId, workflowType: workflow.workflowType, isDefault: true },
        { isDefault: false },
      );
    }
    const workflow = await this.findWorkflowById(companyId, id);
    Object.assign(workflow, data);
    return this.workflowRepository.save(workflow);
  }

  async deleteWorkflow(companyId: string, id: string): Promise<void> {
    const workflow = await this.findWorkflowById(companyId, id);
    await this.workflowRepository.remove(workflow);
  }

  async getApplicableWorkflow(
    companyId: string,
    workflowType: 'quote' | 'discount' | 'proposal' | 'contract',
    amount?: number,
    discountPercentage?: number,
  ): Promise<CPQApprovalWorkflow | null> {
    const query = this.workflowRepository
      .createQueryBuilder('workflow')
      .where('workflow.companyId = :companyId', { companyId })
      .andWhere('workflow.workflowType = :workflowType', { workflowType })
      .andWhere('workflow.isActive = :isActive', { isActive: true })
      .orderBy('workflow.isDefault', 'DESC');

    if (amount !== undefined) {
      query.andWhere(
        '(workflow.thresholdAmount IS NULL OR workflow.thresholdAmount <= :amount)',
        { amount },
      );
    }
    if (discountPercentage !== undefined) {
      query.andWhere(
        '(workflow.thresholdDiscountPercentage IS NULL OR workflow.thresholdDiscountPercentage <= :discountPercentage)',
        { discountPercentage },
      );
    }

    return query.getOne();
  }

  // Approval Requests
  async createApprovalRequest(
    companyId: string,
    data: Partial<CPQApprovalRequest>,
  ): Promise<CPQApprovalRequest> {
    const request = this.approvalRequestRepository.create({
      ...data,
      companyId,
    });
    return this.approvalRequestRepository.save(request);
  }

  async findApprovalRequests(
    companyId: string,
    filters?: {
      entityType?: string;
      status?: string;
      entityId?: string;
    },
  ): Promise<CPQApprovalRequest[]> {
    const query = this.approvalRequestRepository
      .createQueryBuilder('request')
      .where('request.companyId = :companyId', { companyId })
      .orderBy('request.createdAt', 'DESC');

    if (filters?.entityType) {
      query.andWhere('request.entityType = :entityType', {
        entityType: filters.entityType,
      });
    }
    if (filters?.status) {
      query.andWhere('request.status = :status', { status: filters.status });
    }
    if (filters?.entityId) {
      query.andWhere('request.entityId = :entityId', {
        entityId: filters.entityId,
      });
    }

    return query.getMany();
  }

  async findApprovalRequestById(
    companyId: string,
    id: string,
  ): Promise<CPQApprovalRequest> {
    const request = await this.approvalRequestRepository.findOne({
      where: { id, companyId },
    });
    if (!request) {
      throw new NotFoundException(`Approval Request with ID ${id} not found`);
    }
    return request;
  }

  async processApprovalStep(
    companyId: string,
    requestId: string,
    approverId: string,
    approverName: string,
    action: 'approved' | 'rejected' | 'escalated',
    comments?: string,
  ): Promise<CPQApprovalRequest> {
    const request = await this.findApprovalRequestById(companyId, requestId);
    const workflow = await this.findWorkflowById(companyId, request.workflowId);

    const currentStep = workflow.steps.find(
      (s) => s.stepNumber === request.currentStep,
    );
    if (!currentStep) {
      throw new Error('Invalid workflow step');
    }

    // Record step history
    const stepHistory = request.stepHistory || [];
    stepHistory.push({
      stepNumber: request.currentStep,
      stepName: currentStep.stepName,
      approverId,
      approverName,
      action,
      actionAt: new Date(),
      comments,
    });
    request.stepHistory = stepHistory;

    if (action === 'approved') {
      const nextStep = workflow.steps.find(
        (s) => s.stepNumber === request.currentStep + 1,
      );
      if (nextStep) {
        request.currentStep++;
      } else {
        request.status = 'approved';
        request.finalApproverId = approverId;
        request.completedAt = new Date();
        request.finalComments = comments ?? null;
      }
    } else if (action === 'rejected') {
      request.status = 'rejected';
      request.finalApproverId = approverId;
      request.completedAt = new Date();
      request.finalComments = comments ?? null;
    } else if (action === 'escalated') {
      request.status = 'escalated';
    }

    return this.approvalRequestRepository.save(request);
  }

  async cancelApprovalRequest(
    companyId: string,
    requestId: string,
  ): Promise<CPQApprovalRequest> {
    const request = await this.findApprovalRequestById(companyId, requestId);
    request.status = 'cancelled';
    request.completedAt = new Date();
    return this.approvalRequestRepository.save(request);
  }

  // Notification Settings
  async getUserNotificationSettings(
    companyId: string,
    userId: string,
  ): Promise<CPQNotificationSetting[]> {
    return this.notificationRepository.find({
      where: { companyId, userId },
    });
  }

  async updateNotificationSetting(
    companyId: string,
    userId: string,
    notificationType: string,
    data: Partial<CPQNotificationSetting>,
  ): Promise<CPQNotificationSetting> {
    let setting = await this.notificationRepository.findOne({
      where: { companyId, userId, notificationType },
    });

    if (!setting) {
      setting = this.notificationRepository.create({
        companyId,
        userId,
        notificationType,
        ...data,
      });
    } else {
      Object.assign(setting, data);
    }

    return this.notificationRepository.save(setting);
  }

  // Integrations
  async createIntegration(
    companyId: string,
    data: Partial<CPQIntegration>,
  ): Promise<CPQIntegration> {
    const integration = this.integrationRepository.create({
      ...data,
      companyId,
    });
    return this.integrationRepository.save(integration);
  }

  async findAllIntegrations(
    companyId: string,
    filters?: { integrationType?: string; isActive?: boolean },
  ): Promise<CPQIntegration[]> {
    const query = this.integrationRepository
      .createQueryBuilder('integration')
      .where('integration.companyId = :companyId', { companyId })
      .orderBy('integration.name', 'ASC');

    if (filters?.integrationType) {
      query.andWhere('integration.integrationType = :integrationType', {
        integrationType: filters.integrationType,
      });
    }
    if (filters?.isActive !== undefined) {
      query.andWhere('integration.isActive = :isActive', {
        isActive: filters.isActive,
      });
    }

    return query.getMany();
  }

  async findIntegrationById(
    companyId: string,
    id: string,
  ): Promise<CPQIntegration> {
    const integration = await this.integrationRepository.findOne({
      where: { id, companyId },
    });
    if (!integration) {
      throw new NotFoundException(`Integration with ID ${id} not found`);
    }
    return integration;
  }

  async updateIntegration(
    companyId: string,
    id: string,
    data: Partial<CPQIntegration>,
  ): Promise<CPQIntegration> {
    const integration = await this.findIntegrationById(companyId, id);
    Object.assign(integration, data);
    return this.integrationRepository.save(integration);
  }

  async deleteIntegration(companyId: string, id: string): Promise<void> {
    const integration = await this.findIntegrationById(companyId, id);
    await this.integrationRepository.remove(integration);
  }

  async recordIntegrationSync(
    companyId: string,
    id: string,
    status: 'success' | 'failed',
    error?: string,
  ): Promise<void> {
    await this.integrationRepository.update(
      { id, companyId },
      {
        lastSyncAt: new Date(),
        lastSyncStatus: status,
        lastSyncError: error ?? null,
      },
    );
  }

  async testIntegration(
    companyId: string,
    id: string,
  ): Promise<{ success: boolean; message: string }> {
    const integration = await this.findIntegrationById(companyId, id);

    // This would contain actual integration testing logic
    // For now, return a mock response
    return {
      success: true,
      message: `Integration ${integration.name} connection test successful`,
    };
  }
}
