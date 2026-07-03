import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

// Net-new orphan entity backing /production/shopfloor/andon.
@Entity('production_andon_lines')
export class AndonLine {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'line_name', type: 'varchar', nullable: true })
  lineName: string | null;

  @Column({ type: 'varchar', length: 20, default: 'running' })
  status: string;

  @Column({ name: 'current_product', type: 'varchar', nullable: true })
  currentProduct: string | null;

  @Column({ name: 'work_order_number', type: 'varchar', nullable: true })
  workOrderNumber: string | null;

  @Column({ type: 'int', default: 0 })
  target: number;

  @Column({ type: 'int', default: 0 })
  actual: number;

  @Column({ type: 'numeric', precision: 6, scale: 2, default: 0 })
  oee: number;

  @Column({ name: 'cycle_time', type: 'int', default: 0 })
  cycleTime: number;

  @Column({ type: 'varchar', nullable: true })
  operator: string | null;

  @Column({ type: 'varchar', length: 40, nullable: true })
  shift: string | null;

  @Column({ type: 'jsonb', nullable: true })
  alerts: any[] | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
