import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Generic CPQ approval-list record.
 *
 * Backs the various approval-queue pages (contract approvals, quote approvals,
 * discount approvals, legal reviews, executive approvals). Each page renders a
 * slightly different card shape, so the page-specific fields are stored in the
 * flexible JSON `payload` column while the common, filterable/sortable fields
 * are first-class columns.
 *
 * This is an ADDITIVE table (cpq_approval_items) and does not modify any
 * existing CPQ approval workflow tables.
 */
@Entity('cpq_approval_items')
@Index(['companyId', 'category'])
export class CPQApprovalItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  // Which approval queue this row belongs to.
  @Column({
    type: 'enum',
    enum: ['quote', 'contract', 'discount', 'legal', 'executive', 'proposal'],
  })
  category:
    | 'quote'
    | 'contract'
    | 'discount'
    | 'legal'
    | 'executive'
    | 'proposal';

  // Human-facing reference (quote number, contract number, etc.).
  @Column({ type: 'varchar', nullable: true })
  reference: string | null;

  @Column({ type: 'varchar', nullable: true })
  title: string | null;

  @Column({ type: 'varchar', nullable: true })
  customerName: string | null;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  value: number | null;

  @Column({ type: 'varchar', nullable: true })
  requestedBy: string | null;

  @Column({
    type: 'enum',
    enum: ['pending', 'approved', 'rejected', 'escalated'],
    default: 'pending',
  })
  status: 'pending' | 'approved' | 'rejected' | 'escalated';

  @Column({
    type: 'enum',
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  })
  priority: 'low' | 'medium' | 'high' | 'urgent';

  @Column({ type: 'text', nullable: true })
  reason: string | null;

  @Column({ type: 'timestamp', nullable: true })
  dueDate: Date | null;

  // Page-specific extra fields (approval chain, comments, discount %, etc.).
  @Column({ type: 'json', nullable: true })
  payload: Record<string, unknown> | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
