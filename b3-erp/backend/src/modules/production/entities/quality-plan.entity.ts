import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

// Net-new orphan list entity backing /production/quality/plans.
@Entity('production_quality_plans')
export class QualityPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'plan_number', type: 'varchar', nullable: true })
  planNumber: string | null;

  @Column({ name: 'plan_name', type: 'varchar', nullable: true })
  planName: string | null;

  @Column({ name: 'product_code', type: 'varchar', nullable: true })
  productCode: string | null;

  @Column({ name: 'product_name', type: 'varchar', nullable: true })
  productName: string | null;

  @Column({ type: 'varchar', nullable: true })
  category: string | null;

  @Column({ type: 'varchar', length: 20, default: 'v1.0' })
  version: string;

  @Column({ type: 'varchar', length: 20, default: 'draft' })
  status: string;

  @Column({ name: 'created_by', type: 'varchar', nullable: true })
  createdBy: string | null;

  @Column({ name: 'created_date', type: 'varchar', nullable: true })
  createdDate: string | null;

  @Column({ name: 'last_updated', type: 'varchar', nullable: true })
  lastUpdated: string | null;

  @Column({ name: 'approved_by', type: 'varchar', nullable: true })
  approvedBy: string | null;

  @Column({ name: 'approval_date', type: 'varchar', nullable: true })
  approvalDate: string | null;

  @Column({ name: 'inspection_points', type: 'jsonb', nullable: true })
  inspectionPoints: any[] | null;

  @Column({ name: 'acceptance_criteria', type: 'jsonb', nullable: true })
  acceptanceCriteria: string[] | null;

  @Column({ name: 'testing_frequency', type: 'varchar', nullable: true })
  testingFrequency: string | null;

  @Column({ name: 'sampling_size', type: 'int', default: 0 })
  samplingSize: number;

  @Column({ name: 'quality_standard', type: 'varchar', nullable: true })
  qualityStandard: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
