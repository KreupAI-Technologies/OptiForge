import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * HR Training Assessment Attempt (orphan-endpoint build)
 * Reuses the prisma table `hr_training_assessment_attempts`
 * (model TrainingAssessmentAttempt).
 * Backs POST /hr/training-assessments/:id/attempt and
 * POST /hr/training-assessment-attempts/:id/submit. ADDITIVE ONLY.
 */
@Entity('hr_training_assessment_attempts')
@Index('IDX_hr_training_assessment_attempts_companyId', ['companyId'])
export class TrainingAssessmentAttempt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column({ type: 'varchar', nullable: true })
  assessmentId: string;

  @Column({ type: 'varchar', nullable: true })
  enrollmentId: string;

  @Column({ type: 'varchar', nullable: true })
  employeeId: string;

  @Column({ type: 'varchar', nullable: true })
  employeeName: string;

  @Column({ type: 'int', default: 1 })
  attemptNumber: number;

  @Column({ type: 'timestamp', nullable: true })
  startTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  endTime: Date;

  // in_progress, completed
  @Column({ type: 'varchar', default: 'in_progress' })
  status: string;

  @Column({ type: 'jsonb', nullable: true })
  answers: Record<string, unknown>[];

  @Column({ type: 'int', default: 0 })
  totalMarks: number;

  @Column({ type: 'int', default: 0 })
  obtainedMarks: number;

  @Column({ type: 'numeric', precision: 5, scale: 2, default: 0 })
  percentage: number;

  @Column({ type: 'boolean', default: false })
  isPassed: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
