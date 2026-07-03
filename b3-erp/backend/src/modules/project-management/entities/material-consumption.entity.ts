import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('pm_material_consumption')
export class MaterialConsumptionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id', type: 'varchar', default: 'default' })
  companyId: string;

  @Column({ type: 'varchar', nullable: true })
  date: string;

  @Column({ name: 'project_id', type: 'varchar', nullable: true })
  projectId: string;

  @Column({ name: 'project_name', type: 'varchar', nullable: true })
  projectName: string;

  @Column({ name: 'work_package', type: 'varchar', nullable: true })
  workPackage: string;

  @Column({ name: 'material_code', type: 'varchar', nullable: true })
  materialCode: string;

  @Column({ name: 'material_name', type: 'varchar', nullable: true })
  materialName: string;

  @Column({ type: 'varchar', nullable: true })
  category: string;

  @Column({ type: 'varchar', nullable: true })
  unit: string;

  @Column({ name: 'planned_qty', type: 'numeric', precision: 15, scale: 2, default: 0 })
  plannedQty: number;

  @Column({ name: 'consumed_qty', type: 'numeric', precision: 15, scale: 2, default: 0 })
  consumedQty: number;

  @Column({ type: 'numeric', precision: 15, scale: 2, default: 0 })
  variance: number;

  @Column({ name: 'variance_percent', type: 'numeric', precision: 10, scale: 2, default: 0 })
  variancePercent: number;

  @Column({ name: 'unit_cost', type: 'numeric', precision: 15, scale: 2, default: 0 })
  unitCost: number;

  @Column({ name: 'total_cost', type: 'numeric', precision: 15, scale: 2, default: 0 })
  totalCost: number;

  @Column({ type: 'varchar', default: 'Stock' })
  source: string;

  @Column({ name: 'issued_by', type: 'varchar', nullable: true })
  issuedBy: string;

  @Column({ name: 'received_by', type: 'varchar', nullable: true })
  receivedBy: string;

  @Column({ name: 'warehouse_location', type: 'varchar', nullable: true })
  warehouseLocation: string;

  @Column({ type: 'text', nullable: true })
  remarks: string;

  @Column({ type: 'varchar', default: 'Within Budget' })
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
