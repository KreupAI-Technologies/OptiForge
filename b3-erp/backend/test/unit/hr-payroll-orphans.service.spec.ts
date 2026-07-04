import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { PayrollSalaryRevisionService } from '../../src/modules/hr/services/payroll-salary-revision.service';
import { PayrollSalaryRevision } from '../../src/modules/hr/entities/payroll-salary-revision.entity';
import { PayrollDisbursementService } from '../../src/modules/hr/services/payroll-disbursement.service';
import { PayrollDisbursement } from '../../src/modules/hr/entities/payroll-disbursement.entity';
import { PayrollReportService } from '../../src/modules/hr/services/payroll-report.service';
import { PayrollReport } from '../../src/modules/hr/entities/payroll-report.entity';
import { createMockRepository } from '../utils/test-setup';

function makeQb(rows: any[]) {
  return {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue(rows),
  } as any;
}

describe('PayrollSalaryRevisionService', () => {
  let service: PayrollSalaryRevisionService;
  let repo: ReturnType<typeof createMockRepository>;

  beforeEach(async () => {
    repo = createMockRepository<PayrollSalaryRevision>();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PayrollSalaryRevisionService,
        { provide: getRepositoryToken(PayrollSalaryRevision), useValue: repo },
      ],
    }).compile();
    service = module.get(PayrollSalaryRevisionService);
  });
  afterEach(() => jest.clearAllMocks());

  it('findAll defaults companyId and returns mapped rows', async () => {
    const qb = makeQb([{ id: 'r1' }]);
    (repo.createQueryBuilder as jest.Mock).mockReturnValue(qb);
    const result = await service.findAll({ status: 'Approved' });
    expect(qb.where).toHaveBeenCalledWith('row.companyId = :companyId', {
      companyId: 'company-1',
    });
    expect(qb.andWhere).toHaveBeenCalledWith('row.status = :status', {
      status: 'Approved',
    });
    expect(result).toEqual([{ id: 'r1' }]);
  });

  it('findOne throws when missing', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(service.findOne('x')).rejects.toThrow(NotFoundException);
  });

  it('create defaults companyId and saves', async () => {
    repo.create.mockImplementation((x: any) => x);
    repo.save.mockImplementation(async (x: any) => x);
    const result = await service.create({ newSalary: 90000 } as any);
    expect(result).toEqual(
      expect.objectContaining({ companyId: 'company-1', newSalary: 90000 }),
    );
  });
});

describe('PayrollDisbursementService', () => {
  let service: PayrollDisbursementService;
  let repo: ReturnType<typeof createMockRepository>;

  beforeEach(async () => {
    repo = createMockRepository<PayrollDisbursement>();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PayrollDisbursementService,
        { provide: getRepositoryToken(PayrollDisbursement), useValue: repo },
      ],
    }).compile();
    service = module.get(PayrollDisbursementService);
  });
  afterEach(() => jest.clearAllMocks());

  it('findAll applies period filter', async () => {
    const qb = makeQb([]);
    (repo.createQueryBuilder as jest.Mock).mockReturnValue(qb);
    await service.findAll({ period: '2025-06' });
    expect(qb.andWhere).toHaveBeenCalledWith('row.period = :period', {
      period: '2025-06',
    });
  });

  it('update merges and saves', async () => {
    const entity: any = { id: 'd1', status: 'Pending' };
    repo.findOne.mockResolvedValue(entity);
    repo.save.mockImplementation(async (x: any) => x);
    const result = await service.update('d1', { status: 'Paid' } as any);
    expect(result.status).toBe('Paid');
  });

  it('remove throws when missing', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(service.remove('x')).rejects.toThrow(NotFoundException);
  });
});

describe('PayrollReportService', () => {
  let service: PayrollReportService;
  let repo: ReturnType<typeof createMockRepository>;

  beforeEach(async () => {
    repo = createMockRepository<PayrollReport>();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PayrollReportService,
        { provide: getRepositoryToken(PayrollReport), useValue: repo },
      ],
    }).compile();
    service = module.get(PayrollReportService);
  });
  afterEach(() => jest.clearAllMocks());

  it('findAll applies department + period filters', async () => {
    const qb = makeQb([{ id: 'p1' }]);
    (repo.createQueryBuilder as jest.Mock).mockReturnValue(qb);
    const result = await service.findAll({
      department: 'Ops',
      period: '2025-06',
    });
    expect(qb.andWhere).toHaveBeenCalledWith('row.department = :department', {
      department: 'Ops',
    });
    expect(qb.andWhere).toHaveBeenCalledWith('row.period = :period', {
      period: '2025-06',
    });
    expect(result).toEqual([{ id: 'p1' }]);
  });

  it('findOne returns entity when found', async () => {
    const entity: any = { id: 'p1' };
    repo.findOne.mockResolvedValue(entity);
    await expect(service.findOne('p1')).resolves.toBe(entity);
  });

  it('create defaults companyId and saves', async () => {
    repo.create.mockImplementation((x: any) => x);
    repo.save.mockImplementation(async (x: any) => x);
    const result = await service.create({ reportName: 'PF' } as any);
    expect(result).toEqual(
      expect.objectContaining({ companyId: 'company-1', reportName: 'PF' }),
    );
  });
});
