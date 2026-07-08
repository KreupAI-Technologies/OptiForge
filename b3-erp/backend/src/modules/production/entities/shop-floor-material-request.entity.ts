import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

// Net-new entity backing shop-floor material pull requests raised from the
// /production/shopfloor terminal. Distinct from MRP planning material
// requirements — this is an operator-triggered request from the floor.
@Entity('production_shopfloor_material_requests')
export class ShopFloorMaterialRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'request_number', type: 'varchar', nullable: true })
  requestNumber: string | null;

  @Column({ name: 'work_order_id', type: 'varchar', nullable: true })
  workOrderId: string | null;

  @Column({ name: 'work_order_number', type: 'varchar', nullable: true })
  workOrderNumber: string | null;

  @Column({ name: 'work_center_id', type: 'varchar', nullable: true })
  workCenterId: string | null;

  @Column({ name: 'work_center_name', type: 'varchar', nullable: true })
  workCenterName: string | null;

  @Column({ name: 'operator_id', type: 'varchar', nullable: true })
  operatorId: string | null;

  @Column({ name: 'operator_name', type: 'varchar', nullable: true })
  operatorName: string | null;

  @Column({ name: 'item_code', type: 'varchar', nullable: true })
  itemCode: string | null;

  @Column({ name: 'item_name', type: 'varchar', nullable: true })
  itemName: string | null;

  @Column({ type: 'numeric', precision: 15, scale: 4, default: 0 })
  quantity: number;

  @Column({ type: 'varchar', length: 20, default: 'PCS' })
  uom: string;

  @Column({ type: 'varchar', length: 20, default: 'normal' })
  urgency: string;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: string;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ name: 'requested_at', type: 'varchar', nullable: true })
  requestedAt: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
