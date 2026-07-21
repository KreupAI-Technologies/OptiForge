import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MonitoredServer } from '../entities/monitored-server.entity';

@Injectable()
export class MonitoredServerService {
  constructor(
    @InjectRepository(MonitoredServer)
    private readonly repository: Repository<MonitoredServer>,
  ) {}

  private defaults(): Partial<MonitoredServer>[] {
    return [
      { name: 'WEB-01', host: 'web-01.internal', role: 'Web Server', status: 'Healthy', cpuPct: 45, memPct: 62, diskPct: 48, networkPct: 35, uptime: '45 days', location: 'Mumbai DC' },
      { name: 'WEB-02', host: 'web-02.internal', role: 'Web Server', status: 'Healthy', cpuPct: 52, memPct: 58, diskPct: 51, networkPct: 42, uptime: '45 days', location: 'Mumbai DC' },
      { name: 'DB-MASTER', host: 'db-master.internal', role: 'Database Server', status: 'Healthy', cpuPct: 68, memPct: 78, diskPct: 65, networkPct: 58, uptime: '90 days', location: 'Mumbai DC' },
      { name: 'DB-REPLICA', host: 'db-replica.internal', role: 'Database Server', status: 'Warning', cpuPct: 82, memPct: 88, diskPct: 72, networkPct: 65, uptime: '30 days', location: 'Bangalore DC' },
      { name: 'APP-01', host: 'app-01.internal', role: 'Application Server', status: 'Healthy', cpuPct: 55, memPct: 65, diskPct: 42, networkPct: 48, uptime: '45 days', location: 'Mumbai DC' },
      { name: 'CACHE-01', host: 'cache-01.internal', role: 'Cache Server', status: 'Healthy', cpuPct: 38, memPct: 72, diskPct: 28, networkPct: 52, uptime: '60 days', location: 'Mumbai DC' },
    ];
  }

  private async ensureSeeded(companyId?: string): Promise<void> {
    const count = await this.repository.count(
      companyId ? { where: { companyId } } : {},
    );
    if (count > 0) return;
    await this.repository.save(
      this.defaults().map((d) =>
        this.repository.create({ ...d, companyId, lastCheckAt: new Date() }),
      ),
    );
  }

  async findAll(filters?: {
    companyId?: string;
    status?: string;
    role?: string;
  }): Promise<MonitoredServer[]> {
    await this.ensureSeeded(filters?.companyId);
    const where: Record<string, any> = {};
    if (filters?.companyId) where.companyId = filters.companyId;
    if (filters?.status && filters.status !== 'all')
      where.status = filters.status;
    if (filters?.role && filters.role !== 'all') where.role = filters.role;
    return this.repository.find({ where, order: { name: 'ASC' } });
  }

  async findOne(id: string): Promise<MonitoredServer> {
    const item = await this.repository.findOne({ where: { id } });
    if (!item) throw new NotFoundException(`Monitored server ${id} not found`);
    return item;
  }

  async create(data: Partial<MonitoredServer>): Promise<MonitoredServer> {
    return this.repository.save(this.repository.create(data));
  }

  async update(
    id: string,
    data: Partial<MonitoredServer>,
  ): Promise<MonitoredServer> {
    const item = await this.findOne(id);
    Object.assign(item, data);
    return this.repository.save(item);
  }

  async remove(id: string): Promise<void> {
    const item = await this.findOne(id);
    await this.repository.remove(item);
  }
}
