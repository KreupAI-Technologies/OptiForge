import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrmCustomer } from '../entities/crm-customer.entity';

@Injectable()
export class CrmCustomerService {
  constructor(
    @InjectRepository(CrmCustomer)
    private readonly repo: Repository<CrmCustomer>,
  ) {}

  async findAll(companyId?: string): Promise<CrmCustomer[]> {
    const where = companyId ? { companyId } : {};
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<CrmCustomer> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException(`Customer ${id} not found`);
    return row;
  }

  /** Build a parent -> children hierarchy tree from crm_customers. */
  async getHierarchy(companyId?: string): Promise<any[]> {
    const where = companyId ? { companyId } : {};
    const rows = await this.repo.find({ where, order: { customerName: 'ASC' } });
    const map = new Map<string, any>();
    rows.forEach((r) =>
      map.set(r.id, {
        id: r.id,
        name: r.customerName,
        industry: r.industry,
        segment: r.segment,
        lifetimeValue: Number(r.lifetimeValue) || 0,
        accountManager: r.accountManager,
        status: r.status,
        children: [],
      }),
    );
    const roots: any[] = [];
    rows.forEach((r) => {
      const node = map.get(r.id);
      if (r.parentCustomerId && map.has(r.parentCustomerId)) {
        map.get(r.parentCustomerId).children.push(node);
      } else {
        roots.push(node);
      }
    });
    return roots;
  }

  async create(data: Partial<CrmCustomer>): Promise<CrmCustomer> {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: string, data: Partial<CrmCustomer>): Promise<CrmCustomer> {
    const row = await this.findOne(id);
    Object.assign(row, data);
    return this.repo.save(row);
  }

  async remove(id: string): Promise<void> {
    const row = await this.findOne(id);
    await this.repo.remove(row);
  }
}
