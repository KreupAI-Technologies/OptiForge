import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PrismaService } from '../../prisma/prisma.service';
import { Warehouse } from '../entities/warehouse.entity';
import {
  CreateWarehouseDto,
  UpdateWarehouseDto,
  WarehouseResponseDto,
} from '../dto';

@Injectable()
export class WarehouseService {
  constructor(
    // Warehouse is served via TypeORM (its DB columns include native enums that
    // the Prisma model does not model correctly). stockBalance stays on Prisma.
    @InjectRepository(Warehouse)
    private readonly warehouseRepo: Repository<Warehouse>,
    private readonly prisma: PrismaService,
  ) { }

  async create(createDto: CreateWarehouseDto): Promise<WarehouseResponseDto> {
    const existing = await this.warehouseRepo.findOne({
      where: { warehouseCode: createDto.warehouseCode },
    });

    if (existing) {
      throw new BadRequestException(
        `Warehouse with code ${createDto.warehouseCode} already exists`,
      );
    }

    const warehouse = await this.warehouseRepo.save(
      this.warehouseRepo.create({
        ...(createDto as any),
        status: (createDto as any).status || 'Active',
        warehouseType: (createDto as any).warehouseType || 'Main Warehouse',
        currentUtilization: 0,
      }),
    );

    return this.mapToResponseDto(warehouse);
  }

  async findAll(filters?: any): Promise<WarehouseResponseDto[]> {
    const where: any = {};
    if (filters?.status) where.status = filters.status;
    if (filters?.type) where.warehouseType = filters.type;
    if (filters?.branchId) where.branchId = filters.branchId;

    const warehouses = await this.warehouseRepo.find({
      where,
      order: { warehouseName: 'ASC' },
    });
    return warehouses.map((w) => this.mapToResponseDto(w));
  }

  async findActive(): Promise<WarehouseResponseDto[]> {
    const warehouses = await this.warehouseRepo.find({
      where: { status: 'Active' as any },
      order: { warehouseName: 'ASC' },
    });
    return warehouses.map((w) => this.mapToResponseDto(w));
  }

  async findOne(id: string): Promise<WarehouseResponseDto> {
    const warehouse = await this.warehouseRepo.findOne({ where: { id } });
    if (!warehouse) {
      throw new NotFoundException(`Warehouse with ID ${id} not found`);
    }
    return this.mapToResponseDto(warehouse);
  }

  async getLocations(id: string): Promise<any[]> {
    const warehouse = await this.warehouseRepo.findOne({ where: { id } });
    if (!warehouse) {
      throw new NotFoundException(`Warehouse with ID ${id} not found`);
    }
    return (warehouse as any).locations || [];
  }

  async getStockSummary(id: string): Promise<any> {
    const warehouse = await this.findOne(id);

    const balances = await this.prisma.stockBalance.aggregate({
      where: { warehouseId: id },
      _sum: { totalQuantity: true, stockValue: true },
      _count: { id: true },
    });

    return {
      warehouseId: id,
      warehouseName: warehouse.warehouseName,
      totalItems: balances._count.id,
      totalQuantity: balances._sum.totalQuantity || 0,
      totalValue: balances._sum.stockValue || 0,
      locationCount: 0,
      utilizationPercentage: warehouse.currentUtilization,
    };
  }

  async getCapacityUtilization(): Promise<any> {
    const warehouses = await this.warehouseRepo.find({
      where: { status: 'Active' as any },
    });

    return warehouses.map((w) => {
      const storageCapacity = Number(w.storageCapacity || 0);
      const currentUtilization = Number(w.currentUtilization || 0);
      return {
        warehouseId: w.id,
        warehouseCode: w.warehouseCode,
        warehouseName: w.warehouseName,
        totalCapacity: storageCapacity,
        currentUtilization,
        availableCapacity: storageCapacity > 0
          ? storageCapacity * (1 - currentUtilization / 100)
          : 0,
      };
    });
  }

  async update(
    id: string,
    updateDto: UpdateWarehouseDto,
  ): Promise<WarehouseResponseDto> {
    const existing = await this.warehouseRepo.findOne({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Warehouse with ID ${id} not found`);
    }
    await this.warehouseRepo.update(id, updateDto as any);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const stockCount = await this.prisma.stockBalance.count({
      where: {
        warehouseId: id,
        totalQuantity: { gt: 0 },
      },
    });

    if (stockCount > 0) {
      throw new BadRequestException(
        'Cannot delete warehouse with active stock',
      );
    }

    await this.warehouseRepo.delete(id);
  }

  async activate(id: string): Promise<WarehouseResponseDto> {
    await this.warehouseRepo.update(id, { status: 'Active' as any });
    return this.findOne(id);
  }

  async deactivate(id: string): Promise<WarehouseResponseDto> {
    await this.warehouseRepo.update(id, { status: 'Inactive' as any });
    return this.findOne(id);
  }

  private mapToResponseDto(warehouse: any): WarehouseResponseDto {
    return {
      ...warehouse,
    } as WarehouseResponseDto;
  }
}
