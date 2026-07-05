import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ApprovalRequest,
  ApprovalHistory,
  UserTask,
  ApprovalStatus,
  ApprovalAction,
} from '../../src/modules/approvals/entities';
import { ApprovalChainService } from '../../src/modules/approvals/services/approval-chain.service';
import { ApprovalWorkflowService } from '../../src/modules/approvals/services/approval-workflow.service';
import { NotificationService } from '../../src/modules/notifications/services/notification.service';
import { WorkflowFactory } from '../factories/workflow.factory';
import { createMockRepository, createMockService } from '../utils/test-setup';

describe('ApprovalWorkflowService', () => {
  let service: ApprovalWorkflowService;
  let requestRepository: jest.Mocked<Repository<ApprovalRequest>>;
  let historyRepository: jest.Mocked<Repository<ApprovalHistory>>;
  let taskRepository: jest.Mocked<Repository<UserTask>>;
  let chainService: jest.Mocked<ApprovalChainService>;
  let notificationService: jest.Mocked<NotificationService>;

  beforeEach(async () => {
    requestRepository = createMockRepository<ApprovalRequest>();
    historyRepository = createMockRepository<ApprovalHistory>();
    taskRepository = createMockRepository<UserTask>();
    chainService = createMockService<ApprovalChainService>(['getChainForEntity']);
    // ApprovalWorkflowService calls notifyApprovalApproved + notifyApprovalRejected
    // + notifyApprovalAssigned (first- and next-level approver notifications) as
    // fire-and-forget promises (`.catch(...)` chained on the call). Mocks must
    // return a resolved Promise — `undefined.catch(...)` throws.
    notificationService = createMockService<NotificationService>([
      'notifyApprovalApproved',
      'notifyApprovalRejected',
      'notifyApprovalAssigned',
    ]);
    // mockResolvedValue's type is the method's return type; we don't care
    // about the value, only that the awaited result is a settled Promise.
    notificationService.notifyApprovalApproved.mockResolvedValue({} as never);
    notificationService.notifyApprovalRejected.mockResolvedValue({} as never);
    notificationService.notifyApprovalAssigned.mockResolvedValue({} as never);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApprovalWorkflowService,
        {
          provide: getRepositoryToken(ApprovalRequest),
          useValue: requestRepository,
        },
        {
          provide: getRepositoryToken(ApprovalHistory),
          useValue: historyRepository,
        },
        {
          provide: getRepositoryToken(UserTask),
          useValue: taskRepository,
        },
        {
          provide: ApprovalChainService,
          useValue: chainService,
        },
        {
          provide: NotificationService,
          useValue: notificationService,
        },
      ],
    }).compile();

    service = module.get<ApprovalWorkflowService>(ApprovalWorkflowService);
    WorkflowFactory.resetCounters();
  });

  describe('createApprovalRequest', () => {
    it('should create an approval request and initial task', async () => {
      const chain = WorkflowFactory.createApprovalChain({
        levels: [
          WorkflowFactory.createApprovalLevel({ sequence: 1, approverIds: ['m1'] }),
          WorkflowFactory.createApprovalLevel({ sequence: 2, approverIds: ['m2'] }),
        ],
      });
      chainService.getChainForEntity.mockResolvedValue(chain);

      const dto = {
        title: 'Test PO',
        entityType: 'purchase_order',
        entityId: 'po-1',
        referenceNumber: 'PO-123',
        amount: 1000,
        requestedBy: 'u1',
      };

      const mockRequest = WorkflowFactory.createApprovalRequest(dto);
      requestRepository.create.mockReturnValue(mockRequest as any);
      requestRepository.save.mockResolvedValue(mockRequest as any);
      requestRepository.findOne.mockResolvedValue(mockRequest as any);

      const result = await service.createApprovalRequest(dto as any);

      expect(chainService.getChainForEntity).toHaveBeenCalledWith('purchase_order', {
        amount: 1000,
      });
      expect(requestRepository.save).toHaveBeenCalled();
      expect(historyRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          action: ApprovalAction.PENDING,
        }),
      );
      expect(taskRepository.save).toHaveBeenCalled();
      expect(result.id).toBe(mockRequest.id);
    });

    it('should throw NotFoundException if no chain is found', async () => {
      chainService.getChainForEntity.mockResolvedValue(null);
      const dto = { entityType: 'non-existent', amount: 0 };

      await expect(service.createApprovalRequest(dto as any)).rejects.toThrow(NotFoundException);
    });
  });

  describe('approveRequest', () => {
    it('should approve level and move to next level if more levels remain', async () => {
      const chain = WorkflowFactory.createApprovalChain({
        levels: [
          WorkflowFactory.createApprovalLevel({ sequence: 1, requiredCount: 1 }),
          WorkflowFactory.createApprovalLevel({ sequence: 2, requiredCount: 1 }),
        ],
      });
      chainService.getChainForEntity.mockResolvedValue(chain);

      const request = WorkflowFactory.createApprovalRequest({
        currentLevel: 1,
        totalLevels: 2,
        status: ApprovalStatus.PENDING,
      });
      requestRepository.findOne.mockResolvedValueOnce(request as any);
      historyRepository.count.mockResolvedValue(1); // One approval recorded

      // For moveToNextLevel
      requestRepository.update.mockResolvedValue({} as any);
      requestRepository.findOne.mockResolvedValue(request as any);

      await service.approveRequest(request.id, 'm1', 'Fine');

      expect(historyRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          action: ApprovalAction.APPROVED,
          level: 1,
        }),
      );
      expect(requestRepository.update).toHaveBeenCalledWith(
        request.id,
        expect.objectContaining({
          currentLevel: 2,
        }),
      );
    });

    it('should complete approval if last level is approved', async () => {
      const chain = WorkflowFactory.createApprovalChain({
        levels: [WorkflowFactory.createApprovalLevel({ sequence: 1, requiredCount: 1 })],
      });
      chainService.getChainForEntity.mockResolvedValue(chain);

      const request = WorkflowFactory.createApprovalRequest({
        currentLevel: 1,
        totalLevels: 1,
        status: ApprovalStatus.PENDING,
      });
      requestRepository.findOne.mockResolvedValue(request as any);
      historyRepository.count.mockResolvedValue(1);

      await service.approveRequest(request.id, 'm1');

      expect(requestRepository.update).toHaveBeenCalledWith(request.id, {
        status: ApprovalStatus.APPROVED,
      });
    });
  });

  describe('rejectRequest', () => {
    it('should reject request and cancel tasks', async () => {
      const request = WorkflowFactory.createApprovalRequest({ status: ApprovalStatus.PENDING });
      requestRepository.findOne.mockResolvedValue(request as any);

      await service.rejectRequest(request.id, 'm1', 'Bad');

      expect(historyRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          action: ApprovalAction.REJECTED,
          comment: 'Bad',
        }),
      );
      expect(requestRepository.update).toHaveBeenCalledWith(request.id, {
        status: ApprovalStatus.REJECTED,
      });
      expect(taskRepository.delete).toHaveBeenCalled();
    });
  });
});
