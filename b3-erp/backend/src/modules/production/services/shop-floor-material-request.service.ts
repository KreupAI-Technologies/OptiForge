import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShopFloorMaterialRequest } from '../entities/shop-floor-material-request.entity';

@Injectable()
export class ShopFloorMaterialRequestService {
  constructor(
    @InjectRepository(ShopFloorMaterialRequest)
    private readonly repo: Repository<ShopFloorMaterialRequest>,
  ) {}

  async create(createDto: Partial<ShopFloorMaterialRequest>): Promise<ShopFloorMaterialRequest> {
    const entity = this.repo.create({
      ...createDto,
      requestNumber: createDto.requestNumber || (await this.generateRequestNumber()),
      requestedAt: createDto.requestedAt || new Date().toISOString(),
      status: createDto.status || 'pending',
    });
    return this.repo.save(entity);
  }

  async findAll(filters?: {
    status?: string;
    workOrderId?: string;
    workCenterId?: string;
  }): Promise<ShopFloorMaterialRequest[]> {
    const query = this.repo.createQueryBuilder('r');
    if (filters?.status) {
      query.andWhere('r.status = :status', { status: filters.status });
    }
    if (filters?.workOrderId) {
      query.andWhere('r.workOrderId = :workOrderId', { workOrderId: filters.workOrderId });
    }
    if (filters?.workCenterId) {
      query.andWhere('r.workCenterId = :workCenterId', { workCenterId: filters.workCenterId });
    }
    query.orderBy('r.createdAt', 'DESC');
    return query.getMany();
  }

  async findOne(id: string): Promise<ShopFloorMaterialRequest> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`Material request with ID ${id} not found`);
    }
    return entity;
  }

  async update(id: string, updateDto: Partial<ShopFloorMaterialRequest>): Promise<ShopFloorMaterialRequest> {
    const entity = await this.findOne(id);
    Object.assign(entity, updateDto);
    return this.repo.save(entity);
  }

  private async generateRequestNumber(): Promise<string> {
    const count = await this.repo.count();
    const seq = String(count + 1).padStart(4, '0');
    return `MRQ-${new Date().getFullYear()}-${seq}`;
  }
}
