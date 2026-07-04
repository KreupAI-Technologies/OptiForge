import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PayrollCalendarEvent } from '../entities/payroll-calendar-event.entity';

@Injectable()
export class PayrollCalendarEventService {
  constructor(
    @InjectRepository(PayrollCalendarEvent)
    private readonly repository: Repository<PayrollCalendarEvent>,
  ) {}

  async create(createDto: any): Promise<any> {
    const entity = this.repository.create(createDto);
    return await this.repository.save(entity);
  }

  async findAll(filters?: any): Promise<any[]> {
    const query = this.repository.createQueryBuilder('entity');

    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          query.andWhere(`entity.${key} = :${key}`, { [key]: filters[key] });
        }
      });
    }

    return await query.getMany();
  }

  async findOne(id: string): Promise<any> {
    const entity = await this.repository.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`PayrollCalendarEvent with ID ${id} not found`);
    }
    return entity;
  }

  async update(id: string, updateDto: any): Promise<any> {
    const entity = await this.findOne(id);
    Object.assign(entity, updateDto);
    return await this.repository.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repository.remove(entity);
  }
}
