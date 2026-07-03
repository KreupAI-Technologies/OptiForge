import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('crm_social_accounts')
export class CrmSocialAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: true })
  companyId: string;

  @Column()
  platform: string;

  @Column({ type: 'varchar', nullable: true })
  handle: string;

  @Column({ type: 'varchar', default: 'connected' })
  status: string;

  @Column({ type: 'int', default: 0 })
  followers: number;

  @Column({ type: 'int', default: 0 })
  posts: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, default: 0 })
  engagement: number;

  @Column({ type: 'int', default: 0 })
  leads: number;

  @Column({ type: 'varchar', nullable: true })
  lastSync: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
