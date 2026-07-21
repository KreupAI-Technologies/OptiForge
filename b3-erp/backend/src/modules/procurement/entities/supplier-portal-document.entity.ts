import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

// Net-new additive table backing the Supplier Portal document register.
// The vendor.documents JSON blob is unstructured and not queryable; this gives
// the portal a first-class, listable document store with expiry tracking.
@Entity('procurement_supplier_portal_documents')
@Index(['companyId', 'status'])
@Index(['supplierId', 'createdAt'])
export class SupplierPortalDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  companyId: string;

  @Column({ length: 100 })
  supplierId: string;

  @Column({ length: 255 })
  supplierName: string;

  @Column({ length: 255 })
  documentType: string;

  @Column({ length: 255 })
  fileName: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  fileUrl: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  size: string;

  @Column({ type: 'date', nullable: true })
  expiryDate: Date;

  // valid | expiring | expired
  @Column({ type: 'varchar', length: 20, default: 'valid' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
