import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('pm_installation_activities')
export class PmInstallationActivityEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id', type: 'varchar', default: 'default' })
  companyId: string;

  @Column({ name: 'activity_number', type: 'varchar', nullable: true })
  activityNumber: string;

  @Column({ name: 'project_id', type: 'varchar', nullable: true })
  projectId: string;

  @Column({ name: 'project_name', type: 'varchar', nullable: true })
  projectName: string;

  @Column({ name: 'equipment_item', type: 'varchar', nullable: true })
  equipmentItem: string;

  @Column({ name: 'equipment_code', type: 'varchar', nullable: true })
  equipmentCode: string;

  @Column({ type: 'varchar', nullable: true })
  location: string;

  @Column({ type: 'varchar', nullable: true })
  zone: string;

  @Column({ name: 'installation_type', type: 'varchar', nullable: true })
  installationType: string;

  @Column({ name: 'planned_start_date', type: 'varchar', nullable: true })
  plannedStartDate: string;

  @Column({ name: 'planned_end_date', type: 'varchar', nullable: true })
  plannedEndDate: string;

  @Column({ name: 'actual_start_date', type: 'varchar', nullable: true })
  actualStartDate: string;

  @Column({ name: 'actual_end_date', type: 'varchar', nullable: true })
  actualEndDate: string;

  @Column({ type: 'varchar', default: 'Not Started' })
  status: string;

  @Column({ type: 'int', default: 0 })
  progress: number;

  @Column({ name: 'assigned_team', type: 'varchar', nullable: true })
  assignedTeam: string;

  @Column({ name: 'team_size', type: 'int', default: 0 })
  teamSize: number;

  @Column({ type: 'varchar', nullable: true })
  supervisor: string;

  @Column({ type: 'jsonb', nullable: true })
  dependencies: any;

  @Column({ name: 'prerequisites_completed', type: 'boolean', default: false })
  prerequisitesCompleted: boolean;

  @Column({ name: 'material_availability', type: 'varchar', nullable: true })
  materialAvailability: string;

  @Column({ name: 'tools_required', type: 'jsonb', nullable: true })
  toolsRequired: any;

  @Column({ name: 'safety_checklist', type: 'boolean', default: false })
  safetyChecklist: boolean;

  @Column({ name: 'quality_checkpoint', type: 'boolean', default: false })
  qualityCheckpoint: boolean;

  @Column({ type: 'int', default: 0 })
  photos: number;

  @Column({ type: 'text', nullable: true })
  remarks: string;

  @Column({ type: 'jsonb', nullable: true })
  issues: any;

  @Column({ name: 'delay_reason', type: 'varchar', nullable: true })
  delayReason: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
