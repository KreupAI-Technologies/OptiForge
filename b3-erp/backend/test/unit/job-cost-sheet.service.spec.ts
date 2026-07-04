import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { JobCostSheetService } from '../../src/modules/finance/services/job-cost-sheet.service';
import { JobCostSheet, JobCostSheetStatus } from '../../src/modules/finance/entities/job-cost-sheet.entity';
import { createMockRepository } from '../utils/test-setup';

function makeQb() {
  return {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
  } as any;
}

describe('JobCostSheetService', () => {
  let service: JobCostSheetService;
  let repo: jest.Mocked<Repository<JobCostSheet>>;
  let qb: any;

  beforeEach(async () => {
    repo = createMockRepository<JobCostSheet>();
    qb = makeQb();
    repo.createQueryBuilder.mockReturnValue(qb);
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobCostSheetService,
        { provide: getRepositoryToken(JobCostSheet), useValue: repo },
      ],
    }).compile();
    service = module.get(JobCostSheetService);
  });

  describe('findAll (variance decoration)', () => {
    it('computes variance and variancePercent from estimated vs actual', async () => {
      qb.getMany.mockResolvedValue([
        { id: 'cs1', totalEstimatedCost: 1000, totalActualCost: 750 },
      ]);
      const rows = await service.findAll();
      // variance = 1000 - 750 = 250; percent = 25
      expect(rows[0].variance).toBe(250);
      expect(rows[0].variancePercent).toBe(25);
    });

    it('avoids divide-by-zero when estimated is 0', async () => {
      qb.getMany.mockResolvedValue([{ id: 'cs2', totalEstimatedCost: 0, totalActualCost: 500 }]);
      const rows = await service.findAll();
      expect(rows[0].variance).toBe(-500);
      expect(rows[0].variancePercent).toBe(0);
    });

    it('applies status filter but ignores the sentinel "All"', async () => {
      qb.getMany.mockResolvedValue([]);
      await service.findAll({ status: 'All' });
      expect(qb.andWhere).not.toHaveBeenCalledWith(
        'cs.status = :status',
        expect.anything(),
      );
      await service.findAll({ status: 'Draft' });
      expect(qb.andWhere).toHaveBeenCalledWith('cs.status = :status', { status: 'Draft' });
    });
  });

  describe('findOne', () => {
    it('throws NotFound when sheet missing', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.findOne('x')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('defaults status to DRAFT and coerces numeric fields', async () => {
      repo.create.mockImplementation((d: any) => d);
      repo.save.mockResolvedValue({
        id: 'cs1',
        status: JobCostSheetStatus.DRAFT,
        materialCost: '100',
        totalEstimatedCost: '200',
        totalActualCost: '150',
      } as any);
      const result = await service.create({ costSheetNumber: 'CS1', jobNumber: 'J1', jobName: 'Job' } as any);
      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ status: JobCostSheetStatus.DRAFT }),
      );
      // string "100" coerced to number 100
      expect(result.materialCost).toBe(100);
      expect(result.variance).toBe(50);
    });
  });

  describe('remove', () => {
    it('throws NotFound when nothing deleted', async () => {
      repo.delete.mockResolvedValue({ affected: 0 } as any);
      await expect(service.remove('x')).rejects.toThrow(NotFoundException);
    });

    it('resolves when a row is deleted', async () => {
      repo.delete.mockResolvedValue({ affected: 1 } as any);
      await expect(service.remove('cs1')).resolves.toBeUndefined();
    });
  });
});
