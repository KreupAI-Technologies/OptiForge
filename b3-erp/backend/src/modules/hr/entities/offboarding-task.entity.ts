import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * HR Offboarding Task
 *
 * Shared table backing the previously mock-only offboarding pages under
 * /hr/offboarding (resignations, acceptance, notice-period, early-release,
 * exit-interview, clearance/*, fnf/*, docs/*). A single row represents one
 * employee's record for a given `feature`. Feature-specific fields live in
 * the `data` JSONB column; nested lists (clearance items, exit-interview
 * responses, etc.) live in `items`.
 *
 * ADDITIVE ONLY — see prisma/manual/orphan_hr.sql.
 */
@Entity('hr_offboarding_tasks')
@Index(['companyId', 'feature'])
export class OffboardingTask {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  companyId: string;

  // Discriminates which offboarding page this row belongs to, e.g.
  // 'resignations' | 'acceptance' | 'notice-period' | 'early-release' |
  // 'exit-interview' | 'clearance-it' | 'clearance-hr' | 'clearance-finance' |
  // 'clearance-assets' | 'clearance-checklist' | 'fnf-salary' | 'fnf-payment' |
  // 'fnf-leave' | 'fnf-gratuity' | 'docs-experience' | 'docs-service' |
  // 'docs-relieving'
  @Column({ type: 'varchar' })
  feature: string;

  @Column({ type: 'varchar', nullable: true })
  employeeCode: string;

  @Column({ type: 'varchar', nullable: true })
  employeeName: string;

  @Column({ type: 'varchar', nullable: true })
  designation: string;

  @Column({ type: 'varchar', nullable: true })
  department: string;

  // Generic status; each feature interprets its own vocabulary.
  @Column({ type: 'varchar', default: 'pending' })
  status: string;

  // Feature-specific scalar fields.
  @Column({ type: 'jsonb', nullable: true })
  data: Record<string, any>;

  // Nested list items (clearance line items, interview responses, ...)
  @Column({ type: 'jsonb', nullable: true })
  items: any[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
