import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * HR Training Attendance (orphan-endpoint build)
 * Reuses the prisma table `hr_training_attendance` (model TrainingAttendance).
 * Backs GET/POST/PUT /hr/training-attendance. ADDITIVE ONLY.
 */
@Entity('hr_training_attendance')
@Index('IDX_hr_training_attendance_companyId', ['companyId'])
export class TrainingAttendance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column({ type: 'varchar', nullable: true })
  scheduleId: string;

  @Column({ type: 'varchar', nullable: true })
  enrollmentId: string;

  @Column({ type: 'varchar', nullable: true })
  employeeId: string;

  @Column({ type: 'varchar', nullable: true })
  employeeName: string;

  // present, absent, partial, excused
  @Column({ type: 'varchar', default: 'present' })
  status: string;

  @Column({ type: 'text', nullable: true })
  note: string;

  @Column({ type: 'varchar', nullable: true })
  date: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
