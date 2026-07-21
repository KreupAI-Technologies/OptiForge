import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MepDrawingEntity } from '../entities/mep-drawing.entity';

@Injectable()
export class MepDrawingSeederService implements OnModuleInit {
  private readonly logger = new Logger(MepDrawingSeederService.name);

  constructor(
    @InjectRepository(MepDrawingEntity)
    private readonly repo: Repository<MepDrawingEntity>,
  ) {}

  async onModuleInit(): Promise<void> {
    try {
      const count = await this.repo.count();
      if (count > 0) {
        return;
      }

      const demo: Partial<MepDrawingEntity>[] = [
        {
          companyId: 'default',
          projectId: 'DEMO-PROJECT',
          drawingName: 'Kitchen Electrical Layout',
          drawingNumber: 'MEP-2025-001',
          discipline: 'Electrical',
          status: 'Approved',
          revision: 'R2',
          fileUrl: undefined,
          sharedWith: ['Site Team A'],
          notes: 'Approved layout for main kitchen power distribution.',
          createdBy: 'System',
        },
        {
          companyId: 'default',
          projectId: 'DEMO-PROJECT',
          drawingName: 'Cold Storage Plumbing Plan',
          drawingNumber: 'MEP-2025-002',
          discipline: 'Plumbing',
          status: 'Under Review',
          revision: 'R1',
          fileUrl: undefined,
          sharedWith: undefined,
          notes: 'Water supply and drainage for cold storage facility.',
          createdBy: 'System',
        },
        {
          companyId: 'default',
          projectId: 'DEMO-PROJECT',
          drawingName: 'HVAC Ducting Schematic',
          drawingNumber: 'MEP-2025-003',
          discipline: 'HVAC',
          status: 'Draft',
          revision: 'R0',
          fileUrl: undefined,
          sharedWith: undefined,
          notes: 'Initial draft of ventilation and ducting routes.',
          createdBy: 'System',
        },
        {
          companyId: 'default',
          projectId: 'DEMO-PROJECT',
          drawingName: 'Fire Suppression Piping',
          drawingNumber: 'MEP-2025-004',
          discipline: 'FireFighting',
          status: 'Shared with Site',
          revision: 'R1',
          fileUrl: undefined,
          sharedWith: ['Site Team B'],
          notes: 'Kitchen hood fire suppression and sprinkler layout.',
          createdBy: 'System',
        },
      ];

      await this.repo.save(this.repo.create(demo));
      this.logger.log(`Seeded ${demo.length} demo MEP drawings (DEMO-PROJECT).`);
    } catch (error) {
      // Table may not exist yet (migrations not run). Swallow and continue.
      this.logger.warn(`Skipped MEP drawing seeding: ${error?.message ?? error}`);
    }
  }
}
