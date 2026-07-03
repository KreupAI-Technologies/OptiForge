import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupportAgent } from '../entities/support-agent.entity';

@Injectable()
export class SupportAgentService {
  constructor(
    @InjectRepository(SupportAgent)
    private readonly repo: Repository<SupportAgent>,
  ) {}

  findAll(companyId: string): Promise<SupportAgent[]> {
    return this.repo.find({ where: { companyId }, order: { name: 'ASC' } });
  }

  async findOne(id: string): Promise<SupportAgent> {
    const found = await this.repo.findOne({ where: { id } });
    if (!found) throw new NotFoundException(`Agent ${id} not found`);
    return found;
  }

  create(
    data: Partial<SupportAgent> & { companyId: string },
  ): Promise<SupportAgent> {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: string, data: Partial<SupportAgent>): Promise<SupportAgent> {
    const found = await this.findOne(id);
    Object.assign(found, data);
    return this.repo.save(found);
  }

  async remove(id: string): Promise<void> {
    const found = await this.findOne(id);
    await this.repo.remove(found);
  }
}
