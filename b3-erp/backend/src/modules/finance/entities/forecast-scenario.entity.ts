import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * ForecastScenario — a saved cash-flow forecast scenario with assumptions.
 * Additive table finance_forecast_scenario.
 */
@Entity('finance_forecast_scenario')
export class ForecastScenario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'jsonb', nullable: true })
  assumptions: any;

  @Column({ name: 'horizon_months', type: 'int', default: 12 })
  horizonMonths: number;

  @Column({ name: 'growth_rate', type: 'decimal', precision: 8, scale: 4, default: 0 })
  growthRate: number;

  @Column({ name: 'company_id', length: 100, nullable: true })
  companyId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
