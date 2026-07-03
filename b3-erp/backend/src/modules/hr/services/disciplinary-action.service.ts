import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DisciplinaryAction } from '../entities/disciplinary-action.entity';

@Injectable()
export class DisciplinaryActionService {
  constructor(
    @InjectRepository(DisciplinaryAction)
    private readonly repo: Repository<DisciplinaryAction>,
  ) {}

  async findAll(companyId: string): Promise<DisciplinaryAction[]> {
    return this.repo.find({ where: { companyId }, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<DisciplinaryAction> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`Disciplinary action ${id} not found`);
    return entity;
  }

  async create(
    data: Partial<DisciplinaryAction> & { companyId: string },
  ): Promise<DisciplinaryAction> {
    return this.repo.save(this.repo.create(data));
  }

  async update(
    id: string,
    data: Partial<DisciplinaryAction>,
  ): Promise<DisciplinaryAction> {
    const entity = await this.findOne(id);
    Object.assign(entity, data);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
