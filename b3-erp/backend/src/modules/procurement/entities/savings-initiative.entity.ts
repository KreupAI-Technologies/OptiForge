import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('procurement_savings_initiatives')
@Index(['companyId', 'status'])
export class SavingsInitiative {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  companyId: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  category: string;

  // Price Reduction | Volume Consolidation | Supplier Negotiation |
  // Demand Management | Process Improvement
  @Column({ type: 'varchar', length: 100, nullable: true })
  type: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  targetSavings: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  actualSavings: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  owner: string;

  @Column({ type: 'date', nullable: true })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date;

  // planned | active | completed | on-hold | cancelled
  @Column({ type: 'varchar', length: 30, default: 'active' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
