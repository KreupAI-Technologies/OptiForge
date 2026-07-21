import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * HR Training Assessment (orphan-endpoint build)
 * Reuses the prisma table `hr_training_assessments` (model TrainingAssessment).
 * Backs GET/POST/PUT/DELETE /hr/training-assessments (+ attempts). ADDITIVE ONLY.
 */
@Entity('hr_training_assessments')
@Index('IDX_hr_training_assessments_companyId', ['companyId'])
export class TrainingAssessment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column({ type: 'varchar', nullable: true })
  programId: string;

  @Column({ type: 'varchar', nullable: true })
  scheduleId: string;

  @Column({ type: 'varchar', nullable: true })
  title: string;

  // pre_assessment, post_assessment, quiz, exam, practical
  @Column({ type: 'varchar', default: 'quiz' })
  assessmentType: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int', default: 100 })
  totalMarks: number;

  @Column({ type: 'int', default: 0 })
  passingMarks: number;

  @Column({ type: 'int', nullable: true })
  durationMinutes: number;

  @Column({ type: 'int', default: 1 })
  attemptsAllowed: number;

  @Column({ type: 'jsonb', nullable: true })
  questions: Record<string, unknown>[];

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
