import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('pm_project_plans')
@Index(['companyId', 'status'])
export class ProjectPlanEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  companyId: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  projectCode: string;

  @Column({ type: 'varchar', length: 255 })
  projectName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  client: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  projectManager: string;

  @Column({ type: 'date', nullable: true })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  estimatedBudget: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  actualBudget: number;

  // planning | approved | in_execution | on_hold | completed | cancelled
  @Column({ type: 'varchar', length: 30, default: 'planning' })
  status: string;

  // low | medium | high | critical
  @Column({ type: 'varchar', length: 20, default: 'medium' })
  priority: string;

  @Column({ type: 'int', default: 0 })
  progressPercentage: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  phase: string;

  @Column({ type: 'int', default: 0 })
  milestones: number;

  @Column({ type: 'int', default: 0 })
  completedMilestones: number;

  @Column({ type: 'int', default: 0 })
  teamSize: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  location: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  projectType: string;

  // low | medium | high | critical
  @Column({ type: 'varchar', length: 20, default: 'low' })
  riskLevel: string;

  @Column({ type: 'int', default: 0 })
  plannedHours: number;

  @Column({ type: 'int', default: 0 })
  actualHours: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
