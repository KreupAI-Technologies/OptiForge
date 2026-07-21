import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PmVendorShipmentEntity } from '../entities/pm-vendor-shipment.entity';

@Injectable()
export class PmVendorShipmentService {
  constructor(
    @InjectRepository(PmVendorShipmentEntity)
    private readonly repo: Repository<PmVendorShipmentEntity>,
  ) {}

  async list(projectId?: string, poId?: string): Promise<PmVendorShipmentEntity[]> {
    const where: any = {};
    if (projectId) where.projectId = projectId;
    if (poId) where.poId = poId;

    const rows = await this.repo.find({ where, order: { createdAt: 'DESC' } });

    // DEMO FALLBACK: if a project has no shipments of its own, surface the
    // shared demo dataset so the page is never empty.
    if (rows.length === 0 && projectId) {
      const demoWhere: any = { projectId: 'DEMO-PROJECT' };
      if (poId) demoWhere.poId = poId;
      return this.repo.find({ where: demoWhere, order: { createdAt: 'DESC' } });
    }

    return rows;
  }

  async findOne(id: string): Promise<PmVendorShipmentEntity> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException(`Vendor shipment ${id} not found`);
    return row;
  }

  async create(data: Partial<PmVendorShipmentEntity>): Promise<PmVendorShipmentEntity> {
    const row = this.repo.create({ companyId: 'default', status: 'Pending', ...data });
    return this.repo.save(row);
  }

  async updateTracking(
    id: string,
    data: Partial<PmVendorShipmentEntity> & { location?: string; event?: string },
  ): Promise<PmVendorShipmentEntity> {
    const row = await this.findOne(id);

    const { id: _id, createdAt, updatedAt, location, event, trackingHistory, ...rest } = data as any;

    // Append a tracking-history event.
    const history = Array.isArray(row.trackingHistory) ? [...row.trackingHistory] : [];
    const newLocation = location ?? rest.lastLocation ?? row.lastLocation;
    history.push({
      timestamp: new Date().toISOString(),
      status: rest.status ?? row.status,
      location: newLocation,
      event: event ?? rest.status ?? 'Status refreshed',
    });
    row.trackingHistory = history;

    if (newLocation) row.lastLocation = newLocation;
    if (rest.status) row.status = rest.status;

    Object.assign(row, rest);
    return this.repo.save(row);
  }
}
