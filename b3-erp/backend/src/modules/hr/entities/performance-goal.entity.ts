import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * HR Performance Goal / KPI record (shared, orphan-endpoint build)
 *
 * Flexible table backing the /hr/performance/* pages that do NOT map onto the
 * existing hr/performance-reviews endpoint (goals my/team/department, KPI
 * master, feedback give). A `recordType` discriminator selects the sub-feature
 * and the `data` JSON column carries the full row the frontend renders.
 *
 * ADDITIVE ONLY: created with CREATE TABLE IF NOT EXISTS in
 * prisma/manual/orphan_hr.sql. Never DROP/ALTER existing tables.
 */
@Index('IDX_hr_performance_goals_company_type', ['companyId', 'recordType'])
@Entity('hr_performance_goals')
export class PerformanceGoal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  /** Sub-feature discriminator, e.g. 'my-goal', 'team-goal', 'department-goal',
   *  'kpi', 'feedback-target'. */
  @Column({ type: 'varchar' })
  recordType: string;

  @Column({ type: 'varchar', nullable: true })
  title: string;

  @Column({ type: 'varchar', nullable: true })
  status: string;

  /** Full frontend row shape. */
  @Column({ type: 'jsonb', nullable: true })
  data: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
