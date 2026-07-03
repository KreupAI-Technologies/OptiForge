import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactRole } from '../entities/contact-role.entity';

@Injectable()
export class ContactRoleService {
  constructor(
    @InjectRepository(ContactRole)
    private readonly repo: Repository<ContactRole>,
  ) {}

  async findAll(companyId?: string): Promise<ContactRole[]> {
    const where = companyId ? { companyId } : {};
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<ContactRole> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException(`Contact role ${id} not found`);
    return row;
  }

  async create(data: Partial<ContactRole>): Promise<ContactRole> {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: string, data: Partial<ContactRole>): Promise<ContactRole> {
    const row = await this.findOne(id);
    Object.assign(row, data);
    return this.repo.save(row);
  }

  async remove(id: string): Promise<void> {
    const row = await this.findOne(id);
    await this.repo.remove(row);
  }
}
