import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupportKnownError } from '../entities/support-known-error.entity';

@Injectable()
export class SupportKnownErrorService {
  constructor(
    @InjectRepository(SupportKnownError)
    private readonly repo: Repository<SupportKnownError>,
  ) {}

  findAll(companyId: string): Promise<SupportKnownError[]> {
    return this.repo.find({
      where: { companyId },
      order: { status: 'ASC', title: 'ASC' },
    });
  }

  async findOne(id: string): Promise<SupportKnownError> {
    const found = await this.repo.findOne({ where: { id } });
    if (!found) throw new NotFoundException(`Known error ${id} not found`);
    return found;
  }

  create(
    data: Partial<SupportKnownError> & { companyId: string },
  ): Promise<SupportKnownError> {
    return this.repo.save(this.repo.create(data));
  }

  async update(
    id: string,
    data: Partial<SupportKnownError>,
  ): Promise<SupportKnownError> {
    const found = await this.findOne(id);
    Object.assign(found, data);
    return this.repo.save(found);
  }

  async remove(id: string): Promise<void> {
    const found = await this.findOne(id);
    await this.repo.remove(found);
  }
}
