import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * HR Performance Review Cycle — reuses the existing prisma table
 * `hr_performance_review_cycles` (model PerformanceReviewCycle in
 * prisma/schema.prisma). Columns match the prisma model exactly so the
 * TypeORM entity and prisma model stay aligned.
 * Backs the mock-only page /hr/performance/reviews/cycles.
 * ADDITIVE ONLY.
 */
@Entity('hr_performance_review_cycles')
@Index('IDX_hr_performance_review_cycles_companyId', ['companyId'])
export class ReviewCycle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  cycleCode: string;

  @Column()
  cycleName: string;

  @Column({ type: 'varchar', nullable: true })
  description: string;

  // annual, semi_annual, quarterly, monthly
  @Column({ type: 'varchar' })
  cycleType: string;

  @Column()
  fiscalYear: string;

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp' })
  endDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  goalSettingStart: Date;

  @Column({ type: 'timestamp', nullable: true })
  goalSettingEnd: Date;

  @Column({ type: 'timestamp', nullable: true })
  selfAppraisalStart: Date;

  @Column({ type: 'timestamp', nullable: true })
  selfAppraisalEnd: Date;

  @Column({ type: 'timestamp', nullable: true })
  managerReviewStart: Date;

  @Column({ type: 'timestamp', nullable: true })
  managerReviewEnd: Date;

  @Column({ type: 'timestamp', nullable: true })
  peerReviewStart: Date;

  @Column({ type: 'timestamp', nullable: true })
  peerReviewEnd: Date;

  @Column({ type: 'timestamp', nullable: true })
  calibrationStart: Date;

  @Column({ type: 'timestamp', nullable: true })
  calibrationEnd: Date;

  @Column({ type: 'timestamp', nullable: true })
  feedbackStart: Date;

  @Column({ type: 'timestamp', nullable: true })
  feedbackEnd: Date;

  @Column({ type: 'boolean', default: true })
  includeSelfAppraisal: boolean;

  @Column({ type: 'boolean', default: true })
  includeManagerReview: boolean;

  @Column({ type: 'boolean', default: false })
  includePeerReview: boolean;

  @Column({ type: 'boolean', default: false })
  include360Review: boolean;

  @Column({ type: 'boolean', default: true })
  includeGoals: boolean;

  @Column({ type: 'boolean', default: true })
  includeCompetencies: boolean;

  @Column({ type: 'numeric', nullable: true, default: 60 })
  goalsWeightage: number;

  @Column({ type: 'numeric', nullable: true, default: 40 })
  competenciesWeightage: number;

  @Column({ type: 'numeric', nullable: true, default: 20 })
  selfAppraisalWeightage: number;

  @Column({ type: 'numeric', nullable: true, default: 60 })
  managerReviewWeightage: number;

  @Column({ type: 'numeric', nullable: true, default: 20 })
  peerReviewWeightage: number;

  // 3_point, 4_point, 5_point, custom
  @Column({ type: 'varchar', default: '5_point' })
  ratingScale: string;

  @Column({ type: 'jsonb', nullable: true })
  ratingLabels: Record<string, unknown>;

  // draft, active, in_progress, completed, archived
  @Column({ type: 'varchar', default: 'draft' })
  status: string;

  @Column()
  companyId: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
