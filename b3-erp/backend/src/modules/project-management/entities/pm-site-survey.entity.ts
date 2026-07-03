import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('pm_site_surveys')
export class PmSiteSurveyEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id', type: 'varchar', default: 'default' })
  companyId: string;

  @Column({ name: 'survey_number', type: 'varchar', nullable: true })
  surveyNumber: string;

  @Column({ name: 'project_id', type: 'varchar', nullable: true })
  projectId: string;

  @Column({ name: 'project_name', type: 'varchar', nullable: true })
  projectName: string;

  @Column({ name: 'project_type', type: 'varchar', nullable: true })
  projectType: string;

  @Column({ name: 'survey_date', type: 'varchar', nullable: true })
  surveyDate: string;

  @Column({ name: 'site_name', type: 'varchar', nullable: true })
  siteName: string;

  @Column({ name: 'site_address', type: 'text', nullable: true })
  siteAddress: string;

  @Column({ type: 'varchar', nullable: true })
  city: string;

  @Column({ type: 'varchar', nullable: true })
  state: string;

  @Column({ name: 'surveyor_name', type: 'varchar', nullable: true })
  surveyorName: string;

  @Column({ name: 'surveyor_contact', type: 'varchar', nullable: true })
  surveyorContact: string;

  @Column({ type: 'varchar', default: 'Scheduled' })
  status: string;

  @Column({ type: 'jsonb', nullable: true })
  measurements: any;

  @Column({ type: 'varchar', nullable: true })
  accessibility: string;

  @Column({ name: 'power_available', type: 'boolean', default: false })
  powerAvailable: boolean;

  @Column({ name: 'water_available', type: 'boolean', default: false })
  waterAvailable: boolean;

  @Column({ name: 'drainage_available', type: 'boolean', default: false })
  drainageAvailable: boolean;

  @Column({ name: 'floor_level', type: 'varchar', nullable: true })
  floorLevel: string;

  @Column({ name: 'ceiling_type', type: 'varchar', nullable: true })
  ceilingType: string;

  @Column({ name: 'wall_condition', type: 'varchar', nullable: true })
  wallCondition: string;

  @Column({ type: 'varchar', nullable: true })
  ventilation: string;

  @Column({ name: 'natural_light', type: 'varchar', nullable: true })
  naturalLight: string;

  @Column({ name: 'existing_equipment', type: 'text', nullable: true })
  existingEquipment: string;

  @Column({ type: 'text', nullable: true })
  obstacles: string;

  @Column({ name: 'special_requirements', type: 'text', nullable: true })
  specialRequirements: string;

  @Column({ name: 'photos_count', type: 'int', default: 0 })
  photosCount: number;

  @Column({ name: 'drawings_count', type: 'int', default: 0 })
  drawingsCount: number;

  @Column({ type: 'jsonb', nullable: true })
  issues: any;

  @Column({ type: 'jsonb', nullable: true })
  recommendations: any;

  @Column({ name: 'estimated_budget', type: 'decimal', precision: 15, scale: 2, default: 0 })
  estimatedBudget: number;

  @Column({ name: 'completion_percent', type: 'int', default: 0 })
  completionPercent: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
