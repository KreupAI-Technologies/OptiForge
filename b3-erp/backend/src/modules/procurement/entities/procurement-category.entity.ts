import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('procurement_categories')
@Index(['companyId', 'status'])
export class ProcurementCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  companyId: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  code: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  budget: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  spent: number;

  @Column({ type: 'integer', default: 0 })
  suppliers: number;

  @Column({ type: 'integer', default: 0 })
  items: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  manager: string;

  // low | medium | high | critical
  @Column({ type: 'varchar', length: 20, default: 'medium' })
  priority: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  savingsTarget: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  actualSavings: number;

  // active | inactive | planning
  @Column({ type: 'varchar', length: 20, default: 'active' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
