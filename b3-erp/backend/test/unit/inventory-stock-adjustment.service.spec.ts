import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { StockAdjustmentService } from '../../src/modules/inventory/services/stock-adjustment.service';
import {
  StockAdjustment,
  StockAdjustmentLine,
  AdjustmentStatus,
} from '../../src/modules/inventory/entities/stock-adjustment.entity';
import { createMockRepository } from '../utils/test-setup';

function makeQb(rows: any[]) {
  return {
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue(rows),
  } as any;
}

describe('StockAdjustmentService', () => {
  let service: StockAdjustmentService;
  let repo: ReturnType<typeof createMockRepository>;
  let lineRepo: ReturnType<typeof createMockRepository>;
  let dataSource: any;

  beforeEach(async () => {
    repo = createMockRepository<StockAdjustment>();
    lineRepo = createMockRepository<StockAdjustmentLine>();
    dataSource = { transaction: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StockAdjustmentService,
        { provide: getRepositoryToken(StockAdjustment), useValue: repo },
        { provide: getRepositoryToken(StockAdjustmentLine), useValue: lineRepo },
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();
    service = module.get(StockAdjustmentService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('generates a number, computes variance and persists header + lines', async () => {
      repo.count.mockResolvedValue(4); // -> ADJ-<year>-000005
      const manager = {
        create: jest.fn((_e: any, data: any) => data),
        save: jest.fn(async (_e: any, data: any) => data),
      };
      dataSource.transaction.mockImplementation(async (cb: any) => cb(manager));
      // findOne is invoked at the end of create to reload the saved record.
      repo.findOne.mockResolvedValue({
        id: 'saved-1',
        lines: [],
      } as any);

      const result = await service.create({
        warehouseId: 'w1',
        adjustmentType: 'Physical Count',
        lines: [
          { physicalQuantity: 12, systemQuantity: 10 },
          { physicalQuantity: 8, systemQuantity: 10 },
        ],
      } as any);

      // Header created as DRAFT
      expect(manager.create).toHaveBeenCalledWith(
        StockAdjustment,
        expect.objectContaining({ status: AdjustmentStatus.DRAFT }),
      );
      // A line's adjustmentQuantity + variancePercentage derived from qty deltas.
      const linesCall = manager.create.mock.calls.find(
        (c) => c[0] === StockAdjustmentLine,
      );
      expect(linesCall![1]).toMatchObject({
        adjustmentQuantity: 2,
        variancePercentage: 20,
      });
      expect(result.id).toBe('saved-1');
    });
  });

  describe('findAll', () => {
    it('applies status filter and reloads each row via findOne', async () => {
      const qb = makeQb([{ id: 'a1' }]);
      (repo.createQueryBuilder as jest.Mock).mockReturnValue(qb);
      repo.findOne.mockResolvedValue({ id: 'a1', lines: [] } as any);

      const result = await service.findAll({ status: 'Draft' });

      expect(qb.andWhere).toHaveBeenCalledWith(
        'stockAdjustment.status = :status',
        { status: 'Draft' },
      );
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('a1');
    });
  });

  describe('findOne', () => {
    it('throws NotFoundException when missing', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.findOne('x')).rejects.toThrow(NotFoundException);
    });

    it('maps lines onto the response dto', async () => {
      repo.findOne.mockResolvedValue({
        id: 'a1',
        lines: [{ id: 'l1' }],
      } as any);
      const result = await service.findOne('a1');
      expect(result.lines).toHaveLength(1);
    });
  });

  describe('update', () => {
    it('rejects updates to non-draft adjustments', async () => {
      repo.findOne.mockResolvedValue({
        id: 'a1',
        status: AdjustmentStatus.SUBMITTED,
      } as any);
      await expect(service.update('a1', {} as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('saves and reloads a draft adjustment', async () => {
      repo.findOne
        .mockResolvedValueOnce({ id: 'a1', status: AdjustmentStatus.DRAFT } as any)
        .mockResolvedValueOnce({
          id: 'a1',
          status: AdjustmentStatus.DRAFT,
          lines: [],
        } as any);
      repo.save.mockResolvedValue({} as any);
      const result = await service.update('a1', { notes: 'x' } as any);
      expect(repo.save).toHaveBeenCalled();
      expect(result.id).toBe('a1');
    });
  });

  describe('remove', () => {
    it('blocks deletion of a posted adjustment', async () => {
      repo.findOne.mockResolvedValue({ id: 'a1', isPosted: true } as any);
      await expect(service.remove('a1')).rejects.toThrow(BadRequestException);
    });

    it('deletes lines then header in a transaction', async () => {
      repo.findOne.mockResolvedValue({ id: 'a1', isPosted: false } as any);
      const manager = { delete: jest.fn().mockResolvedValue({}) };
      dataSource.transaction.mockImplementation(async (cb: any) => cb(manager));
      await service.remove('a1');
      expect(manager.delete).toHaveBeenCalledWith(StockAdjustmentLine, {
        stockAdjustmentId: 'a1',
      });
      expect(manager.delete).toHaveBeenCalledWith(StockAdjustment, { id: 'a1' });
    });
  });

  describe('approve/post', () => {
    it('approve stamps status + approvedAt', async () => {
      const entity: any = { id: 'a1', status: AdjustmentStatus.SUBMITTED };
      repo.findOne
        .mockResolvedValueOnce(entity)
        .mockResolvedValueOnce({ ...entity, status: AdjustmentStatus.APPROVED, lines: [] });
      repo.save.mockResolvedValue(entity);
      const result = await service.approve('a1');
      expect(entity.status).toBe(AdjustmentStatus.APPROVED);
      expect(entity.approvedAt).toBeInstanceOf(Date);
      expect(result.status).toBe(AdjustmentStatus.APPROVED);
    });

    it('post rejects when not approved', async () => {
      repo.findOne.mockResolvedValue({
        id: 'a1',
        status: AdjustmentStatus.DRAFT,
        lines: [],
      } as any);
      await expect(service.post('a1')).rejects.toThrow(BadRequestException);
    });
  });
});
