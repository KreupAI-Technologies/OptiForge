import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

// submitted | shortlisted | rejected | awarded
export type RFQBidStatus = 'submitted' | 'shortlisted' | 'rejected' | 'awarded';

@Entity('procurement_rfq_bids')
@Index(['companyId', 'rfqId'])
@Index(['companyId', 'status'])
export class RFQBid {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  companyId: string;

  @Column({ type: 'varchar', length: 100 })
  rfqId: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  supplierId: string;

  @Column({ type: 'varchar', length: 255 })
  supplierName: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  amount: number;

  @Column({ type: 'varchar', length: 30, default: 'submitted' })
  status: RFQBidStatus;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
