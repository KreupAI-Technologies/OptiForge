import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('it_api_endpoints')
@Index(['companyId'])
export class ApiEndpoint {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  companyId: string;

  @Column({ length: 200 })
  name: string;

  @Column({ length: 20, default: 'GET' })
  method: string;

  @Column({ type: 'text', nullable: true })
  path: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 100, default: 'General' })
  category: string;

  @Column({ type: 'boolean', default: true })
  enabled: boolean;

  @Column({ type: 'boolean', default: true })
  authRequired: boolean;

  @Column({ type: 'jsonb', nullable: true })
  parameters: any;

  @Column({ type: 'integer', nullable: true })
  rateLimit: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
