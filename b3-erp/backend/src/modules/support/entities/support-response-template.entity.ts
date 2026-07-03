import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Support Response Template
 * Backs the /support/automation/responses page. Stores automated
 * response templates plus trigger conditions and effectiveness metrics.
 */
@Entity('support_response_templates')
export class SupportResponseTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column()
  name: string;

  @Column({ type: 'varchar', nullable: true })
  category: string;

  @Column({ type: 'text', nullable: true })
  subject: string;

  @Column({ type: 'text', nullable: true })
  body: string;

  // Trigger definition: { type, conditions: string[] }
  @Column({ type: 'json', nullable: true })
  trigger: {
    type: string;
    conditions: string[];
  };

  @Column({ type: 'varchar', default: 'English' })
  language: string;

  @Column({ default: true })
  active: boolean;

  @Column({ type: 'int', default: 0 })
  usageCount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  effectivenessRate: number;

  @Column({ type: 'varchar', nullable: true })
  avgResponseTime: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
