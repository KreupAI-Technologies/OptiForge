import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Shared discriminator table for all customer-feedback flows:
 * complaints, ratings, NPS responses and surveys. The `feedbackType`
 * column distinguishes each variant so a single additive table backs
 * four after-sales feedback pages.
 */
@Entity('as_service_feedback')
export class ServiceFeedback {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // complaint | rating | nps | survey
  @Column({ length: 20, default: 'complaint' })
  feedbackType: string;

  @Column({ length: 100, nullable: true })
  reference: string;

  @Column({ length: 200, nullable: true })
  customerName: string;

  @Column({ length: 200, nullable: true })
  subject: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 100, nullable: true })
  category: string;

  @Column({ length: 20, nullable: true })
  priority: string;

  @Column({ length: 30, default: 'open' })
  status: string;

  // rating / nps score
  @Column({ type: 'numeric', precision: 4, scale: 2, nullable: true })
  score: number;

  @Column({ length: 30, nullable: true })
  serviceType: string;

  @Column({ length: 100, nullable: true })
  region: string;

  @Column({ length: 200, nullable: true })
  assignedTo: string;

  @Column({ type: 'jsonb', nullable: true })
  meta: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
