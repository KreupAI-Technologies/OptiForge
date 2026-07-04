import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { AttendanceRecordService } from '../../src/modules/hr/services/attendance-record.service';
import { AttendanceRecord } from '../../src/modules/hr/entities/attendance-record.entity';
import { EmployeeMovementService } from '../../src/modules/hr/services/employee-movement.service';
import { EmployeeMovement } from '../../src/modules/hr/entities/employee-movement.entity';
import { OnboardingTaskService } from '../../src/modules/hr/services/onboarding-task.service';
import { OnboardingTask } from '../../src/modules/hr/entities/onboarding-task.entity';
import { OffboardingTaskService } from '../../src/modules/hr/services/offboarding-task.service';
import { OffboardingTask } from '../../src/modules/hr/entities/offboarding-task.entity';
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

describe('AttendanceRecordService', () => {
  let service: AttendanceRecordService;
  let repo: ReturnType<typeof createMockRepository>;

  beforeEach(async () => {
    repo = createMockRepository<AttendanceRecord>();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttendanceRecordService,
        { provide: getRepositoryToken(AttendanceRecord), useValue: repo },
      ],
    }).compile();
    service = module.get(AttendanceRecordService);
  });
  afterEach(() => jest.clearAllMocks());

  it('findAll filters on department + period', async () => {
    const qb = makeQb([{ id: 'a1' }]);
    (repo.createQueryBuilder as jest.Mock).mockReturnValue(qb);
    const result = await service.findAll({
      department: 'Kitchen',
      period: '2025-06',
    });
    expect(qb.where).toHaveBeenCalledWith('row.companyId = :companyId', {
      companyId: 'company-1',
    });
    expect(qb.andWhere).toHaveBeenCalledWith('row.department = :department', {
      department: 'Kitchen',
    });
    expect(qb.andWhere).toHaveBeenCalledWith('row.period = :period', {
      period: '2025-06',
    });
    expect(result).toEqual([{ id: 'a1' }]);
  });

  it('findOne throws when missing', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(service.findOne('x')).rejects.toThrow(NotFoundException);
  });

  it('create defaults companyId and saves', async () => {
    repo.create.mockImplementation((x: any) => x);
    repo.save.mockImplementation(async (x: any) => x);
    const result = await service.create({ present: 22 } as any);
    expect(result).toEqual(
      expect.objectContaining({ companyId: 'company-1', present: 22 }),
    );
  });
});

describe('EmployeeMovementService', () => {
  let service: EmployeeMovementService;
  let repo: ReturnType<typeof createMockRepository>;

  beforeEach(async () => {
    repo = createMockRepository<EmployeeMovement>();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeeMovementService,
        { provide: getRepositoryToken(EmployeeMovement), useValue: repo },
      ],
    }).compile();
    service = module.get(EmployeeMovementService);
  });
  afterEach(() => jest.clearAllMocks());

  it('findAll filters on type + status using movement alias', async () => {
    const qb = makeQb([{ id: 'm1' }]);
    (repo.createQueryBuilder as jest.Mock).mockReturnValue(qb);
    const result = await service.findAll({
      type: 'Transfer',
      status: 'Approved',
    });
    expect(qb.where).toHaveBeenCalledWith('movement.companyId = :companyId', {
      companyId: 'company-1',
    });
    expect(qb.andWhere).toHaveBeenCalledWith('movement.type = :type', {
      type: 'Transfer',
    });
    expect(qb.andWhere).toHaveBeenCalledWith('movement.status = :status', {
      status: 'Approved',
    });
    expect(result).toEqual([{ id: 'm1' }]);
  });

  it('update throws when missing', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(service.update('x', {} as any)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('remove deletes the found entity', async () => {
    const entity: any = { id: 'm1' };
    repo.findOne.mockResolvedValue(entity);
    repo.remove.mockResolvedValue(entity);
    await service.remove('m1');
    expect(repo.remove).toHaveBeenCalledWith(entity);
  });
});

describe('OnboardingTaskService', () => {
  let service: OnboardingTaskService;
  let repo: ReturnType<typeof createMockRepository>;

  beforeEach(async () => {
    repo = createMockRepository<OnboardingTask>();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OnboardingTaskService,
        { provide: getRepositoryToken(OnboardingTask), useValue: repo },
      ],
    }).compile();
    service = module.get(OnboardingTaskService);
  });
  afterEach(() => jest.clearAllMocks());

  it('findAll filters on feature + department using task alias', async () => {
    const qb = makeQb([{ id: 'o1' }]);
    (repo.createQueryBuilder as jest.Mock).mockReturnValue(qb);
    const result = await service.findAll({
      feature: 'Docs',
      department: 'IT',
    });
    expect(qb.where).toHaveBeenCalledWith('task.companyId = :companyId', {
      companyId: 'company-1',
    });
    expect(qb.andWhere).toHaveBeenCalledWith('task.feature = :feature', {
      feature: 'Docs',
    });
    expect(qb.andWhere).toHaveBeenCalledWith('task.department = :department', {
      department: 'IT',
    });
    expect(result).toEqual([{ id: 'o1' }]);
  });

  it('create defaults companyId and saves', async () => {
    repo.create.mockImplementation((x: any) => x);
    repo.save.mockImplementation(async (x: any) => x);
    const result = await service.create({ taskName: 'ID card' } as any);
    expect(result).toEqual(
      expect.objectContaining({ companyId: 'company-1', taskName: 'ID card' }),
    );
  });
});

describe('OffboardingTaskService', () => {
  let service: OffboardingTaskService;
  let repo: ReturnType<typeof createMockRepository>;

  beforeEach(async () => {
    repo = createMockRepository<OffboardingTask>();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OffboardingTaskService,
        { provide: getRepositoryToken(OffboardingTask), useValue: repo },
      ],
    }).compile();
    service = module.get(OffboardingTaskService);
  });
  afterEach(() => jest.clearAllMocks());

  it('findAll defaults companyId', async () => {
    const qb = makeQb([{ id: 'f1' }]);
    (repo.createQueryBuilder as jest.Mock).mockReturnValue(qb);
    const result = await service.findAll();
    expect(qb.where).toHaveBeenCalledWith('task.companyId = :companyId', {
      companyId: 'company-1',
    });
    expect(result).toEqual([{ id: 'f1' }]);
  });

  it('findOne throws when missing', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(service.findOne('x')).rejects.toThrow(NotFoundException);
  });
});
