import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Timesheet (orphan-endpoint build)
 * Backs hr/timesheets. ADDITIVE ONLY.
 */
@Entity('hr_timesheets')
@Index('IDX_hr_timesheets_companyId', ['companyId'])
export class Timesheet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column({ type: 'varchar', nullable: true })
  employeeCode: string;
  @Column({ type: 'varchar', nullable: true })
  employeeId: string;
  @Column({ type: 'varchar', nullable: true })
  employeeName: string;
  @Column({ type: 'varchar', nullable: true })
  department: string;
  @Column({ type: 'varchar', nullable: true })
  week: string;
  @Column({ type: 'varchar', nullable: true })
  weekPeriod: string;
  @Column({ type: 'numeric', precision: 8, scale: 2, nullable: true })
  totalHours: number;
  @Column({ type: 'numeric', precision: 8, scale: 2, nullable: true })
  regularHours: number;
  @Column({ type: 'numeric', precision: 8, scale: 2, nullable: true })
  overtimeHours: number;
  @Column({ type: 'int', default: 0 })
  projectCount: number;
  @Column({ type: 'varchar', nullable: true })
  submittedDate: string;
  @Column({ type: 'jsonb', nullable: true })
  entries: any;
  @Column({ type: 'varchar', default: 'pending' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
