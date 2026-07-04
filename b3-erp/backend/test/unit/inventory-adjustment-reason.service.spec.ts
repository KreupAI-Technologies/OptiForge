import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AdjustmentReasonService } from '../../src/modules/inventory/services/adjustment-reason.service';
import {
  AdjustmentReason,
  AdjustmentReasonStatus,
} from '../../src/modules/inventory/entities/adjustment-reason.entity';
import { createMockRepository } from '../utils/test-setup';

function makeQb(rows: any[]) {
  return {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue(rows),
  } as any;
}

describe('AdjustmentReasonService', () => {
  let service: AdjustmentReasonService;
  let repo: ReturnType<typeof createMockRepository>;

  beforeEach(async () => {
    repo = createMockRepository<AdjustmentReason>();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdjustmentReasonService,
        { provide: getRepositoryToken(AdjustmentReason), useValue: repo },
      ],
    }).compile();
    service = module.get(AdjustmentReasonService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('findAll', () => {
    it('returns rows and applies status + reasonType + search filters', async () => {
      const qb = makeQb([{ id: 'r1' }, { id: 'r2' }]);
      (repo.createQueryBuilder as jest.Mock).mockReturnValue(qb);

      const result = await service.findAll({
        status: 'Active',
        reasonType: 'Damage',
        search: 'Broken',
      });

      expect(qb.andWhere).toHaveBeenCalledWith('reason.status = :status', {
        status: 'Active',
      });
      expect(qb.andWhere).toHaveBeenCalledWith(
        'reason.reasonType = :reasonType',
        { reasonType: 'Damage' },
      );
      expect(qb.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('LIKE :search'),
        { search: '%broken%' },
      );
      expect(result).toHaveLength(2);
    });

    it('returns rows without filters', async () => {
      const qb = makeQb([]);
      (repo.createQueryBuilder as jest.Mock).mockReturnValue(qb);
      const result = await service.findAll();
      expect(qb.andWhere).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('returns the entity via repository findOne', async () => {
      repo.findOne.mockResolvedValue({ id: 'r1' } as any);
      const result = await service.findOne('r1');
      expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 'r1' } });
      expect(result).toEqual({ id: 'r1' });
    });

    it('returns null when not found (service does not throw)', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.findOne('x')).resolves.toBeNull();
    });
  });

  describe('getStatistics', () => {
    it('derives inactive from total minus active', async () => {
      repo.count
        .mockResolvedValueOnce(10) // total
        .mockResolvedValueOnce(6); // active

      const result = await service.getStatistics();

      expect(repo.count).toHaveBeenNthCalledWith(2, {
        where: { status: AdjustmentReasonStatus.ACTIVE },
      });
      expect(result).toEqual({ total: 10, active: 6, inactive: 4 });
    });
  });
});
