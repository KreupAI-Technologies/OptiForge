import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

// Net-new orphan list entity backing /production/quality/ncr (non-conformance reports).
@Entity('production_ncrs')
export class Ncr {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'ncr_number', type: 'varchar', nullable: true })
  ncrNumber: string | null;

  @Column({ type: 'varchar', nullable: true })
  title: string | null;

  @Column({ name: 'product_code', type: 'varchar', nullable: true })
  productCode: string | null;

  @Column({ name: 'product_name', type: 'varchar', nullable: true })
  productName: string | null;

  @Column({ name: 'work_order', type: 'varchar', nullable: true })
  workOrder: string | null;

  @Column({ name: 'lot_number', type: 'varchar', nullable: true })
  lotNumber: string | null;

  @Column({ name: 'quantity_affected', type: 'int', default: 0 })
  quantityAffected: number;

  @Column({ name: 'detected_by', type: 'varchar', nullable: true })
  detectedBy: string | null;

  @Column({ name: 'detected_date', type: 'varchar', nullable: true })
  detectedDate: string | null;

  @Column({ name: 'detected_stage', type: 'varchar', nullable: true })
  detectedStage: string | null;

  @Column({ type: 'varchar', length: 20, default: 'minor' })
  severity: string;

  @Column({ type: 'varchar', length: 30, default: 'open' })
  status: string;

  @Column({ name: 'nonconformance_type', type: 'varchar', length: 20, default: 'visual' })
  nonconformanceType: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'root_cause', type: 'text', nullable: true })
  rootCause: string | null;

  @Column({ name: 'corrective_action', type: 'text', nullable: true })
  correctiveAction: string | null;

  @Column({ name: 'preventive_action', type: 'text', nullable: true })
  preventiveAction: string | null;

  @Column({ name: 'assigned_to', type: 'varchar', nullable: true })
  assignedTo: string | null;

  @Column({ name: 'target_close_date', type: 'varchar', nullable: true })
  targetCloseDate: string | null;

  @Column({ name: 'actual_close_date', type: 'varchar', nullable: true })
  actualCloseDate: string | null;

  @Column({ name: 'cost_impact', type: 'numeric', precision: 14, scale: 2, default: 0 })
  costImpact: number;

  @Column({ name: 'customer_impact', type: 'boolean', default: false })
  customerImpact: boolean;

  @Column({ type: 'jsonb', nullable: true })
  attachments: string[] | null;

  @Column({ name: 'approved_by', type: 'varchar', nullable: true })
  approvedBy: string | null;

  @Column({ name: 'verified_by', type: 'varchar', nullable: true })
  verifiedBy: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
