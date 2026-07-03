import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupportGuide } from '../entities/support-guide.entity';

@Injectable()
export class SupportGuideService {
  constructor(
    @InjectRepository(SupportGuide)
    private readonly repo: Repository<SupportGuide>,
  ) {}

  findAll(companyId: string): Promise<SupportGuide[]> {
    return this.repo.find({
      where: { companyId },
      order: { featured: 'DESC', views: 'DESC', title: 'ASC' },
    });
  }

  async findOne(id: string): Promise<SupportGuide> {
    const found = await this.repo.findOne({ where: { id } });
    if (!found) throw new NotFoundException(`Guide ${id} not found`);
    return found;
  }

  create(
    data: Partial<SupportGuide> & { companyId: string },
  ): Promise<SupportGuide> {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: string, data: Partial<SupportGuide>): Promise<SupportGuide> {
    const found = await this.findOne(id);
    Object.assign(found, data);
    return this.repo.save(found);
  }

  async remove(id: string): Promise<void> {
    const found = await this.findOne(id);
    await this.repo.remove(found);
  }
}
