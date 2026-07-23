import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

// Net-new additive table backing supplier-facing invoice submission from the
// Supplier Portal. The full three-way-matched PurchaseInvoice pipeline is a
// heavyweight buyer-side flow (needs invoiceType/RFQ linkage). This table is a
// lightweight supplier submission register that the AP team later promotes.
@Entity('procurement_supplier_portal_invoices')
@Index(['companyId', 'status'])
@Index(['supplierId', 'createdAt'])
export class SupplierPortalInvoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  companyId: string;

  @Column({ length: 100 })
  supplierId: string;

  @Column({ length: 255 })
  supplierName: string;

  @Column({ length: 100 })
  invoiceNumber: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  poNumber: string;

  @Column({ type: 'date', nullable: true })
  invoiceDate: Date;

  @Column({ type: 'date', nullable: true })
  dueDate: Date;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  amount: number;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency: string;

  // submitted | under-review | approved | rejected | paid
  @Column({ type: 'varchar', length: 20, default: 'submitted' })
  status: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
