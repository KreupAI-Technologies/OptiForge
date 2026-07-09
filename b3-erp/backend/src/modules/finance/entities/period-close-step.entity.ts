import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * Period-close checklist read model.
 *
 * One row per (financial period, standard step). Rows are seeded lazily from a
 * fixed set of standard close steps the first time a period's checklist is
 * requested, then updated as steps are completed. This backs the period-close
 * checklist on the finance/accounting/periods page.
 */
@Entity('period_close_steps')
@Index(['financialPeriodId', 'stepKey'], { unique: true })
export class PeriodCloseStep {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  financialPeriodId: string;

  @Column({ length: 60 })
  stepKey: string; // stable identifier, e.g. 'inventory_valuation'

  @Column({ length: 150 })
  stepName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @Column({ length: 30, default: 'not-started' })
  status: string; // not-started, pending, in-progress, completed

  @Column({ length: 100, nullable: true })
  completedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  completedAt?: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
