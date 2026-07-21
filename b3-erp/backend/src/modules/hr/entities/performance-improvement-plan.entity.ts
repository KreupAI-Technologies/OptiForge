import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * HR Performance Improvement Plan (PIP) (net-new HR Performance build)
 *
 * Backs GET/POST/PUT/DELETE /hr/performance-pips plus status transitions for the
 * app/hr/performance/pip/{create,tracking,review} pages. `actionItems` carries
 * the checklist the tracking page renders; `status` drives the review outcome
 * (active | extended | passed | failed | terminated).
 *
 * ADDITIVE ONLY: created with CREATE TABLE IF NOT EXISTS in
 * prisma/manual/orphan_hr_performance_net_new.sql. Never DROP/ALTER existing tables.
 */
@Index('IDX_hr_performance_pips_company', ['companyId'])
@Index('IDX_hr_performance_pips_employee', ['employeeId'])
@Entity('hr_performance_pips')
export class PerformanceImprovementPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column({ type: 'varchar', nullable: true })
  employeeId: string;

  @Column({ type: 'varchar', nullable: true })
  employeeName: string;

  @Column({ type: 'varchar', nullable: true })
  role: string;

  @Column({ type: 'varchar', nullable: true })
  managerId: string;

  @Column({ type: 'varchar', nullable: true })
  managerName: string;

  @Column({ type: 'text', nullable: true })
  reason: string;

  /** Expected goals / outcomes. */
  @Column({ type: 'text', nullable: true })
  goals: string;

  @Column({ type: 'varchar', nullable: true })
  startDate: string;

  @Column({ type: 'varchar', nullable: true })
  endDate: string;

  @Column({ type: 'varchar', nullable: true, default: 'active' })
  status: string;

  /** Free-form checklist of action items ({ id, text/description, completed }). */
  @Column({ type: 'jsonb', nullable: true })
  actionItems: Record<string, any>[];

  @Column({ type: 'int', default: 0 })
  progress: number;

  @Column({ type: 'text', nullable: true })
  reviewNotes: string;

  @Column({ type: 'text', nullable: true })
  outcome: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
