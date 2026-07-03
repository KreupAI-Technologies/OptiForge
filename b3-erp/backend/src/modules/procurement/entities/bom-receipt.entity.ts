import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('procurement_bom_receipts')
@Index(['companyId', 'status'])
export class BomReceipt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  companyId: string;

  @Column({ type: 'varchar', length: 50 })
  bomCode: string;

  @Column({ type: 'varchar', length: 255 })
  productName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  submittedBy: string;

  @Column({ type: 'date', nullable: true })
  submittedDate: Date;

  // Received | PR Generated | PO Created | In Progress
  @Column({ type: 'varchar', length: 50, default: 'Received' })
  status: string;

  @Column({ type: 'integer', default: 0 })
  itemsCount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalValue: number;

  @Column({ type: 'integer', default: 0 })
  accessoriesCount: number;

  @Column({ type: 'integer', default: 0 })
  fittingsCount: number;

  @Column({ type: 'integer', default: 0 })
  materialsCount: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  prNumber: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  poNumber: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
