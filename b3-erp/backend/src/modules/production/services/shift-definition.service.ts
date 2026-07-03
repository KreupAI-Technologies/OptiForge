import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShiftDefinition } from '../entities/shift-definition.entity';

@Injectable()
export class ShiftDefinitionService {
  constructor(
    @InjectRepository(ShiftDefinition)
    private readonly repo: Repository<ShiftDefinition>,
  ) {}

  async create(createDto: Partial<ShiftDefinition>): Promise<ShiftDefinition> {
    if (createDto.code) {
      const existing = await this.repo.findOne({ where: { code: createDto.code } });
      if (existing) {
        throw new BadRequestException(`Shift ${createDto.code} already exists`);
      }
    }
    const entity = this.repo.create(createDto);
    return this.repo.save(entity);
  }

  async findAll(filters?: { shiftType?: string; status?: string }): Promise<ShiftDefinition[]> {
    const query = this.repo.createQueryBuilder('sd');
    if (filters?.shiftType) {
      query.andWhere('sd.shiftType = :shiftType', { shiftType: filters.shiftType });
    }
    if (filters?.status) {
      query.andWhere('sd.status = :status', { status: filters.status });
    }
    query.orderBy('sd.startTime', 'ASC');
    return query.getMany();
  }

  async findOne(id: string): Promise<ShiftDefinition> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`Shift with ID ${id} not found`);
    }
    return entity;
  }

  async update(id: string, updateDto: Partial<ShiftDefinition>): Promise<ShiftDefinition> {
    const entity = await this.findOne(id);
    Object.assign(entity, updateDto);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
