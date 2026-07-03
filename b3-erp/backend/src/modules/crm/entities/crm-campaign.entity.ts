import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('crm_campaigns')
export class CrmCampaign {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: true })
  companyId: string;

  @Column()
  name: string;

  @Column({ type: 'varchar', default: 'email' })
  type: string;

  @Column({ type: 'varchar', default: 'draft' })
  status: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', nullable: true })
  startDate: string;

  @Column({ type: 'varchar', nullable: true })
  endDate: string;

  @Column({ type: 'json', nullable: true })
  targetAudience: Record<string, any>;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  budget: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  spent: number;

  @Column({ type: 'json', nullable: true })
  stages: any[];

  @Column({ type: 'json', nullable: true })
  metrics: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  goals: Record<string, any>;

  @Column({ type: 'varchar', nullable: true })
  owner: string;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
