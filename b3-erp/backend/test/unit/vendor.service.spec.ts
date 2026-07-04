import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { VendorService } from '../../src/modules/procurement/services/vendor.service';
import { Vendor } from '../../src/modules/procurement/entities/vendor.entity';
import { createMockRepository } from '../utils/test-setup';

function makeQb() {
  return {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
  } as any;
}

describe('VendorService', () => {
  let service: VendorService;
  let repo: jest.Mocked<Repository<Vendor>>;
  let qb: any;

  beforeEach(async () => {
    repo = createMockRepository<Vendor>();
    qb = makeQb();
    repo.createQueryBuilder.mockReturnValue(qb);
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VendorService,
        { provide: getRepositoryToken(Vendor), useValue: repo },
      ],
    }).compile();
    service = module.get(VendorService);
  });

  describe('create', () => {
    it('injects companyId into the entity before saving', async () => {
      repo.create.mockImplementation((d: any) => d);
      repo.save.mockImplementation(async (d: any) => d);
      const result = await service.create('co-1', { legalName: 'ACME' } as any);
      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ companyId: 'co-1', legalName: 'ACME' }),
      );
      expect((result as any).companyId).toBe('co-1');
    });
  });

  describe('findAll', () => {
    it('scopes by company and returns data with total', async () => {
      qb.getManyAndCount.mockResolvedValue([[{ id: 'v1' }, { id: 'v2' }], 2]);
      const result = await service.findAll('co-1');
      expect(qb.where).toHaveBeenCalledWith('vendor.companyId = :companyId', { companyId: 'co-1' });
      expect(result).toEqual({ data: [{ id: 'v1' }, { id: 'v2' }], total: 2 });
    });

    it('applies status and search filters when provided', async () => {
      qb.getManyAndCount.mockResolvedValue([[], 0]);
      await service.findAll('co-1', { status: 'active', search: 'acme' });
      expect(qb.andWhere).toHaveBeenCalledWith('vendor.status = :status', { status: 'active' });
      expect(qb.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('ILIKE :search'),
        { search: '%acme%' },
      );
    });
  });

  describe('findOne', () => {
    it('scopes lookup by both id and companyId', async () => {
      repo.findOne.mockResolvedValue({ id: 'v1' } as any);
      await service.findOne('co-1', 'v1');
      expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 'v1', companyId: 'co-1' } });
    });

    it('throws NotFound when vendor missing for company', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.findOne('co-1', 'nope')).rejects.toThrow(NotFoundException);
    });
  });

  describe('approve', () => {
    it('sets status active and saves', async () => {
      const vendor: any = { id: 'v1', companyId: 'co-1', status: 'pending' };
      repo.findOne.mockResolvedValue(vendor);
      repo.save.mockImplementation(async (e: any) => e);
      const result = await service.approve('co-1', 'v1');
      expect(result.status).toBe('active');
    });
  });

  describe('delete', () => {
    it('removes an existing company-scoped vendor', async () => {
      const vendor: any = { id: 'v1', companyId: 'co-1' };
      repo.findOne.mockResolvedValue(vendor);
      repo.remove.mockResolvedValue(vendor);
      await service.delete('co-1', 'v1');
      expect(repo.remove).toHaveBeenCalledWith(vendor);
    });
  });
});
