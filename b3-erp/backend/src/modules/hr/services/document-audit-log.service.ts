import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { DocumentAuditLog } from '../entities/document-audit-log.entity';

@Injectable()
export class DocumentAuditLogService {
  constructor(
    @InjectRepository(DocumentAuditLog)
    private readonly repo: Repository<DocumentAuditLog>,
  ) {}

  async findAll(companyId: string, action?: string): Promise<DocumentAuditLog[]> {
    const where: FindOptionsWhere<DocumentAuditLog> = { companyId };
    if (action) where.action = action;
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<DocumentAuditLog> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`Document audit log ${id} not found`);
    return entity;
  }

  async create(data: Partial<DocumentAuditLog> & { companyId: string }): Promise<DocumentAuditLog> {
    return this.repo.save(this.repo.create(data));
  }
}
