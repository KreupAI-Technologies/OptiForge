import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { ComplianceRegister } from '../entities/compliance-register.entity';

@Injectable()
export class ComplianceRegisterService {
  constructor(
    @InjectRepository(ComplianceRegister)
    private readonly repo: Repository<ComplianceRegister>,
  ) {}

  async findAll(
    companyId: string,
    entryType?: string,
  ): Promise<ComplianceRegister[]> {
    const where: FindOptionsWhere<ComplianceRegister> = { companyId };
    if (entryType) where.entryType = entryType;
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<ComplianceRegister> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`Register ${id} not found`);
    return entity;
  }

  async create(
    data: Partial<ComplianceRegister> & { companyId: string },
  ): Promise<ComplianceRegister> {
    return this.repo.save(this.repo.create(data));
  }

  async update(
    id: string,
    data: Partial<ComplianceRegister>,
  ): Promise<ComplianceRegister> {
    const entity = await this.findOne(id);
    Object.assign(entity, data);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
