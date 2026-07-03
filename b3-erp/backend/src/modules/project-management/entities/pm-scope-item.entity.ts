import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * PmScopeItemEntity — backs the projects/planning/scope page.
 * Additive table (pm_scope_items).
 */
@Entity('pm_scope_items')
export class PmScopeItemEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id', type: 'varchar', length: 100, default: 'default' })
  companyId: string;

  @Column({ name: 'item_code', type: 'varchar', nullable: true })
  itemCode: string;

  @Column({ name: 'item_name', type: 'varchar', nullable: true })
  itemName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'project_code', type: 'varchar', nullable: true })
  projectCode: string;

  @Column({ name: 'project_name', type: 'varchar', nullable: true })
  projectName: string;

  @Column({ type: 'varchar', default: 'deliverable' })
  category: string;

  @Column({ type: 'varchar', default: 'in-scope' })
  type: string;

  @Column({ type: 'varchar', default: 'defined' })
  status: string;

  @Column({ name: 'wbs_reference', type: 'varchar', nullable: true })
  wbsReference: string;

  @Column({ type: 'varchar', default: 'medium' })
  priority: string;

  @Column({ name: 'estimated_cost', type: 'decimal', precision: 15, scale: 2, default: 0 })
  estimatedCost: number;

  @Column({ name: 'estimated_duration', type: 'int', default: 0 })
  estimatedDuration: number;

  @Column({ type: 'jsonb', nullable: true })
  dependencies: any;

  @Column({ name: 'approved_by', type: 'varchar', nullable: true })
  approvedBy: string;

  @Column({ name: 'approved_date', type: 'varchar', nullable: true })
  approvedDate: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
