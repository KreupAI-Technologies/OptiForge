import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export type RoutingTemplateStatus = 'active' | 'inactive' | 'draft' | 'archived';

// Net-new orphan settings entity backing /production/routing-templates.
// Additive only — distinct table, does not touch the existing `routings` table.
@Entity('production_routing_templates')
export class RoutingTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string;

  @Column()
  name: string;

  @Column({ name: 'product_code', type: 'varchar', nullable: true })
  productCode: string | null;

  @Column({ name: 'product_name', type: 'varchar', nullable: true })
  productName: string | null;

  @Column({ type: 'varchar', length: 20, default: 'v1.0' })
  version: string;

  @Column({ type: 'varchar', nullable: true })
  department: string | null;

  @Column({ name: 'total_operations', type: 'int', default: 0 })
  totalOperations: number;

  @Column({ name: 'total_setup_time', type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalSetupTime: number;

  @Column({ name: 'total_cycle_time', type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalCycleTime: number;

  @Column({ name: 'total_cost', type: 'decimal', precision: 14, scale: 2, default: 0 })
  totalCost: number;

  @Column({ type: 'varchar', length: 20, default: 'active' })
  status: RoutingTemplateStatus;

  @Column({ name: 'effective_from', type: 'varchar', nullable: true })
  effectiveFrom: string | null;

  @Column({ name: 'effective_to', type: 'varchar', nullable: true })
  effectiveTo: string | null;

  @Column({ type: 'jsonb', nullable: true })
  operations: {
    sequence: number;
    workCenter: string;
    operation: string;
    setupTime: number;
    cycleTime: number;
    laborCost: number;
  }[] | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
