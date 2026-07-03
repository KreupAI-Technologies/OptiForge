import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * HR Probation Review (shared, orphan-endpoint build)
 *
 * Single flexible table backing all /hr/probation/* pages. A `recordType`
 * discriminator selects the sub-feature (tracking, reviews, feedback,
 * confirmation) and the `data` JSON column carries the full row shape the
 * frontend renders.
 *
 * ADDITIVE ONLY: created with CREATE TABLE IF NOT EXISTS in
 * prisma/manual/orphan_hr.sql. Never DROP/ALTER existing tables.
 */
@Index('IDX_hr_probation_reviews_company_type', ['companyId', 'recordType'])
@Entity('hr_probation_reviews')
export class ProbationReview {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  /** Sub-feature discriminator, e.g. 'tracking', 'review', 'feedback',
   *  'confirmation'. */
  @Column({ type: 'varchar' })
  recordType: string;

  @Column({ type: 'varchar', nullable: true })
  employeeCode: string;

  @Column({ type: 'varchar', nullable: true })
  status: string;

  /** Full frontend row shape. */
  @Column({ type: 'jsonb', nullable: true })
  data: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
