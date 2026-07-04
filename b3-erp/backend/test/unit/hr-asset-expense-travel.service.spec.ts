import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { AssetItemService } from '../../src/modules/hr/services/asset-item.service';
import { AssetItem } from '../../src/modules/hr/entities/asset-item.entity';
import { ExpenseClaimService } from '../../src/modules/hr/services/expense-claim.service';
import { ExpenseClaim } from '../../src/modules/hr/entities/expense-claim.entity';
import { TravelRequestService } from '../../src/modules/hr/services/travel-request.service';
import { TravelRequest } from '../../src/modules/hr/entities/travel-request.entity';
import { createMockRepository } from '../utils/test-setup';

describe('AssetItemService', () => {
  let service: AssetItemService;
  let repo: ReturnType<typeof createMockRepository>;

  beforeEach(async () => {
    repo = createMockRepository<AssetItem>();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssetItemService,
        { provide: getRepositoryToken(AssetItem), useValue: repo },
      ],
    }).compile();
    service = module.get(AssetItemService);
  });
  afterEach(() => jest.clearAllMocks());

  it('findAll orders by assetTag and applies assetClass filter', async () => {
    const rows = [{ id: 'a1' }];
    repo.find.mockResolvedValue(rows as any);
    const result = await service.findAll('c1', 'IT-Equipment');
    expect(repo.find).toHaveBeenCalledWith({
      where: { companyId: 'c1', assetClass: 'IT-Equipment' },
      order: { assetTag: 'ASC' },
    });
    expect(result).toEqual(rows);
  });

  it('findAll without assetClass scopes to companyId only', async () => {
    repo.find.mockResolvedValue([] as any);
    await service.findAll('c1');
    expect(repo.find).toHaveBeenCalledWith({
      where: { companyId: 'c1' },
      order: { assetTag: 'ASC' },
    });
  });

  it('findOne throws when missing', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(service.findOne('x')).rejects.toThrow(NotFoundException);
  });

  it('create saves the constructed entity', async () => {
    const dto = { companyId: 'c1', assetTag: 'AST-1' } as any;
    repo.create.mockReturnValue(dto);
    repo.save.mockResolvedValue(dto);
    const result = await service.create(dto);
    expect(repo.save).toHaveBeenCalledWith(dto);
    expect(result).toBe(dto);
  });
});

describe('ExpenseClaimService', () => {
  let service: ExpenseClaimService;
  let repo: ReturnType<typeof createMockRepository>;

  beforeEach(async () => {
    repo = createMockRepository<ExpenseClaim>();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpenseClaimService,
        { provide: getRepositoryToken(ExpenseClaim), useValue: repo },
      ],
    }).compile();
    service = module.get(ExpenseClaimService);
  });
  afterEach(() => jest.clearAllMocks());

  it('findAll applies kind + status filters', async () => {
    repo.find.mockResolvedValue([{ id: 'e1' }] as any);
    const result = await service.findAll('c1', {
      kind: 'reimbursement',
      status: 'Pending',
    });
    expect(repo.find).toHaveBeenCalledWith({
      where: { companyId: 'c1', kind: 'reimbursement', status: 'Pending' },
      order: { createdAt: 'DESC' },
    });
    expect(result).toEqual([{ id: 'e1' }]);
  });

  it('update merges data and saves', async () => {
    const entity: any = { id: 'e1', status: 'Pending' };
    repo.findOne.mockResolvedValue(entity);
    repo.save.mockImplementation(async (x: any) => x);
    const result = await service.update('e1', { status: 'Approved' } as any);
    expect(result.status).toBe('Approved');
  });

  it('remove throws when missing', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(service.remove('x')).rejects.toThrow(NotFoundException);
  });
});

describe('TravelRequestService', () => {
  let service: TravelRequestService;
  let repo: ReturnType<typeof createMockRepository>;

  beforeEach(async () => {
    repo = createMockRepository<TravelRequest>();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TravelRequestService,
        { provide: getRepositoryToken(TravelRequest), useValue: repo },
      ],
    }).compile();
    service = module.get(TravelRequestService);
  });
  afterEach(() => jest.clearAllMocks());

  it('findAll applies status filter', async () => {
    repo.find.mockResolvedValue([{ id: 'tr1' }] as any);
    const result = await service.findAll('c1', 'Approved');
    expect(repo.find).toHaveBeenCalledWith({
      where: { companyId: 'c1', status: 'Approved' },
      order: { createdAt: 'DESC' },
    });
    expect(result).toEqual([{ id: 'tr1' }]);
  });

  it('findOne throws when missing', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(service.findOne('x')).rejects.toThrow(NotFoundException);
  });

  it('create saves the constructed entity', async () => {
    const dto = { companyId: 'c1', destination: 'Pune' } as any;
    repo.create.mockReturnValue(dto);
    repo.save.mockResolvedValue(dto);
    const result = await service.create(dto);
    expect(repo.save).toHaveBeenCalledWith(dto);
    expect(result).toBe(dto);
  });
});
