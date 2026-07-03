import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('pm_mrp_materials')
export class PmMrpMaterialEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id', type: 'varchar', default: 'default' })
  companyId: string;

  @Column({ name: 'item_code', type: 'varchar', nullable: true })
  itemCode: string;

  @Column({ name: 'item_name', type: 'varchar', nullable: true })
  itemName: string;

  @Column({ type: 'varchar', nullable: true })
  category: string;

  @Column({ name: 'required_quantity', type: 'decimal', precision: 15, scale: 2, default: 0 })
  requiredQuantity: number;

  @Column({ type: 'varchar', nullable: true })
  unit: string;

  @Column({ name: 'available_stock', type: 'decimal', precision: 15, scale: 2, default: 0 })
  availableStock: number;

  @Column({ name: 'required_date', type: 'varchar', nullable: true })
  requiredDate: string;

  @Column({ type: 'varchar', default: 'Available' })
  status: string;

  @Column({ type: 'varchar', nullable: true })
  supplier: string;

  @Column({ name: 'unit_cost', type: 'decimal', precision: 15, scale: 2, default: 0 })
  unitCost: number;

  @Column({ name: 'total_cost', type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalCost: number;

  @Column({ name: 'lead_time', type: 'int', default: 0 })
  leadTime: number;

  @Column({ name: 'project_phase', type: 'varchar', nullable: true })
  projectPhase: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
