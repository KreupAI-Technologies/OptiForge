import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmployeeMovement } from '../entities/employee-movement.entity';

@Injectable()
export class EmployeeMovementService {
  constructor(
    @InjectRepository(EmployeeMovement)
    private readonly repo: Repository<EmployeeMovement>,
  ) {}

  async findAll(filters?: {
    companyId?: string;
    type?: string;
    status?: string;
    search?: string;
  }): Promise<EmployeeMovement[]> {
    const qb = this.repo
      .createQueryBuilder('movement')
      .orderBy('movement.requestDate', 'DESC')
      .addOrderBy('movement.createdAt', 'DESC');

    qb.where('movement.companyId = :companyId', {
      companyId: filters?.companyId || 'company-1',
    });

    if (filters?.type) {
      qb.andWhere('movement.type = :type', { type: filters.type });
    }
    if (filters?.status) {
      qb.andWhere('movement.status = :status', { status: filters.status });
    }
    if (filters?.search) {
      qb.andWhere(
        '(LOWER(movement.name) LIKE :search OR LOWER(movement.employeeCode) LIKE :search)',
        { search: `%${filters.search.toLowerCase()}%` },
      );
    }

    return qb.getMany();
  }

  async findOne(id: string): Promise<EmployeeMovement> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`Employee movement ${id} not found`);
    return entity;
  }

  async create(
    data: Partial<EmployeeMovement> & { companyId?: string },
  ): Promise<EmployeeMovement> {
    const entity = this.repo.create({
      ...data,
      companyId: data.companyId || 'company-1',
    });
    return this.repo.save(entity);
  }

  async update(
    id: string,
    data: Partial<EmployeeMovement>,
  ): Promise<EmployeeMovement> {
    const entity = await this.findOne(id);
    Object.assign(entity, data);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
