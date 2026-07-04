import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { PurchaseRequisitionService } from '../../src/modules/procurement/services/purchase-requisition.service';
import { PurchaseRequisition, PRStatus } from '../../src/modules/procurement/entities/purchase-requisition.entity';
import { createMockRepository } from '../utils/test-setup';

describe('PurchaseRequisitionService', () => {
  let service: PurchaseRequisitionService;
  let repo: jest.Mocked<Repository<PurchaseRequisition>>;

  beforeEach(async () => {
    repo = createMockRepository<PurchaseRequisition>();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PurchaseRequisitionService,
        { provide: getRepositoryToken(PurchaseRequisition), useValue: repo },
      ],
    }).compile();
    service = module.get(PurchaseRequisitionService);
  });

  describe('create', () => {
    it('sums line estimatedTotal into totalAmount and starts DRAFT', async () => {
      repo.count.mockResolvedValue(0);
      const dto: any = {
        items: [{ estimatedTotal: 100 }, { estimatedTotal: 250 }],
        requesterId: 'r1',
      };
      repo.create.mockImplementation((d: any) => d);
      repo.save.mockImplementation(async (d: any) => d);

      const result = await service.create(dto);

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ totalAmount: 350, status: PRStatus.DRAFT }),
      );
      expect(result.prNumber).toMatch(/^PR-\d{6}-00001$/);
    });
  });

  describe('update', () => {
    it('rejects updating a non-draft PR', async () => {
      repo.findOne.mockResolvedValue({ id: 'pr1', status: PRStatus.SUBMITTED } as any);
      await expect(service.update('pr1', {} as any)).rejects.toThrow('Only draft PRs can be updated');
    });

    it('recalculates totalAmount when items change', async () => {
      const pr: any = { id: 'pr1', status: PRStatus.DRAFT };
      repo.findOne.mockResolvedValue(pr);
      repo.save.mockImplementation(async (e: any) => e);
      await service.update('pr1', { items: [{ estimatedTotal: 40 }, { estimatedTotal: 60 }] } as any);
      expect(pr.totalAmount).toBe(100);
    });
  });

  describe('submit', () => {
    it('moves DRAFT to SUBMITTED', async () => {
      const pr: any = { id: 'pr1', status: PRStatus.DRAFT };
      repo.findOne.mockResolvedValue(pr);
      repo.save.mockImplementation(async (e: any) => e);
      const result = await service.submit('pr1');
      expect(result.status).toBe(PRStatus.SUBMITTED);
    });

    it('rejects submitting a non-draft PR', async () => {
      repo.findOne.mockResolvedValue({ id: 'pr1', status: PRStatus.APPROVED } as any);
      await expect(service.submit('pr1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('approve', () => {
    it('approves a SUBMITTED PR and records approver metadata', async () => {
      const pr: any = { id: 'pr1', status: PRStatus.SUBMITTED };
      repo.findOne.mockResolvedValue(pr);
      repo.save.mockImplementation(async (e: any) => e);
      const result = await service.approve('pr1', { approvedBy: 'u1', approverName: 'Alice' });
      expect(result.status).toBe(PRStatus.APPROVED);
      expect(result.isApproved).toBe(true);
      expect(result.approvedBy).toBe('u1');
      expect(pr.approvedAt).toBeInstanceOf(Date);
    });

    it('rejects approving a PR that is not submitted', async () => {
      repo.findOne.mockResolvedValue({ id: 'pr1', status: PRStatus.DRAFT } as any);
      await expect(
        service.approve('pr1', { approvedBy: 'u1', approverName: 'A' }),
      ).rejects.toThrow('Only submitted PRs can be approved');
    });
  });

  describe('convertToPO', () => {
    it('rejects converting a non-approved PR', async () => {
      repo.findOne.mockResolvedValue({ id: 'pr1', status: PRStatus.SUBMITTED } as any);
      await expect(
        service.convertToPO('pr1', { poId: 'po1', poNumber: 'PO-1' }),
      ).rejects.toThrow('Only approved PRs can be converted to PO');
    });

    it('appends the PO and flips status to FULLY_ORDERED', async () => {
      const pr: any = { id: 'pr1', status: PRStatus.APPROVED, purchaseOrders: null };
      repo.findOne.mockResolvedValue(pr);
      repo.save.mockImplementation(async (e: any) => e);
      const result = await service.convertToPO('pr1', { poId: 'po1', poNumber: 'PO-1' });
      expect(result.status).toBe(PRStatus.FULLY_ORDERED);
      expect(pr.purchaseOrders).toHaveLength(1);
      expect(pr.purchaseOrders[0].poNumber).toBe('PO-1');
    });
  });

  describe('remove', () => {
    it('rejects deleting a non-draft PR', async () => {
      repo.findOne.mockResolvedValue({ id: 'pr1', status: PRStatus.APPROVED } as any);
      await expect(service.remove('pr1')).rejects.toThrow('Only draft PRs can be deleted');
    });
  });
});
