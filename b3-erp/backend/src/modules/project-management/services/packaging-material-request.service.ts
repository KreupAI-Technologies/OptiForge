import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PackagingMaterialRequest } from '../entities/packaging-material-request.entity';

@Injectable()
export class PackagingMaterialRequestService {
  constructor(
    @InjectRepository(PackagingMaterialRequest)
    private readonly repo: Repository<PackagingMaterialRequest>,
  ) {}

  async list(projectId?: string, status?: string): Promise<PackagingMaterialRequest[]> {
    const where: Record<string, string> = {};
    if (projectId) where.projectId = projectId;
    if (status) where.status = status;

    const rows = await this.repo.find({
      where: Object.keys(where).length ? where : undefined,
      order: { createdAt: 'DESC' },
    });
    if (rows.length > 0) return rows;

    // DEMO FALLBACK: if there is nothing at all, surface the seeded demo rows.
    const total = await this.repo.count();
    if (total === 0) {
      return this.repo.find({
        where: { projectId: 'DEMO-PROJECT' },
        order: { createdAt: 'DESC' },
      });
    }
    return rows;
  }

  async create(data: Partial<PackagingMaterialRequest>): Promise<PackagingMaterialRequest> {
    const entity = this.repo.create({
      companyId: data.companyId || 'default',
      projectId: data.projectId ?? undefined,
      materialId: data.materialId,
      materialName: data.materialName,
      quantity: data.quantity ?? 0,
      unit: data.unit ?? undefined,
      requiredBy: data.requiredBy ?? undefined,
      priority: data.priority || 'Medium',
      status: data.status || 'Requested',
      requestedBy: data.requestedBy ?? undefined,
      notes: data.notes ?? undefined,
    });
    return this.repo.save(entity);
  }

  async updateStatus(
    id: string,
    data: Partial<PackagingMaterialRequest>,
  ): Promise<PackagingMaterialRequest> {
    const existing = await this.repo.findOne({ where: { id } });
    if (!existing) throw new NotFoundException('Packaging material request not found');

    if (data.status !== undefined) existing.status = data.status;
    if (data.priority !== undefined) existing.priority = data.priority;
    if (data.requiredBy !== undefined) existing.requiredBy = data.requiredBy;
    if (data.notes !== undefined) existing.notes = data.notes;

    return this.repo.save(existing);
  }
}
