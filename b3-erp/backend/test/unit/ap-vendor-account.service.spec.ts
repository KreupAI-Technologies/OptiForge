import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { ApVendorAccountService } from '../../src/modules/finance/services/ap-vendor-account.service';
import { ApVendorAccount } from '../../src/modules/finance/entities/ap-vendor-account.entity';
import { createMockRepository } from '../utils/test-setup';

describe('ApVendorAccountService', () => {
  let service: ApVendorAccountService;
  let repo: jest.Mocked<Repository<ApVendorAccount>>;

  beforeEach(async () => {
    repo = createMockRepository<ApVendorAccount>();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApVendorAccountService,
        { provide: getRepositoryToken(ApVendorAccount), useValue: repo },
      ],
    }).compile();
    service = module.get(ApVendorAccountService);
  });

  it('findAll returns rows ordered by createdAt DESC', async () => {
    const rows = [{ id: '1' }, { id: '2' }] as any;
    repo.find.mockResolvedValue(rows);
    const result = await service.findAll();
    expect(result).toBe(rows);
    expect(repo.find).toHaveBeenCalledWith({ order: { createdAt: 'DESC' } });
  });

  it('findOne throws NotFound when missing', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(service.findOne('x')).rejects.toThrow(NotFoundException);
  });

  it('create persists the created entity', async () => {
    const dto = { vendorName: 'ACME' } as any;
    const entity = { id: 'v1', ...dto };
    repo.create.mockReturnValue(entity);
    repo.save.mockResolvedValue(entity);
    const result = await service.create(dto);
    expect(repo.create).toHaveBeenCalledWith(dto);
    expect(result).toBe(entity);
  });

  it('update merges data onto the existing row', async () => {
    const existing = { id: 'v1', totalOutstanding: 0 } as any;
    repo.findOne.mockResolvedValue(existing);
    repo.save.mockImplementation(async (e: any) => e);
    const result = await service.update('v1', { totalOutstanding: 500 } as any);
    expect(result.totalOutstanding).toBe(500);
  });

  it('remove returns success and calls repo.remove', async () => {
    const existing = { id: 'v1' } as any;
    repo.findOne.mockResolvedValue(existing);
    repo.remove.mockResolvedValue(existing);
    const result = await service.remove('v1');
    expect(result).toEqual({ success: true });
    expect(repo.remove).toHaveBeenCalledWith(existing);
  });
});
