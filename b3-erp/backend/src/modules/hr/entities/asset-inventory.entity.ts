import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * HR Asset Inventory Stock (orphan-endpoint build)
 * Backs /hr/assets/inventory/stock — SKU-level stock levels.
 */
@Entity('hr_asset_inventory')
export class AssetInventory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column({ type: 'varchar', nullable: true })
  assetCode: string;

  @Column({ type: 'varchar', nullable: true })
  assetName: string;

  @Column({ type: 'varchar', nullable: true })
  category: string;

  @Column({ type: 'varchar', nullable: true })
  brand: string;

  @Column({ type: 'varchar', nullable: true })
  model: string;

  @Column({ type: 'int', default: 0 })
  totalQuantity: number;

  @Column({ type: 'int', default: 0 })
  allocated: number;

  @Column({ type: 'int', default: 0 })
  available: number;

  @Column({ type: 'int', default: 0 })
  minStockLevel: number;

  @Column({ type: 'int', default: 0 })
  reorderLevel: number;

  @Column({ type: 'numeric', precision: 14, scale: 2, default: 0 })
  unitCost: number;

  @Column({ type: 'numeric', precision: 16, scale: 2, default: 0 })
  totalValue: number;

  @Column({ type: 'varchar', nullable: true })
  location: string;

  @Column({ type: 'varchar', nullable: true })
  supplier: string;

  @Column({ type: 'varchar', default: 'in_stock' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
