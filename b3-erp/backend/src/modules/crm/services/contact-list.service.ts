import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactList } from '../entities/contact-list.entity';

@Injectable()
export class ContactListService {
  constructor(
    @InjectRepository(ContactList)
    private readonly repo: Repository<ContactList>,
  ) {}

  async findAll(companyId?: string): Promise<ContactList[]> {
    const where = companyId ? { companyId } : {};
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<ContactList> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException(`Contact list ${id} not found`);
    return row;
  }

  async create(data: Partial<ContactList>): Promise<ContactList> {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: string, data: Partial<ContactList>): Promise<ContactList> {
    const row = await this.findOne(id);
    Object.assign(row, data);
    return this.repo.save(row);
  }

  async remove(id: string): Promise<void> {
    const row = await this.findOne(id);
    await this.repo.remove(row);
  }
}
