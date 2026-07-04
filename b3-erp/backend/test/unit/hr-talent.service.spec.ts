import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { SuccessionPlanService } from '../../src/modules/hr/services/succession-plan.service';
import { SuccessionPlan } from '../../src/modules/hr/entities/succession-plan.entity';
import { ProbationReviewService } from '../../src/modules/hr/services/probation-review.service';
import { ProbationReview } from '../../src/modules/hr/entities/probation-review.entity';
import { PerformanceGoalService } from '../../src/modules/hr/services/performance-goal.service';
import { PerformanceGoal } from '../../src/modules/hr/entities/performance-goal.entity';
import { createMockRepository } from '../utils/test-setup';

describe('SuccessionPlanService', () => {
  let service: SuccessionPlanService;
  let repo: ReturnType<typeof createMockRepository>;

  beforeEach(async () => {
    repo = createMockRepository<SuccessionPlan>();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SuccessionPlanService,
        { provide: getRepositoryToken(SuccessionPlan), useValue: repo },
      ],
    }).compile();
    service = module.get(SuccessionPlanService);
  });
  afterEach(() => jest.clearAllMocks());

  it('findAll scopes to companyId only when recordType absent', async () => {
    repo.find.mockResolvedValue([] as any);
    await service.findAll('c1');
    expect(repo.find).toHaveBeenCalledWith({
      where: { companyId: 'c1' },
      order: { createdAt: 'DESC' },
    });
  });

  it('findAll adds recordType to the where clause', async () => {
    repo.find.mockResolvedValue([{ id: 'p1' }] as any);
    const result = await service.findAll('c1', 'critical-role');
    expect(repo.find).toHaveBeenCalledWith({
      where: { companyId: 'c1', recordType: 'critical-role' },
      order: { createdAt: 'DESC' },
    });
    expect(result).toEqual([{ id: 'p1' }]);
  });

  it('findOne throws when missing', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(service.findOne('x')).rejects.toThrow(NotFoundException);
  });

  it('create saves the constructed entity', async () => {
    const dto = { companyId: 'c1', recordType: 'plan' } as any;
    repo.create.mockReturnValue(dto);
    repo.save.mockResolvedValue(dto);
    const result = await service.create(dto);
    expect(repo.save).toHaveBeenCalledWith(dto);
    expect(result).toBe(dto);
  });
});

describe('ProbationReviewService', () => {
  let service: ProbationReviewService;
  let repo: ReturnType<typeof createMockRepository>;

  beforeEach(async () => {
    repo = createMockRepository<ProbationReview>();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProbationReviewService,
        { provide: getRepositoryToken(ProbationReview), useValue: repo },
      ],
    }).compile();
    service = module.get(ProbationReviewService);
  });
  afterEach(() => jest.clearAllMocks());

  it('findAll filters on recordType', async () => {
    repo.find.mockResolvedValue([] as any);
    await service.findAll('c1', 'review');
    expect(repo.find).toHaveBeenCalledWith({
      where: { companyId: 'c1', recordType: 'review' },
      order: { createdAt: 'DESC' },
    });
  });

  it('update merges data and saves', async () => {
    const entity: any = { id: 'pr1', status: 'Pending' };
    repo.findOne.mockResolvedValue(entity);
    repo.save.mockImplementation(async (x: any) => x);
    const result = await service.update('pr1', { status: 'Confirmed' } as any);
    expect(result.status).toBe('Confirmed');
  });

  it('remove throws when missing', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(service.remove('x')).rejects.toThrow(NotFoundException);
  });
});

describe('PerformanceGoalService', () => {
  let service: PerformanceGoalService;
  let repo: ReturnType<typeof createMockRepository>;

  beforeEach(async () => {
    repo = createMockRepository<PerformanceGoal>();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PerformanceGoalService,
        { provide: getRepositoryToken(PerformanceGoal), useValue: repo },
      ],
    }).compile();
    service = module.get(PerformanceGoalService);
  });
  afterEach(() => jest.clearAllMocks());

  it('findAll scopes to companyId', async () => {
    const rows = [{ id: 'g1' }];
    repo.find.mockResolvedValue(rows as any);
    const result = await service.findAll('c1');
    expect(repo.find).toHaveBeenCalledWith({
      where: { companyId: 'c1' },
      order: { createdAt: 'DESC' },
    });
    expect(result).toEqual(rows);
  });

  it('findOne returns entity when found', async () => {
    const entity: any = { id: 'g1' };
    repo.findOne.mockResolvedValue(entity);
    await expect(service.findOne('g1')).resolves.toBe(entity);
  });
});
