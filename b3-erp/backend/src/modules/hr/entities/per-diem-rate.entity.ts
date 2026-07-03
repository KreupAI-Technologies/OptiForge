import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * PerDiemRate (orphan-endpoint build)
 * Backs hr/per-diem-rates. ADDITIVE ONLY.
 */
@Entity('hr_per_diem_rates')
@Index('IDX_hr_per_diem_rates_companyId', ['companyId'])
export class PerDiemRate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column({ type: 'varchar', nullable: true })
  locationName: string;
  @Column({ type: 'varchar', nullable: true })
  locationType: string;
  @Column({ type: 'varchar', nullable: true })
  country: string;
  @Column({ type: 'varchar', nullable: true })
  state: string;
  @Column({ type: 'varchar', nullable: true })
  city: string;
  @Column({ type: 'varchar', nullable: true })
  currency: string;
  @Column({ type: 'numeric', precision: 14, scale: 2, nullable: true })
  accommodationRate: number;
  @Column({ type: 'numeric', precision: 14, scale: 2, nullable: true })
  mealsRate: number;
  @Column({ type: 'numeric', precision: 14, scale: 2, nullable: true })
  incidentalsRate: number;
  @Column({ type: 'numeric', precision: 14, scale: 2, nullable: true })
  transportRate: number;
  @Column({ type: 'numeric', precision: 14, scale: 2, nullable: true })
  totalDailyRate: number;
  @Column({ type: 'varchar', nullable: true })
  effectiveFrom: string;
  @Column({ type: 'varchar', nullable: true })
  effectiveTo: string;
  @Column({ type: 'text', nullable: true })
  notes: string;
  @Column({ type: 'varchar', default: 'active' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
