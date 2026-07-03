import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('it_integration_configs')
@Index(['companyId'])
export class IntegrationConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  companyId: string;

  @Column({ length: 200 })
  name: string;

  @Column({ length: 50, default: 'erp' })
  category: string; // erp | payment | shipping | communication | storage | analytics

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 50, default: 'inactive' })
  status: string; // active | inactive | error | configured

  @Column({ length: 100, nullable: true })
  icon: string;

  @Column({ type: 'jsonb', nullable: true })
  config: Record<string, any>;

  @Column({ length: 50, nullable: true })
  lastSync: string;

  @Column({ length: 50, nullable: true })
  syncFrequency: string;

  @Column({ type: 'simple-array', nullable: true })
  features: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
