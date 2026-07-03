import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

// Net-new orphan list entity backing /production/maintenance/spares.
@Entity('production_spare_parts')
export class SparePart {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'part_number', type: 'varchar', nullable: true })
  partNumber: string | null;

  @Column({ name: 'part_name', type: 'varchar', nullable: true })
  partName: string | null;

  @Column({ type: 'varchar', length: 30, default: 'mechanical' })
  category: string;

  @Column({ name: 'equipment_compatibility', type: 'jsonb', nullable: true })
  equipmentCompatibility: string[] | null;

  @Column({ name: 'quantity_in_stock', type: 'int', default: 0 })
  quantityInStock: number;

  @Column({ name: 'minimum_stock', type: 'int', default: 0 })
  minimumStock: number;

  @Column({ name: 'reorder_point', type: 'int', default: 0 })
  reorderPoint: number;

  @Column({ type: 'varchar', length: 20, nullable: true })
  unit: string | null;

  @Column({ name: 'unit_cost', type: 'numeric', precision: 14, scale: 2, default: 0 })
  unitCost: number;

  @Column({ type: 'varchar', nullable: true })
  location: string | null;

  @Column({ type: 'varchar', nullable: true })
  supplier: string | null;

  @Column({ name: 'lead_time', type: 'int', default: 0 })
  leadTime: number;

  @Column({ name: 'last_purchase_date', type: 'varchar', nullable: true })
  lastPurchaseDate: string | null;

  @Column({ name: 'usage_rate', type: 'numeric', precision: 12, scale: 2, default: 0 })
  usageRate: number;

  @Column({ type: 'varchar', length: 20, default: 'adequate' })
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
