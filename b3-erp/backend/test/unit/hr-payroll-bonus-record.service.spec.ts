import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { PayrollBonusRecordService } from '../../src/modules/hr/services/payroll-bonus-record.service';
import { PayrollBonusRecord } from '../../src/modules/hr/entities/payroll-bonus-record.entity';
import { createMockRepository } from '../utils/test-setup';

function makeQb(rows: any[]) {
  return {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue(rows),
  } as any;
}

describe('PayrollBonusRecordService', () => {
  let service: PayrollBonusRecordService;
  let repo: ReturnType<typeof createMockRepository>;

  beforeEach(async () => {
    repo = createMockRepository<PayrollBonusRecord>();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PayrollBonusRecordService,
        { provide: getRepositoryToken(PayrollBonusRecord), useValue: repo },
      ],
    }).compile();
    service = module.get(PayrollBonusRecordService);
  });

  afterEach(() => jest.clearAllMocks());

  it('findAll passes explicit companyId + category filter', async () => {
    const qb = makeQb([{ id: 'b1' }]);
    (repo.createQueryBuilder as jest.Mock).mockReturnValue(qb);

    const result = await service.findAll({ companyId: 'c2', category: 'Diwali' });

    expect(qb.where).toHaveBeenCalledWith('row.companyId = :companyId', {
      companyId: 'c2',
    });
    expect(qb.andWhere).toHaveBeenCalledWith('row.category = :category', {
      category: 'Diwali',
    });
    expect(result).toEqual([{ id: 'b1' }]);
  });

  it('findOne throws NotFoundException when missing', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(service.findOne('x')).rejects.toThrow(NotFoundException);
  });

  it('create defaults companyId and saves', async () => {
    repo.create.mockImplementation((x: any) => x);
    repo.save.mockImplementation(async (x: any) => x);
    const result = await service.create({ amount: 5000 } as any);
    expect(result).toEqual(
      expect.objectContaining({ companyId: 'company-1', amount: 5000 }),
    );
  });

  it('update throws NotFoundException when missing', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(service.update('x', {} as any)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('remove deletes the found entity', async () => {
    const entity: any = { id: 'b1' };
    repo.findOne.mockResolvedValue(entity);
    repo.remove.mockResolvedValue(entity);
    await service.remove('b1');
    expect(repo.remove).toHaveBeenCalledWith(entity);
  });
});
