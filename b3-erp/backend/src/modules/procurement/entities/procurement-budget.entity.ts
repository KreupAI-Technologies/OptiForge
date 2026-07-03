import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('procurement_budgets')
@Index(['companyId', 'fiscalYear'])
export class ProcurementBudget {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  companyId: string;

  @Column({ length: 20, nullable: true })
  fiscalYear: string;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 50, default: 'department' })
  budgetType: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  budget: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  spent: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  committed: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  available: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
