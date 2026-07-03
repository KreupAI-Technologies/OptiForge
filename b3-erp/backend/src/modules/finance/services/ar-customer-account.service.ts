import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ArCustomerAccount } from '../entities/ar-customer-account.entity';

@Injectable()
export class ArCustomerAccountService {
  constructor(
    @InjectRepository(ArCustomerAccount)
    private readonly repo: Repository<ArCustomerAccount>,
  ) {}

  async findAll(): Promise<ArCustomerAccount[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<ArCustomerAccount> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) {
      throw new NotFoundException(`AR customer account ${id} not found`);
    }
    return row;
  }

  async create(dto: Partial<ArCustomerAccount>): Promise<ArCustomerAccount> {
    const row = this.repo.create(dto);
    return this.repo.save(row);
  }

  async update(id: string, dto: Partial<ArCustomerAccount>): Promise<ArCustomerAccount> {
    const row = await this.findOne(id);
    Object.assign(row, dto);
    return this.repo.save(row);
  }

  async remove(id: string): Promise<{ success: boolean }> {
    const row = await this.findOne(id);
    await this.repo.remove(row);
    return { success: true };
  }
}
