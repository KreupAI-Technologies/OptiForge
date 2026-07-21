import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Strategic Sourcing strategy / project record.
 *
 * Backs the Strategic Sourcing page "create" modals:
 *  - Create Sourcing Project
 *  - Analyze Spend (persisted as a strategy with type = 'spend_analysis')
 *  - Develop Strategy
 *  - Track Implementation (progress / status updates)
 */
@Entity('procurement_sourcing_strategies')
@Index(['companyId', 'status'])
export class SourcingStrategy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  companyId: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  strategyCode: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  category: string;

  // sourcing_project | spend_analysis | strategy | implementation
  @Column({ type: 'varchar', length: 40, default: 'sourcing_project' })
  strategyType: string;

  // planned | active | in_progress | on_hold | completed | cancelled
  @Column({ type: 'varchar', length: 30, default: 'planned' })
  status: string;

  @Column({ type: 'int', default: 0 })
  progress: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  targetSavings: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  achievedSavings: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  spendUnderManagement: number;

  @Column({ type: 'date', nullable: true })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  targetDate: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  owner: string;

  // Free-form structured payload from the modals (opportunities, initiatives, KPIs, etc.)
  @Column({ type: 'jsonb', nullable: true })
  details: any;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
