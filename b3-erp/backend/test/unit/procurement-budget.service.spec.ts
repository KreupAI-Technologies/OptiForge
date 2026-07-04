import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProcurementBudgetService } from '../../src/modules/procurement/services/procurement-budget.service';
import { ProcurementBudget } from '../../src/modules/procurement/entities/procurement-budget.entity';
import { createMockRepository } from '../utils/test-setup';

describe('ProcurementBudgetService', () => {
  let service: ProcurementBudgetService;
  let repo: jest.Mocked<Repository<ProcurementBudget>>;

  beforeEach(async () => {
    repo = createMockRepository<ProcurementBudget>();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProcurementBudgetService,
        { provide: getRepositoryToken(ProcurementBudget), useValue: repo },
      ],
    }).compile();
    service = module.get(ProcurementBudgetService);
  });

  describe('findAll', () => {
    it('builds a where clause with optional filters', async () => {
      repo.find.mockResolvedValue([]);
      await service.findAll('co-1', 'department', 'FY26');
      expect(repo.find).toHaveBeenCalledWith({
        where: { companyId: 'co-1', budgetType: 'department', fiscalYear: 'FY26' },
        order: { name: 'ASC' },
      });
    });
  });

  describe('update', () => {
    it('calls repo.update then re-reads the row', async () => {
      repo.update.mockResolvedValue({} as any);
      repo.findOne.mockResolvedValue({ id: 'b1', name: 'IT' } as any);
      const result = await service.update('b1', { name: 'IT' });
      expect(repo.update).toHaveBeenCalledWith('b1', { name: 'IT' });
      expect(result?.name).toBe('IT');
    });
  });

  describe('remove', () => {
    it('reports deleted:true when a row was affected', async () => {
      repo.delete.mockResolvedValue({ affected: 1 } as any);
      expect(await service.remove('b1')).toEqual({ deleted: true });
    });

    it('reports deleted:false when nothing was affected', async () => {
      repo.delete.mockResolvedValue({ affected: 0 } as any);
      expect(await service.remove('b1')).toEqual({ deleted: false });
    });
  });

  describe('getSummary (aggregation)', () => {
    it('aggregates department + category budgets and derives utilization', async () => {
      repo.find.mockResolvedValue([
        { name: 'IT', budgetType: 'department', budget: 1000, spent: 400, committed: 100, available: 500 },
        { name: 'Facilities', budgetType: 'department', budget: 500, spent: 100, committed: 0, available: 400 },
        { name: 'Raw Materials', budgetType: 'category', budget: 800, spent: 300 },
      ] as any);

      const summary = await service.getSummary('co-1');

      // totals: budget = 1000+500+800 = 2300; spent = 400+100+300 = 800
      expect(summary.overview.totalBudget).toBe(2300);
      expect(summary.overview.spent).toBe(800);
      expect(summary.overview.committed).toBe(100);
      // utilizationRate = round(800/2300*100) = 35
      expect(summary.overview.utilizationRate).toBe(35);

      expect(summary.departmentBudgets).toHaveLength(2);
      expect(summary.categoryBudgets).toHaveLength(1);
      // category variance = 800 - 300 = 500
      expect(summary.categoryBudgets[0].variance).toBe(500);
    });

    it('derives available from budget - spent - committed when not stored', async () => {
      repo.find.mockResolvedValue([
        { name: 'Ops', budgetType: 'department', budget: 1000, spent: 200, committed: 300 },
      ] as any);
      const summary = await service.getSummary('co-1');
      // available = 1000 - 200 - 300 = 500
      expect(summary.departmentBudgets[0].available).toBe(500);
      expect(summary.overview.available).toBe(500);
    });

    it('returns zero utilization for an empty budget set', async () => {
      repo.find.mockResolvedValue([]);
      const summary = await service.getSummary('co-1');
      expect(summary.overview.totalBudget).toBe(0);
      expect(summary.overview.utilizationRate).toBe(0);
    });
  });
});
