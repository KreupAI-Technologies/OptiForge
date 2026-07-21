import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * HR KPI Assignment (net-new HR Performance build)
 *
 * Assigns a KPI (from hr_kpi_master, or a free-text title) to an employee for a
 * period. Backs GET/POST/PUT/DELETE /hr/kpi-assignments and the assign action
 * on app/hr/performance/kpi/assignment.
 *
 * ADDITIVE ONLY: created with CREATE TABLE IF NOT EXISTS in
 * prisma/manual/orphan_hr_performance_net_new.sql. Never DROP/ALTER existing tables.
 */
@Index('IDX_hr_kpi_assignments_company', ['companyId'])
@Index('IDX_hr_kpi_assignments_employee', ['employeeId'])
@Entity('hr_kpi_assignments')
export class KpiAssignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column({ type: 'varchar', nullable: true })
  kpiMasterId: string;

  @Column({ type: 'varchar', nullable: true })
  employeeId: string;

  @Column({ type: 'varchar', nullable: true })
  employeeName: string;

  /** KPI title (denormalised so free-text assignments work without a master). */
  @Column({ type: 'varchar', nullable: true })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', nullable: true })
  target: string;

  @Column({ type: 'numeric', nullable: true })
  weightage: number;

  @Column({ type: 'varchar', nullable: true })
  period: string;

  @Column({ type: 'varchar', nullable: true })
  dueDate: string;

  @Column({ type: 'varchar', nullable: true, default: 'assigned' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
