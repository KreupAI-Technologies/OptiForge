import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PackagingMaterialRequest } from '../entities/packaging-material-request.entity';

@Injectable()
export class PackagingMaterialRequestSeederService implements OnModuleInit {
  private readonly logger = new Logger(PackagingMaterialRequestSeederService.name);

  constructor(
    @InjectRepository(PackagingMaterialRequest)
    private readonly repo: Repository<PackagingMaterialRequest>,
  ) {}

  async onModuleInit(): Promise<void> {
    try {
      const count = await this.repo.count();
      if (count > 0) {
        return;
      }

      const demo: Partial<PackagingMaterialRequest>[] = [
        {
          companyId: 'default',
          projectId: 'DEMO-PROJECT',
          materialId: 'PKG-CRATE-001',
          materialName: 'Heavy-Duty Wooden Crate (Large)',
          quantity: 20,
          unit: 'pcs',
          requiredBy: '2026-08-15',
          priority: 'High',
          status: 'Requested',
          requestedBy: 'System',
          notes: 'Out of stock — required for large equipment crating.',
        },
        {
          companyId: 'default',
          projectId: 'DEMO-PROJECT',
          materialId: 'PKG-WRAP-002',
          materialName: 'Industrial Stretch Wrap Roll',
          quantity: 50,
          unit: 'rolls',
          requiredBy: '2026-08-10',
          priority: 'Medium',
          status: 'Requested',
          requestedBy: 'System',
          notes: 'Low stock replenishment for wrapping station.',
        },
        {
          companyId: 'default',
          projectId: 'DEMO-PROJECT',
          materialId: 'PKG-PROT-003',
          materialName: 'Corner Edge Protectors',
          quantity: 200,
          unit: 'pcs',
          requiredBy: '2026-08-12',
          priority: 'Low',
          status: 'Approved',
          requestedBy: 'System',
          notes: 'Protection for stainless-steel panels in transit.',
        },
        {
          companyId: 'default',
          projectId: 'DEMO-PROJECT',
          materialId: 'PKG-BRAND-004',
          materialName: 'Branded Shipping Labels',
          quantity: 500,
          unit: 'pcs',
          requiredBy: '2026-08-18',
          priority: 'Medium',
          status: 'Ordered',
          requestedBy: 'System',
          notes: 'Custom MACBIS-branded labels for outbound crates.',
        },
      ];

      await this.repo.save(this.repo.create(demo));
      this.logger.log(
        `Seeded ${demo.length} demo packaging material requests (DEMO-PROJECT).`,
      );
    } catch (error) {
      // Table may not exist yet (migrations not run). Swallow and continue.
      this.logger.warn(
        `Skipped packaging material request seeding: ${error?.message ?? error}`,
      );
    }
  }
}
