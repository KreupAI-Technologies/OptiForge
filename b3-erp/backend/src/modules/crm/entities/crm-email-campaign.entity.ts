import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('crm_email_campaigns')
export class CrmEmailCampaign {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: true })
  companyId: string;

  @Column()
  name: string;

  @Column({ type: 'varchar', nullable: true })
  subject: string;

  @Column({ type: 'varchar', default: 'draft' })
  status: string;

  @Column({ type: 'int', default: 0 })
  audience: number;

  @Column({ type: 'int', default: 0 })
  sent: number;

  @Column({ type: 'int', default: 0 })
  delivered: number;

  @Column({ type: 'int', default: 0 })
  opened: number;

  @Column({ type: 'int', default: 0 })
  clicked: number;

  @Column({ type: 'int', default: 0 })
  bounced: number;

  @Column({ type: 'int', default: 0 })
  unsubscribed: number;

  @Column({ type: 'varchar', nullable: true })
  scheduledDate: string;

  @Column({ type: 'varchar', nullable: true })
  sentDate: string;

  @Column({ type: 'varchar', nullable: true })
  template: string;

  @Column({ type: 'varchar', nullable: true })
  from: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
