import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('it_webhook_endpoints')
@Index(['companyId'])
export class WebhookEndpoint {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  companyId: string;

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  url: string;

  @Column({ type: 'simple-array', nullable: true })
  events: string[];

  @Column({ length: 50, default: 'active' })
  status: string;

  @Column({ length: 200, nullable: true })
  secret: string;

  @Column({ length: 50, nullable: true })
  lastTriggered: string;

  @Column({ type: 'integer', default: 0 })
  successCount: number;

  @Column({ type: 'integer', default: 0 })
  failureCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
