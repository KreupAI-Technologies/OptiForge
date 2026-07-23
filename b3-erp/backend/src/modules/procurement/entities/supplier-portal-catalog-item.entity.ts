import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

// Net-new additive table backing the supplier product catalog upsert from the
// Supplier Portal "Update Catalog" action. Keyed by (companyId, supplierId, sku)
// so a repeated submit updates the existing row rather than duplicating.
@Entity('procurement_supplier_portal_catalog_items')
@Index(['companyId', 'supplierId'])
@Index(['companyId', 'supplierId', 'sku'], { unique: true })
export class SupplierPortalCatalogItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  companyId: string;

  @Column({ length: 100 })
  supplierId: string;

  @Column({ length: 255 })
  supplierName: string;

  @Column({ length: 100 })
  sku: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  category: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  uom: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  unitPrice: number;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency: string;

  @Column({ type: 'integer', nullable: true })
  leadTimeDays: number;

  // active | discontinued
  @Column({ type: 'varchar', length: 20, default: 'active' })
  status: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
