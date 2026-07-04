import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { PayrollStatutoryFilingService } from '../../src/modules/hr/services/payroll-statutory-filing.service';
import { PayrollStatutoryFiling } from '../../src/modules/hr/entities/payroll-statutory-filing.entity';
import { createMockRepository } from '../utils/test-setup';

/** Builds a chainable query-builder mock whose getMany resolves to `rows`. */
function makeQb(rows: any[]) {
  const qb: any = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue(rows),
  };
  return qb;
}

describe('PayrollStatutoryFilingService', () => {
  let service: PayrollStatutoryFilingService;
  let repo: ReturnType<typeof createMockRepository>;

  beforeEach(async () => {
    repo = createMockRepository<PayrollStatutoryFiling>();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PayrollStatutoryFilingService,
        { provide: getRepositoryToken(PayrollStatutoryFiling), useValue: repo },
      ],
    }).compile();
    service = module.get(PayrollStatutoryFilingService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('findAll', () => {
    it('defaults companyId to company-1 and returns rows', async () => {
      const rows = [{ id: 'f1' }, { id: 'f2' }];
      const qb = makeQb(rows);
      (repo.createQueryBuilder as jest.Mock).mockReturnValue(qb);

      const result = await service.findAll();

      expect(qb.where).toHaveBeenCalledWith('row.companyId = :companyId', {
        companyId: 'company-1',
      });
      expect(result).toEqual(rows);
    });

    it('applies category, status and search filters', async () => {
      const qb = makeQb([]);
      (repo.createQueryBuilder as jest.Mock).mockReturnValue(qb);

      await service.findAll({
        companyId: 'c9',
        category: 'PF',
        status: 'Filed',
        search: 'John',
      });

      expect(qb.where).toHaveBeenCalledWith('row.companyId = :companyId', {
        companyId: 'c9',
      });
      expect(qb.andWhere).toHaveBeenCalledWith('row.category = :category', {
        category: 'PF',
      });
      expect(qb.andWhere).toHaveBeenCalledWith('row.status = :status', {
        status: 'Filed',
      });
      expect(qb.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('LIKE :search'),
        { search: '%john%' },
      );
    });
  });

  describe('findOne', () => {
    it('returns the entity when found', async () => {
      const entity = { id: 'f1' } as any;
      repo.findOne.mockResolvedValue(entity);
      await expect(service.findOne('f1')).resolves.toBe(entity);
      expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 'f1' } });
    });

    it('throws NotFoundException when missing', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.findOne('nope')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('defaults companyId and saves the created entity', async () => {
      const dto = { employeeName: 'Ann' } as any;
      const built = { ...dto, companyId: 'company-1' };
      repo.create.mockReturnValue(built as any);
      repo.save.mockResolvedValue(built as any);

      const result = await service.create(dto);

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ companyId: 'company-1', employeeName: 'Ann' }),
      );
      expect(repo.save).toHaveBeenCalledWith(built);
      expect(result).toBe(built);
    });

    it('keeps an explicit companyId', async () => {
      repo.create.mockImplementation((x: any) => x);
      repo.save.mockImplementation(async (x: any) => x);
      await service.create({ companyId: 'c42' } as any);
      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ companyId: 'c42' }),
      );
    });
  });

  describe('update', () => {
    it('merges data into the found entity and saves', async () => {
      const entity: any = { id: 'f1', status: 'Draft' };
      repo.findOne.mockResolvedValue(entity);
      repo.save.mockImplementation(async (x: any) => x);

      const result = await service.update('f1', { status: 'Filed' } as any);

      expect(result.status).toBe('Filed');
      expect(repo.save).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'f1', status: 'Filed' }),
      );
    });

    it('throws when target is missing', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.update('x', {} as any)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('removes the found entity', async () => {
      const entity: any = { id: 'f1' };
      repo.findOne.mockResolvedValue(entity);
      repo.remove.mockResolvedValue(entity);
      await service.remove('f1');
      expect(repo.remove).toHaveBeenCalledWith(entity);
    });

    it('throws when target is missing', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.remove('x')).rejects.toThrow(NotFoundException);
    });
  });
});
