import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * PayrollCalendarEvent (orphan-endpoint build)
 * Backs hr/payroll-calendar. ADDITIVE ONLY.
 */
@Entity('hr_payroll_calendar_events')
@Index('IDX_hr_payroll_calendar_events_companyId', ['companyId'])
export class PayrollCalendarEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column({ type: 'varchar', nullable: true })
  monthYear: string;
  @Column({ type: 'varchar', nullable: true })
  cutoffDate: string;
  @Column({ type: 'varchar', nullable: true })
  attendanceFreeze: string;
  @Column({ type: 'varchar', nullable: true })
  salaryProcessing: string;
  @Column({ type: 'varchar', nullable: true })
  verificationDeadline: string;
  @Column({ type: 'varchar', nullable: true })
  approvalDeadline: string;
  @Column({ type: 'varchar', nullable: true })
  disbursementDate: string;
  @Column({ type: 'varchar', default: 'upcoming' })
  status: string;
  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
