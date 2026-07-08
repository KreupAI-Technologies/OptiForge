import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Support Onboarding Task
 * Backs the /support/onboarding checklist page. Stores a customer/user
 * onboarding item with its status, category and estimated effort so the
 * checklist can be tracked against real data instead of local state.
 */
@Entity('support_onboarding_tasks')
export class SupportOnboardingTask {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  // pending | in_progress | completed
  @Column({ type: 'varchar', default: 'pending' })
  status: string;

  // setup | training | data | security
  @Column({ type: 'varchar', default: 'setup' })
  category: string;

  @Column({ type: 'varchar', nullable: true })
  estimatedTime: string;

  @Column({ type: 'integer', default: 0 })
  sortOrder: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
