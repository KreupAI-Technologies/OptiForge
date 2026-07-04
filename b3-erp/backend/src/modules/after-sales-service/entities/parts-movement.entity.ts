import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Shared discriminator table for spare-parts movements in after-sales:
 * requisitions, consumptions and returns. The `movementType` column
 * distinguishes each variant so a single additive table backs three
 * after-sales parts pages.
 */
@Entity('as_parts_movement')
export class PartsMovement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // requisition | consumption | return
  @Column({ length: 20, default: 'requisition' })
  movementType: string;

  @Column({ length: 100, nullable: true })
  reference: string;

  @Column({ length: 100, nullable: true })
  jobNumber: string;

  @Column({ length: 200, nullable: true })
  engineer: string;

  @Column({ length: 200, nullable: true })
  customerName: string;

  @Column({ length: 30, default: 'pending' })
  status: string;

  @Column({ length: 20, nullable: true })
  priority: string;

  @Column({ type: 'int', default: 0 })
  totalItems: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  totalValue: number;

  @Column({ length: 100, nullable: true })
  warehouse: string;

  @Column({ length: 200, nullable: true })
  reason: string;

  @Column({ type: 'jsonb', nullable: true })
  items: any[];

  @Column({ type: 'jsonb', nullable: true })
  meta: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
