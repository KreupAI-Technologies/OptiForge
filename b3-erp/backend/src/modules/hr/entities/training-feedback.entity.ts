import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * HR Training Feedback (orphan-endpoint build)
 * Reuses the prisma table `hr_training_feedback` (model TrainingFeedback).
 * Backs GET/POST /hr/training-feedback. ADDITIVE ONLY.
 */
@Entity('hr_training_feedback')
@Index('IDX_hr_training_feedback_companyId', ['companyId'])
export class TrainingFeedback {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column({ type: 'varchar', nullable: true })
  scheduleId: string;

  @Column({ type: 'varchar', nullable: true })
  programId: string;

  @Column({ type: 'varchar', nullable: true })
  enrollmentId: string;

  @Column({ type: 'varchar', nullable: true })
  employeeId: string;

  @Column({ type: 'varchar', nullable: true })
  employeeName: string;

  @Column({ type: 'int', nullable: true })
  rating: number;

  @Column({ type: 'int', nullable: true })
  contentRating: number;

  @Column({ type: 'int', nullable: true })
  instructorRating: number;

  @Column({ type: 'int', nullable: true })
  relevanceRating: number;

  @Column({ type: 'int', nullable: true })
  paceRating: number;

  @Column({ type: 'text', nullable: true })
  comments: string;

  @Column({ type: 'text', nullable: true })
  strengths: string;

  @Column({ type: 'text', nullable: true })
  improvements: string;

  @Column({ type: 'boolean', default: false })
  isAnonymous: boolean;

  @Column({ type: 'boolean', default: true })
  wouldRecommend: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
