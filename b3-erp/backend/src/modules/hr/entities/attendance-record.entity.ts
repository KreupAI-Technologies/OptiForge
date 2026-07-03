import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * HR Attendance Record (orphan-endpoint build)
 * Shared discriminator table backing the summary/aggregate attendance pages
 * under /hr/attendance/{monthly,calendar,biometric,reports}. The raw per-day
 * `hr_attendance` table stays untouched; these pages show rolled-up views so a
 * single additive table with a `category` discriminator serves all of them.
 * Page-specific columns live in the flexible JSON `details`.
 */
@Entity('hr_attendance_records')
export class AttendanceRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  companyId: string;

  // 'monthly' | 'calendar' | 'biometric' | 'reports'
  @Index()
  @Column({ type: 'varchar', default: 'monthly' })
  category: string;

  @Column({ type: 'varchar', nullable: true })
  employeeId: string;

  @Column({ type: 'varchar', nullable: true })
  employeeName: string;

  @Column({ type: 'varchar', nullable: true })
  employeeCode: string;

  @Column({ type: 'varchar', nullable: true })
  department: string;

  @Column({ type: 'varchar', nullable: true })
  period: string;

  @Column({ type: 'varchar', nullable: true })
  date: string;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  presentDays: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  absentDays: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  totalHours: number;

  // 'present' | 'absent' | 'late' | 'on-leave' | 'synced' | 'pending' | 'active'
  @Column({ type: 'varchar', default: 'active' })
  status: string;

  @Column({ type: 'jsonb', nullable: true })
  details: Record<string, unknown>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
