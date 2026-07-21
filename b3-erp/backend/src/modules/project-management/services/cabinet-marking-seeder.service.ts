import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CabinetMarkingTask } from '../entities/cabinet-marking-task.entity';

@Injectable()
export class CabinetMarkingSeederService implements OnModuleInit {
  private readonly logger = new Logger(CabinetMarkingSeederService.name);

  constructor(
    @InjectRepository(CabinetMarkingTask)
    private readonly repo: Repository<CabinetMarkingTask>,
  ) {}

  async onModuleInit(): Promise<void> {
    try {
      const count = await this.repo.count();
      if (count > 0) return;

      const demo: Partial<CabinetMarkingTask>[] = [
        {
          projectId: 'DEMO-PROJECT',
          projectName: 'Taj Hotels - Commercial Kitchen Setup',
          taskNumber: 'CM-2025-001',
          cabinetType: 'Wall Cabinets - Upper Level',
          markingType: 'Label',
          quantity: 24,
          scheduledDate: '2025-01-22',
          completedDate: '2025-01-22',
          assignedTeam: 'Installation Team A - 4 members',
          status: 'Completed',
          completionPercentage: 100,
          markedItems: 24,
          totalItems: 24,
          photosUploaded: 12,
          reportGenerated: true,
        },
        {
          projectId: 'DEMO-PROJECT',
          projectName: 'Taj Hotels - Commercial Kitchen Setup',
          taskNumber: 'CM-2025-002',
          cabinetType: 'Base Cabinets - Floor Level',
          markingType: 'Label',
          quantity: 18,
          scheduledDate: '2025-01-23',
          assignedTeam: 'Installation Team A - 4 members',
          status: 'In Progress',
          completionPercentage: 65,
          markedItems: 12,
          totalItems: 18,
          photosUploaded: 8,
          reportGenerated: false,
        },
        {
          projectId: 'DEMO-PROJECT',
          projectName: 'BigBasket Cold Storage Facility',
          taskNumber: 'CM-2025-004',
          cabinetType: 'Control Panel Enclosures',
          markingType: 'Engraving',
          quantity: 8,
          scheduledDate: '2025-01-26',
          assignedTeam: 'Installation Team C - 2 members',
          status: 'Pending Review',
          completionPercentage: 100,
          markedItems: 8,
          totalItems: 8,
          photosUploaded: 4,
          reportGenerated: false,
        },
      ];

      await this.repo.save(demo.map((d) => this.repo.create(d)));
      this.logger.log(`Seeded ${demo.length} demo cabinet marking tasks.`);
    } catch (error) {
      // Table may not exist yet (manual migration not applied) — swallow.
      this.logger.warn(
        `Skipped cabinet marking task seed: ${error?.message ?? error}`,
      );
    }
  }
}
