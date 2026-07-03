import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * HR Onboarding Task
 *
 * Shared table backing the previously mock-only onboarding pages under
 * /hr/onboarding (checklist, first-day, medical, verification, policies,
 * training, id-card, access, welcome-kit, offers, induction). A single row
 * represents one employee's record for a given `feature`. Feature-specific
 * fields live in the `data` JSONB column; nested lists (checklist items,
 * kit items, induction attendees, etc.) live in `items`.
 *
 * ADDITIVE ONLY — see prisma/manual/orphan_hr.sql.
 */
@Entity('hr_onboarding_tasks')
@Index(['companyId', 'feature'])
export class OnboardingTask {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  companyId: string;

  // Discriminates which onboarding page this row belongs to, e.g.
  // 'checklist' | 'first-day' | 'medical' | 'verification' | 'policies' |
  // 'training' | 'id-card' | 'access' | 'welcome-kit' | 'offers' | 'induction'
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

  @Column({ type: 'varchar', nullable: true })
  joiningDate: string;

  // Generic status; each feature interprets its own vocabulary.
  @Column({ type: 'varchar', default: 'pending' })
  status: string;

  // Feature-specific scalar fields (e.g. clinic, fitness, emailStatus, etc.)
  @Column({ type: 'jsonb', nullable: true })
  data: Record<string, any>;

  // Nested list items (checklist entries, kit items, induction attendees, ...)
  @Column({ type: 'jsonb', nullable: true })
  items: any[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
