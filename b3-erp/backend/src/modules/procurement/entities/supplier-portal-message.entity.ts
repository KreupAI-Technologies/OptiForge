import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

// Net-new additive table backing the Supplier Portal collaboration inbox.
// There is no existing message store scoped to the buyer<->supplier portal
// (vendor_messages is RFQ-thread specific), so this holds portal messages.
@Entity('procurement_supplier_portal_messages')
@Index(['companyId', 'status'])
@Index(['supplierId', 'createdAt'])
export class SupplierPortalMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  companyId: string;

  @Column({ length: 100 })
  supplierId: string;

  @Column({ length: 255 })
  supplierName: string;

  // rfq | po | invoice | quality | general
  @Column({ type: 'varchar', length: 30, default: 'general' })
  type: string;

  @Column({ length: 255 })
  subject: string;

  @Column({ type: 'text' })
  message: string;

  // unread | read | responded
  @Column({ type: 'varchar', length: 20, default: 'unread' })
  status: string;

  // low | medium | high
  @Column({ type: 'varchar', length: 10, default: 'medium' })
  priority: string;

  @Column({ type: 'int', default: 0 })
  attachments: number;

  @Column({ type: 'timestamp', nullable: true })
  respondedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
