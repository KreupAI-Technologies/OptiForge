import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('crm_social_integrations')
export class SocialIntegration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: true })
  companyId: string;

  @Column()
  platform: string;

  @Column()
  accountName: string;

  @Column({ type: 'varchar', nullable: true })
  accountHandle: string;

  @Column({ default: false })
  connected: boolean;

  @Column({ type: 'int', default: 0 })
  followers: number;

  @Column({ type: 'decimal', precision: 6, scale: 2, default: 0 })
  engagement: number;

  @Column({ type: 'varchar', nullable: true })
  lastSync: string;

  @Column({ type: 'json', nullable: true })
  stats: {
    posts: number;
    likes: number;
    shares: number;
    comments: number;
    reach: number;
  };

  @Column({ type: 'json', nullable: true })
  config: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
