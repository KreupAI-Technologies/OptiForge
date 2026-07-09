import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrmAccountRelationship } from '../entities/crm-account-relationship.entity';

@Injectable()
export class CrmAccountRelationshipService {
  constructor(
    @InjectRepository(CrmAccountRelationship)
    private readonly repo: Repository<CrmAccountRelationship>,
  ) {}

  async findAll(filters?: {
    companyId?: string;
    accountId?: string;
    relationshipType?: string;
  }): Promise<CrmAccountRelationship[]> {
    const qb = this.repo.createQueryBuilder('rel');
    if (filters?.companyId) {
      qb.andWhere('rel.companyId = :companyId', { companyId: filters.companyId });
    }
    if (filters?.relationshipType) {
      qb.andWhere('rel.relationshipType = :type', { type: filters.relationshipType });
    }
    if (filters?.accountId) {
      qb.andWhere(
        '(rel.sourceAccountId = :accId OR rel.targetAccountId = :accId)',
        { accId: filters.accountId },
      );
    }
    qb.orderBy('rel.createdAt', 'DESC');
    return qb.getMany();
  }

  async findOne(id: string): Promise<CrmAccountRelationship> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException(`Account relationship ${id} not found`);
    return row;
  }

  async create(data: Partial<CrmAccountRelationship>): Promise<CrmAccountRelationship> {
    return this.repo.save(this.repo.create(data));
  }

  async update(
    id: string,
    data: Partial<CrmAccountRelationship>,
  ): Promise<CrmAccountRelationship> {
    const row = await this.findOne(id);
    Object.assign(row, data);
    return this.repo.save(row);
  }

  async remove(id: string): Promise<void> {
    const row = await this.findOne(id);
    await this.repo.remove(row);
  }
}
