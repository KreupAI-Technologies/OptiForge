import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * HR E-Learning Course Progress (orphan-endpoint build)
 * Reuses the prisma table `hr_course_progress` (model CourseProgress).
 * Backs GET /hr/elearning-progress, POST (enroll), PUT (lesson progress).
 * ADDITIVE ONLY.
 */
@Entity('hr_course_progress')
@Index('IDX_hr_course_progress_companyId', ['companyId'])
export class CourseProgress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column({ type: 'varchar', nullable: true })
  courseId: string;

  @Column({ type: 'varchar', nullable: true })
  employeeId: string;

  @Column({ type: 'varchar', nullable: true })
  employeeName: string;

  @Column({ type: 'numeric', precision: 5, scale: 2, default: 0 })
  progressPct: number;

  @Column({ type: 'int', default: 0 })
  completedLessons: number;

  @Column({ type: 'int', default: 0 })
  totalLessons: number;

  @Column({ type: 'jsonb', nullable: true })
  lessonProgress: Record<string, unknown>[];

  @Column({ type: 'int', default: 0 })
  timeSpentMinutes: number;

  // not_started, in_progress, completed, failed
  @Column({ type: 'varchar', default: 'not_started' })
  status: string;

  @Column({ type: 'varchar', nullable: true })
  enrollmentDate: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
