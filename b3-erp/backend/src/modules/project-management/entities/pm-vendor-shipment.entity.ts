import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('pm_vendor_shipments')
export class PmVendorShipmentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id', type: 'varchar', default: 'default' })
  companyId: string;

  @Column({ name: 'project_id', type: 'varchar' })
  projectId: string;

  @Column({ name: 'po_id', type: 'varchar', nullable: true })
  poId: string;

  @Column({ name: 'vendor_name', type: 'varchar', nullable: true })
  vendorName: string;

  @Column({ name: 'item_description', type: 'varchar', nullable: true })
  itemDescription: string;

  @Column({ type: 'varchar', default: 'Pending' })
  status: string;

  @Column({ type: 'varchar', nullable: true })
  carrier: string;

  @Column({ name: 'tracking_number', type: 'varchar', nullable: true })
  trackingNumber: string;

  @Column({ name: 'expected_delivery', type: 'varchar', nullable: true })
  expectedDelivery: string;

  @Column({ name: 'last_location', type: 'varchar', nullable: true })
  lastLocation: string;

  @Column({ name: 'tracking_history', type: 'jsonb', nullable: true })
  trackingHistory: any;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'created_by', type: 'varchar', nullable: true })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
