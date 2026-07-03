import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('crm_email_templates')
export class EmailTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: true })
  companyId: string;

  @Column()
  name: string;

  @Column({ type: 'varchar', nullable: true })
  subject: string;

  @Column({ type: 'varchar', default: 'follow-up' })
  category: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', nullable: true })
  previewText: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ type: 'varchar', default: 'draft' })
  status: string;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ type: 'int', default: 0 })
  usageCount: number;

  @Column({ type: 'varchar', nullable: true })
  lastUsed: string;

  @Column({ type: 'varchar', nullable: true })
  createdBy: string;

  @Column({ type: 'decimal', precision: 6, scale: 2, default: 0 })
  openRate: number;

  @Column({ type: 'decimal', precision: 6, scale: 2, default: 0 })
  clickRate: number;

  @Column({ type: 'decimal', precision: 6, scale: 2, default: 0 })
  conversionRate: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
