import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ElearningCourse } from '../entities/elearning-course.entity';

@Injectable()
export class ElearningCourseService {
  constructor(
    @InjectRepository(ElearningCourse)
    private readonly repo: Repository<ElearningCourse>,
  ) {}

  async findAll(companyId: string, status?: string): Promise<ElearningCourse[]> {
    const where: Record<string, any> = { companyId };
    if (status) where.status = status;
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<ElearningCourse> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`ElearningCourse ${id} not found`);
    return entity;
  }

  async create(data: Partial<ElearningCourse> & { companyId: string }): Promise<ElearningCourse> {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: string, data: Partial<ElearningCourse>): Promise<ElearningCourse> {
    const entity = await this.findOne(id);
    Object.assign(entity, data);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
