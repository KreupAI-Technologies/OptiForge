import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

/** HR Preventive Maintenance (orphan-endpoint build) — backs /hr/assets/maintenance/preventive. checklist = JSON text. */
@Entity('hr_preventive_maintenance')
export class PreventiveMaintenance {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() companyId: string;
  @Column({ type: 'varchar', nullable: true }) scheduleId: string;
  @Column({ type: 'varchar', nullable: true }) assetTag: string;
  @Column({ type: 'varchar', nullable: true }) assetName: string;
  @Column({ type: 'varchar', default: 'other' }) assetCategory: string;
  @Column({ type: 'varchar', default: 'inspection' }) maintenanceType: string;
  @Column({ type: 'varchar', default: 'monthly' }) frequency: string;
  @Column({ type: 'varchar', nullable: true }) lastMaintenanceDate: string;
  @Column({ type: 'varchar', nullable: true }) nextMaintenanceDate: string;
  @Column({ type: 'varchar', nullable: true }) assignedTo: string;
  @Column({ type: 'int', default: 0 }) estimatedDuration: number;
  @Column({ type: 'varchar', default: 'upcoming' }) status: string;
  @Column({ type: 'varchar', nullable: true }) location: string;
  @Column({ type: 'text', nullable: true }) checklist: string;
  @Column({ type: 'varchar', default: 'medium' }) priority: string;
  @Column({ type: 'text', nullable: true }) remarks: string;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
