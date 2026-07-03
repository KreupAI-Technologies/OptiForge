import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShiftRosterEntry } from '../entities/shift-roster-entry.entity';

@Injectable()
export class ShiftRosterService {
  constructor(
    @InjectRepository(ShiftRosterEntry)
    private readonly repo: Repository<ShiftRosterEntry>,
  ) {}

  async findAll(companyId: string): Promise<ShiftRosterEntry[]> {
    return this.repo.find({
      where: { companyId },
      order: { department: 'ASC', employeeName: 'ASC' },
    });
  }

  async findOne(id: string): Promise<ShiftRosterEntry> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`Roster entry ${id} not found`);
    return entity;
  }

  async create(
    data: Partial<ShiftRosterEntry> & { companyId: string },
  ): Promise<ShiftRosterEntry> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async update(
    id: string,
    data: Partial<ShiftRosterEntry>,
  ): Promise<ShiftRosterEntry> {
    const entity = await this.findOne(id);
    Object.assign(entity, data);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
