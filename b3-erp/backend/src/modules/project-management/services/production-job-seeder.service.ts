import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PmProductionJobEntity } from '../entities/pm-production-job.entity';

@Injectable()
export class ProductionJobSeederService implements OnModuleInit {
  private readonly logger = new Logger(ProductionJobSeederService.name);

  constructor(
    @InjectRepository(PmProductionJobEntity)
    private readonly repo: Repository<PmProductionJobEntity>,
  ) {}

  async onModuleInit(): Promise<void> {
    try {
      const count = await this.repo.count();
      if (count > 0) {
        return;
      }

      // Values mirror the hardcoded arrays previously rendered by each
      // shop-floor page, keyed to projectId='DEMO-PROJECT' so the demo dataset
      // looks identical to before the persistence layer existed.
      const demo: Partial<PmProductionJobEntity>[] = [
        // --- Laser cutting (LaserCuttingPage) ---
        { companyId: 'default', projectId: 'DEMO-PROJECT', operationType: 'laser', jobCode: 'LJ-001', partName: 'Main Frame - Top', material: 'SS 304', thickness: '2mm', quantity: 10, status: 'Pending', extra: { logoEtchVerified: false }, createdBy: 'System' },
        { companyId: 'default', projectId: 'DEMO-PROJECT', operationType: 'laser', jobCode: 'LJ-002', partName: 'Side Panel - Left', material: 'MS CRCA', thickness: '1.5mm', quantity: 25, status: 'In Progress', extra: { logoEtchVerified: true }, createdBy: 'System' },
        { companyId: 'default', projectId: 'DEMO-PROJECT', operationType: 'laser', jobCode: 'LJ-003', partName: 'Mounting Bracket', material: 'Aluminium 5052', thickness: '3mm', quantity: 50, status: 'Completed', extra: { logoEtchVerified: true }, createdBy: 'System' },

        // --- Bending (BendingPage) ---
        { companyId: 'default', projectId: 'DEMO-PROJECT', operationType: 'bending', jobCode: 'BJ-001', partName: 'Main Frame - Top', material: 'SS 304 (2mm)', quantity: 0, status: 'Pending', extra: { bends: 4, instructions: '90° bend at 50mm, 45° bend at 150mm' }, createdBy: 'System' },
        { companyId: 'default', projectId: 'DEMO-PROJECT', operationType: 'bending', jobCode: 'BJ-002', partName: 'Side Panel - Left', material: 'MS CRCA (1.5mm)', quantity: 0, status: 'In Progress', extra: { bends: 2, instructions: 'Standard 90° flange bends' }, createdBy: 'System' },
        { companyId: 'default', projectId: 'DEMO-PROJECT', operationType: 'bending', jobCode: 'BJ-003', partName: 'Mounting Bracket', material: 'Aluminium 5052 (3mm)', quantity: 0, status: 'Completed', extra: { bends: 6, instructions: 'Complex multi-stage bending' }, createdBy: 'System' },

        // --- Fabrication / assembly (FabricationPage) ---
        { companyId: 'default', projectId: 'DEMO-PROJECT', operationType: 'fabrication', jobCode: 'ASM-001', partName: 'Main Structure Frame', quantity: 0, status: 'In Progress', extra: { components: ['Main Frame - Top', 'Side Panel - Left', 'Side Panel - Right'], assignedTeam: 'Team Alpha', progress: 60 }, createdBy: 'System' },
        { companyId: 'default', projectId: 'DEMO-PROJECT', operationType: 'fabrication', jobCode: 'ASM-002', partName: 'Control Unit Housing', quantity: 0, status: 'Pending', extra: { components: ['Mounting Bracket', 'Housing Body', 'Door Panel'], assignedTeam: 'Team Beta', progress: 0 }, createdBy: 'System' },

        // --- Welding (WeldingPage) ---
        { companyId: 'default', projectId: 'DEMO-PROJECT', operationType: 'welding', jobCode: 'WJ-001', partName: 'Main Frame Assembly', material: 'SS 304', quantity: 5, status: 'Pending', extra: { weldType: 'TIG', qualityCheck: false }, createdBy: 'System' },
        { companyId: 'default', projectId: 'DEMO-PROJECT', operationType: 'welding', jobCode: 'WJ-002', partName: 'Support Brackets', material: 'MS CRCA', quantity: 20, status: 'In Progress', extra: { weldType: 'MIG', qualityCheck: true }, createdBy: 'System' },
        { companyId: 'default', projectId: 'DEMO-PROJECT', operationType: 'welding', jobCode: 'WJ-003', partName: 'Corner Joints', material: 'Aluminium', quantity: 15, status: 'Completed', extra: { weldType: 'TIG', qualityCheck: true }, createdBy: 'System' },

        // --- Buffing (BuffingPage) ---
        { companyId: 'default', projectId: 'DEMO-PROJECT', operationType: 'buffing', jobCode: 'BJ-001', partName: 'Main Frame Assembly', quantity: 5, status: 'Pending', extra: { finishType: 'Matte', surfaceCheck: false }, createdBy: 'System' },
        { companyId: 'default', projectId: 'DEMO-PROJECT', operationType: 'buffing', jobCode: 'BJ-002', partName: 'Handle Bars', quantity: 50, status: 'In Progress', extra: { finishType: 'Mirror', surfaceCheck: true }, createdBy: 'System' },
        { companyId: 'default', projectId: 'DEMO-PROJECT', operationType: 'buffing', jobCode: 'BJ-003', partName: 'Decorative Trim', quantity: 100, status: 'Completed', extra: { finishType: 'Satin', surfaceCheck: true }, createdBy: 'System' },

        // --- Shutter work (ShutterWorkPage) ---
        { companyId: 'default', projectId: 'DEMO-PROJECT', operationType: 'shutter', jobCode: 'SJ-001', partName: 'Kitchen Cabinet Door', quantity: 12, status: 'Pending', extra: { type: 'Wood', dimensions: '600x720mm', fitmentCheck: false }, createdBy: 'System' },
        { companyId: 'default', projectId: 'DEMO-PROJECT', operationType: 'shutter', jobCode: 'SJ-002', partName: 'Display Unit Glass', quantity: 4, status: 'In Progress', extra: { type: 'Glass', dimensions: '450x900mm', fitmentCheck: true }, createdBy: 'System' },
        { companyId: 'default', projectId: 'DEMO-PROJECT', operationType: 'shutter', jobCode: 'SJ-003', partName: 'Wardrobe Slider', quantity: 2, status: 'Completed', extra: { type: 'Acrylic', dimensions: '900x2100mm', fitmentCheck: true }, createdBy: 'System' },
      ];

      await this.repo.save(this.repo.create(demo));
      this.logger.log(`Seeded ${demo.length} demo production jobs (DEMO-PROJECT).`);
    } catch (error) {
      // Table may not exist yet (migrations not run). Swallow and continue.
      this.logger.warn(`Skipped production job seeding: ${error?.message ?? error}`);
    }
  }
}
