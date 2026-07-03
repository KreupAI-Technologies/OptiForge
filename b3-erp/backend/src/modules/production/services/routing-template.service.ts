import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoutingTemplate } from '../entities/routing-template.entity';

@Injectable()
export class RoutingTemplateService {
  constructor(
    @InjectRepository(RoutingTemplate)
    private readonly repo: Repository<RoutingTemplate>,
  ) {}

  async create(createDto: Partial<RoutingTemplate>): Promise<RoutingTemplate> {
    if (createDto.code) {
      const existing = await this.repo.findOne({ where: { code: createDto.code } });
      if (existing) {
        throw new BadRequestException(`Routing template ${createDto.code} already exists`);
      }
    }
    const entity = this.repo.create(createDto);
    return this.repo.save(entity);
  }

  async findAll(filters?: { status?: string }): Promise<RoutingTemplate[]> {
    const query = this.repo.createQueryBuilder('rt');
    if (filters?.status) {
      query.andWhere('rt.status = :status', { status: filters.status });
    }
    query.orderBy('rt.name', 'ASC');
    return query.getMany();
  }

  async findOne(id: string): Promise<RoutingTemplate> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`Routing template with ID ${id} not found`);
    }
    return entity;
  }

  async update(id: string, updateDto: Partial<RoutingTemplate>): Promise<RoutingTemplate> {
    const entity = await this.findOne(id);
    Object.assign(entity, updateDto);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
