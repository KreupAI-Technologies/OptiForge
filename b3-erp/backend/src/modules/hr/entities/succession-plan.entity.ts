import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * HR Succession Plan (shared, orphan-endpoint build)
 *
 * Single flexible table backing all /hr/succession/* pages. A `recordType`
 * discriminator selects the sub-feature (plans, matrix, positions, talent,
 * development, reports) and the `data` JSON column carries the full row shape
 * the frontend renders, so many mock-only pages share one additive table.
 *
 * ADDITIVE ONLY: table is created with CREATE TABLE IF NOT EXISTS in
 * prisma/manual/orphan_hr.sql. Never DROP/ALTER existing tables.
 */
@Index('IDX_hr_succession_plans_company_type', ['companyId', 'recordType'])
@Entity('hr_succession_plans')
export class SuccessionPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  /** Sub-feature discriminator, e.g. 'plan', 'matrix', 'critical-position',
   *  'position-profile', 'position-risk', 'talent', 'talent-profile',
   *  'talent-development', 'talent-readiness', 'leadership', 'rotation',
   *  'mentoring', 'bench-strength', 'coverage'. */
  @Column({ type: 'varchar' })
  recordType: string;

  /** Optional human-friendly title/name for ordering & display. */
  @Column({ type: 'varchar', nullable: true })
  title: string;

  /** Optional status for filtering. */
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
