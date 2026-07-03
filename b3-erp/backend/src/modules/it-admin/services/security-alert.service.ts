import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SecurityAlert } from '../entities/security-alert.entity';

@Injectable()
export class SecurityAlertService {
  constructor(
    @InjectRepository(SecurityAlert)
    private readonly repository: Repository<SecurityAlert>,
  ) {}

  async findAll(filters?: {
    companyId?: string;
    severity?: string;
    status?: string;
    type?: string;
  }): Promise<SecurityAlert[]> {
    const where: Record<string, any> = {};
    if (filters?.companyId) where.companyId = filters.companyId;
    if (filters?.severity && filters.severity !== 'all')
      where.severity = filters.severity;
    if (filters?.status && filters.status !== 'all')
      where.status = filters.status;
    if (filters?.type && filters.type !== 'all') where.type = filters.type;
    return this.repository.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<SecurityAlert> {
    const alert = await this.repository.findOne({ where: { id } });
    if (!alert) throw new NotFoundException(`Security alert ${id} not found`);
    return alert;
  }

  async create(data: Partial<SecurityAlert>): Promise<SecurityAlert> {
    return this.repository.save(this.repository.create(data));
  }

  async update(id: string, data: Partial<SecurityAlert>): Promise<SecurityAlert> {
    const alert = await this.findOne(id);
    Object.assign(alert, data);
    return this.repository.save(alert);
  }

  async remove(id: string): Promise<void> {
    const alert = await this.findOne(id);
    await this.repository.remove(alert);
  }
}
