import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { WarehouseService } from '../../src/modules/inventory/services/warehouse.service';
import { Warehouse } from '../../src/modules/inventory/entities/warehouse.entity';
import { PrismaService } from '../../src/modules/prisma/prisma.service';
import { createMockRepository } from '../utils/test-setup';

describe('WarehouseService', () => {
  let service: WarehouseService;
  let repo: ReturnType<typeof createMockRepository>;
  let prisma: any;

  beforeEach(async () => {
    repo = createMockRepository<Warehouse>();
    prisma = {
      stockBalance: {
        aggregate: jest.fn(),
        count: jest.fn(),
      },
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WarehouseService,
        { provide: getRepositoryToken(Warehouse), useValue: repo },
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = module.get(WarehouseService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('rejects a duplicate warehouse code', async () => {
      repo.findOne.mockResolvedValue({ id: 'w1' } as any);
      await expect(
        service.create({ warehouseCode: 'WH-1' } as any),
      ).rejects.toThrow(BadRequestException);
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('creates with defaulted status/type/utilization', async () => {
      repo.findOne.mockResolvedValue(null);
      repo.create.mockImplementation((x: any) => x);
      repo.save.mockImplementation(async (x: any) => ({ id: 'w1', ...x }));

      const result = await service.create({
        warehouseCode: 'WH-1',
        warehouseName: 'Main',
      } as any);

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'Active',
          warehouseType: 'Main Warehouse',
          currentUtilization: 0,
        }),
      );
      expect(result.warehouseCode).toBe('WH-1');
    });
  });

  describe('findAll', () => {
    it('maps status/type/branchId filters into the where clause', async () => {
      repo.find.mockResolvedValue([{ id: 'w1' }] as any);
      const result = await service.findAll({
        status: 'Active',
        type: 'Cold Storage',
        branchId: 'b1',
      });
      expect(repo.find).toHaveBeenCalledWith({
        where: {
          status: 'Active',
          warehouseType: 'Cold Storage',
          branchId: 'b1',
        },
        order: { warehouseName: 'ASC' },
      });
      expect(result).toEqual([{ id: 'w1' }]);
    });
  });

  describe('findOne', () => {
    it('returns the mapped warehouse when found', async () => {
      repo.findOne.mockResolvedValue({ id: 'w1', warehouseName: 'Main' } as any);
      const result = await service.findOne('w1');
      expect(result.id).toBe('w1');
    });

    it('throws NotFoundException when missing', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.findOne('x')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getStockSummary', () => {
    it('aggregates prisma stock balances for the warehouse', async () => {
      repo.findOne.mockResolvedValue({
        id: 'w1',
        warehouseName: 'Main',
        currentUtilization: 40,
      } as any);
      prisma.stockBalance.aggregate.mockResolvedValue({
        _sum: { totalQuantity: 100, stockValue: 5000 },
        _count: { id: 7 },
      });

      const result = await service.getStockSummary('w1');

      expect(prisma.stockBalance.aggregate).toHaveBeenCalledWith(
        expect.objectContaining({ where: { warehouseId: 'w1' } }),
      );
      expect(result).toMatchObject({
        totalItems: 7,
        totalQuantity: 100,
        totalValue: 5000,
        utilizationPercentage: 40,
      });
    });
  });

  describe('getCapacityUtilization', () => {
    it('computes available capacity from utilization percentage', async () => {
      repo.find.mockResolvedValue([
        {
          id: 'w1',
          warehouseCode: 'WH-1',
          warehouseName: 'Main',
          storageCapacity: 1000,
          currentUtilization: 25,
        },
      ] as any);

      const result = await service.getCapacityUtilization();

      expect(result[0].totalCapacity).toBe(1000);
      expect(result[0].availableCapacity).toBe(750);
    });
  });

  describe('remove', () => {
    it('blocks deletion when active stock exists', async () => {
      prisma.stockBalance.count.mockResolvedValue(3);
      await expect(service.remove('w1')).rejects.toThrow(BadRequestException);
      expect(repo.delete).not.toHaveBeenCalled();
    });

    it('deletes when no active stock', async () => {
      prisma.stockBalance.count.mockResolvedValue(0);
      repo.delete.mockResolvedValue({} as any);
      await service.remove('w1');
      expect(repo.delete).toHaveBeenCalledWith('w1');
    });
  });

  describe('activate/deactivate', () => {
    it('activate sets status Active then reloads', async () => {
      repo.update.mockResolvedValue({} as any);
      repo.findOne.mockResolvedValue({ id: 'w1', status: 'Active' } as any);
      const result = await service.activate('w1');
      expect(repo.update).toHaveBeenCalledWith('w1', { status: 'Active' });
      expect(result.status).toBe('Active');
    });
  });
});
