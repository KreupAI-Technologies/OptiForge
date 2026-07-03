import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApVendorAccount } from '../entities/ap-vendor-account.entity';

@Injectable()
export class ApVendorAccountService {
  constructor(
    @InjectRepository(ApVendorAccount)
    private readonly repo: Repository<ApVendorAccount>,
  ) {}

  async findAll(): Promise<ApVendorAccount[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<ApVendorAccount> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) {
      throw new NotFoundException(`AP vendor account ${id} not found`);
    }
    return row;
  }

  async create(dto: Partial<ApVendorAccount>): Promise<ApVendorAccount> {
    const row = this.repo.create(dto);
    return this.repo.save(row);
  }

  async update(id: string, dto: Partial<ApVendorAccount>): Promise<ApVendorAccount> {
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
