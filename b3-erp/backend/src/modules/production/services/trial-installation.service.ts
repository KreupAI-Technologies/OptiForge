import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrialInstallation } from '../entities/trial-installation.entity';

@Injectable()
export class TrialInstallationService {
  constructor(
    @InjectRepository(TrialInstallation)
    private readonly repo: Repository<TrialInstallation>,
  ) {}

  async create(createDto: Partial<TrialInstallation>): Promise<TrialInstallation> {
    const entity = this.repo.create(createDto);
    return this.repo.save(entity);
  }

  async findAll(filters?: { status?: string; installationType?: string }): Promise<TrialInstallation[]> {
    const query = this.repo.createQueryBuilder('t');
    if (filters?.status) {
      query.andWhere('t.status = :status', { status: filters.status });
    }
    if (filters?.installationType) {
      query.andWhere('t.installationType = :installationType', {
        installationType: filters.installationType,
      });
    }
    query.orderBy('t.scheduledDate', 'DESC');
    return query.getMany();
  }

  async findOne(id: string): Promise<TrialInstallation> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`Trial installation with ID ${id} not found`);
    }
    return entity;
  }

  async update(id: string, updateDto: Partial<TrialInstallation>): Promise<TrialInstallation> {
    const entity = await this.findOne(id);
    Object.assign(entity, updateDto);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
