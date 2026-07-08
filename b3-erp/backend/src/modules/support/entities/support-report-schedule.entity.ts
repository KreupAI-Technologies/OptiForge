import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Support Report Schedule
 * Backs the "Scheduled Reports" tab on the /support/reports page. Stores the
 * automated-delivery config (report, cadence, format, recipients) that the
 * scheduler would use to render + email reports.
 */
@Entity('support_report_schedules')
export class SupportReportSchedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column()
  reportName: string;

  @Column({ type: 'varchar' })
  reportType: string;

  // daily | weekly | monthly | quarterly
  @Column({ type: 'varchar', default: 'weekly' })
  frequency: string;

  @Column({ type: 'varchar', nullable: true })
  dayOfWeek: string;

  @Column({ type: 'varchar', default: '09:00' })
  time: string;

  // pdf | excel | powerpoint | csv
  @Column({ type: 'varchar', default: 'pdf' })
  format: string;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  recipients: string[];

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastRunAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  nextRunAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
