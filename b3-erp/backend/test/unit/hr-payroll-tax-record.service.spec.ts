import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { PayrollTaxRecordService } from '../../src/modules/hr/services/payroll-tax-record.service';
import { PayrollTaxRecord } from '../../src/modules/hr/entities/payroll-tax-record.entity';
import { createMockRepository } from '../utils/test-setup';

function makeQb(rows: any[]) {
  return {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue(rows),
  } as any;
}

describe('PayrollTaxRecordService', () => {
  let service: PayrollTaxRecordService;
  let repo: ReturnType<typeof createMockRepository>;

  beforeEach(async () => {
    repo = createMockRepository<PayrollTaxRecord>();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PayrollTaxRecordService,
        { provide: getRepositoryToken(PayrollTaxRecord), useValue: repo },
      ],
    }).compile();
    service = module.get(PayrollTaxRecordService);
  });

  afterEach(() => jest.clearAllMocks());

  it('findAll applies financialYear + status filters', async () => {
    const qb = makeQb([{ id: 't1' }]);
    (repo.createQueryBuilder as jest.Mock).mockReturnValue(qb);

    const result = await service.findAll({
      status: 'Paid',
      financialYear: '2025-26',
    });

    expect(qb.where).toHaveBeenCalledWith('row.companyId = :companyId', {
      companyId: 'company-1',
    });
    expect(qb.andWhere).toHaveBeenCalledWith('row.status = :status', {
      status: 'Paid',
    });
    expect(qb.andWhere).toHaveBeenCalledWith('row.financialYear = :fy', {
      fy: '2025-26',
    });
    expect(result).toEqual([{ id: 't1' }]);
  });

  it('findOne throws NotFoundException when missing', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(service.findOne('x')).rejects.toThrow(NotFoundException);
  });

  it('create defaults companyId and saves', async () => {
    repo.create.mockImplementation((x: any) => x);
    repo.save.mockImplementation(async (x: any) => x);
    const result = await service.create({ employeeCode: 'E1' } as any);
    expect(result).toEqual(
      expect.objectContaining({ companyId: 'company-1', employeeCode: 'E1' }),
    );
  });

  it('update merges and saves', async () => {
    const entity: any = { id: 't1', status: 'Draft' };
    repo.findOne.mockResolvedValue(entity);
    repo.save.mockImplementation(async (x: any) => x);
    const result = await service.update('t1', { status: 'Paid' } as any);
    expect(result.status).toBe('Paid');
  });

  it('remove deletes the found entity', async () => {
    const entity: any = { id: 't1' };
    repo.findOne.mockResolvedValue(entity);
    repo.remove.mockResolvedValue(entity);
    await service.remove('t1');
    expect(repo.remove).toHaveBeenCalledWith(entity);
  });
});
