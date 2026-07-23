import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

// Net-new additive table backing supplier-facing quote submission from the
// Supplier Portal "Submit Quote" modal. Distinct from the buyer-side
// VendorQuotation pipeline (which is RFQ-bound and evaluation/award-driven);
// this captures an unsolicited/portal quote the buyer can later convert.
@Entity('procurement_supplier_portal_quotes')
@Index(['companyId', 'status'])
@Index(['supplierId', 'createdAt'])
export class SupplierPortalQuote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  companyId: string;

  @Column({ length: 100 })
  supplierId: string;

  @Column({ length: 255 })
  supplierName: string;

  @Column({ length: 255 })
  itemName: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  reference: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  quantity: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  unitPrice: number;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency: string;

  @Column({ type: 'integer', nullable: true })
  leadTimeDays: number;

  @Column({ type: 'date', nullable: true })
  validUntil: Date;

  // submitted | reviewed | accepted | rejected
  @Column({ type: 'varchar', length: 20, default: 'submitted' })
  status: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
