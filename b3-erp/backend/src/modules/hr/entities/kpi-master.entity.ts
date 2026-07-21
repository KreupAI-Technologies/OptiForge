import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * HR KPI Master — reuses the existing prisma table `hr_kpi_master`
 * (model KPIMaster in prisma/schema.prisma). Columns match the prisma
 * model exactly so the TypeORM entity and prisma model stay aligned.
 * Backs the mock-only page /hr/performance/kpi/master.
 * ADDITIVE ONLY.
 */
@Entity('hr_kpi_master')
@Index('IDX_hr_kpi_master_companyId', ['companyId'])
export class KpiMaster {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  kpiCode: string;

  @Column()
  kpiName: string;

  @Column({ type: 'varchar', nullable: true })
  description: string;

  // sales, operations, hr, finance, quality, customer
  @Column({ type: 'varchar' })
  category: string;

  // quantitative, qualitative, milestone
  @Column({ type: 'varchar' })
  kpiType: string;

  // percentage, number, currency, rating
  @Column({ type: 'varchar', nullable: true })
  measurementUnit: string;

  // daily, weekly, monthly, quarterly, annually
  @Column({ type: 'varchar', default: 'monthly' })
  measurementFrequency: string;

  // higher_better, lower_better, target_range
  @Column({ type: 'varchar', default: 'higher_better' })
  targetType: string;

  @Column({ type: 'numeric', nullable: true })
  defaultTarget: number;

  @Column({ type: 'numeric', nullable: true })
  minValue: number;

  @Column({ type: 'numeric', nullable: true })
  maxValue: number;

  // manual, system, integration
  @Column({ type: 'varchar', nullable: true })
  dataSource: string;

  @Column({ type: 'varchar', nullable: true })
  calculationFormula: string;

  @Column({ type: 'varchar', nullable: true })
  linkedMetric: string;

  @Column({ type: 'text', array: true, default: () => "'{}'" })
  applicableTo: string[];

  @Column({ type: 'text', array: true, default: () => "'{}'" })
  applicableDepartments: string[];

  @Column({ type: 'text', array: true, default: () => "'{}'" })
  applicableDesignations: string[];

  @Column()
  companyId: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
