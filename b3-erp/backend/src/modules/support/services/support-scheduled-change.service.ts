import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupportScheduledChange } from '../entities/support-scheduled-change.entity';

@Injectable()
export class SupportScheduledChangeService {
  constructor(
    @InjectRepository(SupportScheduledChange)
    private readonly repo: Repository<SupportScheduledChange>,
  ) {}

  findAll(companyId: string): Promise<SupportScheduledChange[]> {
    return this.repo.find({
      where: { companyId },
      order: { implementationDate: 'ASC', title: 'ASC' },
    });
  }

  async findOne(id: string): Promise<SupportScheduledChange> {
    const found = await this.repo.findOne({ where: { id } });
    if (!found) throw new NotFoundException(`Scheduled change ${id} not found`);
    return found;
  }

  create(
    data: Partial<SupportScheduledChange> & { companyId: string },
  ): Promise<SupportScheduledChange> {
    return this.repo.save(this.repo.create(data));
  }

  async update(
    id: string,
    data: Partial<SupportScheduledChange>,
  ): Promise<SupportScheduledChange> {
    const found = await this.findOne(id);
    Object.assign(found, data);
    return this.repo.save(found);
  }

  async remove(id: string): Promise<void> {
    const found = await this.findOne(id);
    await this.repo.remove(found);
  }
}
