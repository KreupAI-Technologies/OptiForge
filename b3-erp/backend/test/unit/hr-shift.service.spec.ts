import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { ShiftAssignmentService } from '../../src/modules/hr/services/shift-assignment.service';
import { ShiftAssignment } from '../../src/modules/hr/entities/shift-assignment.entity';
import { ShiftRosterService } from '../../src/modules/hr/services/shift-roster.service';
import { ShiftRosterEntry } from '../../src/modules/hr/entities/shift-roster-entry.entity';
import { ShiftSwapService } from '../../src/modules/hr/services/shift-swap.service';
import { ShiftSwap } from '../../src/modules/hr/entities/shift-swap.entity';
import { createMockRepository } from '../utils/test-setup';

describe('ShiftAssignmentService', () => {
  let service: ShiftAssignmentService;
  let repo: ReturnType<typeof createMockRepository>;

  beforeEach(async () => {
    repo = createMockRepository<ShiftAssignment>();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShiftAssignmentService,
        { provide: getRepositoryToken(ShiftAssignment), useValue: repo },
      ],
    }).compile();
    service = module.get(ShiftAssignmentService);
  });
  afterEach(() => jest.clearAllMocks());

  it('findAll scopes to companyId with ordering', async () => {
    const rows = [{ id: 's1' }, { id: 's2' }];
    repo.find.mockResolvedValue(rows as any);
    const result = await service.findAll('c1');
    expect(repo.find).toHaveBeenCalledWith({
      where: { companyId: 'c1' },
      order: { effectiveFrom: 'DESC', employeeName: 'ASC' },
    });
    expect(result).toEqual(rows);
  });

  it('findOne throws when missing', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(service.findOne('x')).rejects.toThrow(NotFoundException);
  });

  it('create saves the constructed entity', async () => {
    const dto = { companyId: 'c1', employeeName: 'Ann' } as any;
    repo.create.mockReturnValue(dto);
    repo.save.mockResolvedValue(dto);
    const result = await service.create(dto);
    expect(repo.create).toHaveBeenCalledWith(dto);
    expect(repo.save).toHaveBeenCalledWith(dto);
    expect(result).toBe(dto);
  });

  it('update merges data and saves', async () => {
    const entity: any = { id: 's1', status: 'Active' };
    repo.findOne.mockResolvedValue(entity);
    repo.save.mockImplementation(async (x: any) => x);
    const result = await service.update('s1', { status: 'Inactive' } as any);
    expect(result.status).toBe('Inactive');
  });
});

describe('ShiftRosterService', () => {
  let service: ShiftRosterService;
  let repo: ReturnType<typeof createMockRepository>;

  beforeEach(async () => {
    repo = createMockRepository<ShiftRosterEntry>();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShiftRosterService,
        { provide: getRepositoryToken(ShiftRosterEntry), useValue: repo },
      ],
    }).compile();
    service = module.get(ShiftRosterService);
  });
  afterEach(() => jest.clearAllMocks());

  it('findAll orders by department then employeeName', async () => {
    repo.find.mockResolvedValue([] as any);
    await service.findAll('c1');
    expect(repo.find).toHaveBeenCalledWith({
      where: { companyId: 'c1' },
      order: { department: 'ASC', employeeName: 'ASC' },
    });
  });

  it('remove deletes the found entity', async () => {
    const entity: any = { id: 'r1' };
    repo.findOne.mockResolvedValue(entity);
    repo.remove.mockResolvedValue(entity);
    await service.remove('r1');
    expect(repo.remove).toHaveBeenCalledWith(entity);
  });

  it('remove throws when missing', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(service.remove('x')).rejects.toThrow(NotFoundException);
  });
});

describe('ShiftSwapService', () => {
  let service: ShiftSwapService;
  let repo: ReturnType<typeof createMockRepository>;

  beforeEach(async () => {
    repo = createMockRepository<ShiftSwap>();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShiftSwapService,
        { provide: getRepositoryToken(ShiftSwap), useValue: repo },
      ],
    }).compile();
    service = module.get(ShiftSwapService);
  });
  afterEach(() => jest.clearAllMocks());

  it('findAll orders by requestDate DESC', async () => {
    const rows = [{ id: 'sw1' }];
    repo.find.mockResolvedValue(rows as any);
    const result = await service.findAll('c1');
    expect(repo.find).toHaveBeenCalledWith({
      where: { companyId: 'c1' },
      order: { requestDate: 'DESC' },
    });
    expect(result).toEqual(rows);
  });

  it('update throws when missing', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(service.update('x', {} as any)).rejects.toThrow(
      NotFoundException,
    );
  });
});
