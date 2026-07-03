import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export type ShutterType = 'Glass' | 'Wood' | 'Steel';
export type ShutterStatus = 'Pending' | 'In Production' | 'Ready' | 'Installed';

// Net-new orphan list entity backing /production/shutter-orders.
@Entity('production_shutter_orders')
export class ShutterOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'wo_number', type: 'varchar', nullable: true })
  woNumber: string | null;

  @Column({ name: 'product_name', type: 'varchar', nullable: true })
  productName: string | null;

  @Column({ name: 'shutter_type', type: 'varchar', length: 20, default: 'Glass' })
  shutterType: ShutterType;

  @Column({ type: 'int', default: 0 })
  quantity: number;

  @Column({ name: 'completed_quantity', type: 'int', default: 0 })
  completedQuantity: number;

  @Column({ type: 'varchar', length: 20, default: 'Pending' })
  status: ShutterStatus;

  @Column({ name: 'assigned_to', type: 'varchar', nullable: true })
  assignedTo: string | null;

  @Column({ name: 'start_date', type: 'varchar', nullable: true })
  startDate: string | null;

  @Column({ name: 'target_date', type: 'varchar', nullable: true })
  targetDate: string | null;

  @Column({ type: 'varchar', nullable: true })
  dimensions: string | null;

  @Column({ type: 'varchar', nullable: true })
  finish: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
