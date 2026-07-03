import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('crm_campaign_automations')
export class CrmCampaignAutomation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: true })
  companyId: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', default: 'draft' })
  status: string;

  @Column({ type: 'varchar', nullable: true })
  trigger: string;

  @Column({ type: 'varchar', default: 'manual' })
  triggerType: string;

  @Column({ type: 'int', default: 0 })
  steps: number;

  @Column({ type: 'int', default: 0 })
  activeContacts: number;

  @Column({ type: 'int', default: 0 })
  completedContacts: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, default: 0 })
  conversionRate: number;

  @Column({ type: 'varchar', nullable: true })
  avgCompletionTime: string;

  @Column({ type: 'varchar', nullable: true })
  createdDate: string;

  @Column({ type: 'varchar', nullable: true })
  lastTriggered: string;

  @Column({ type: 'varchar', nullable: true })
  owner: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
