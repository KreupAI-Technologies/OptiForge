import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

// Net-new orphan list entity backing /production/maintenance/requests.
@Entity('production_maintenance_requests')
export class MaintenanceRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'request_number', type: 'varchar', nullable: true })
  requestNumber: string | null;

  @Column({ name: 'equipment_code', type: 'varchar', nullable: true })
  equipmentCode: string | null;

  @Column({ name: 'equipment_name', type: 'varchar', nullable: true })
  equipmentName: string | null;

  @Column({ type: 'varchar', nullable: true })
  location: string | null;

  @Column({ name: 'request_type', type: 'varchar', length: 20, default: 'breakdown' })
  requestType: string;

  @Column({ type: 'varchar', length: 20, default: 'medium' })
  priority: string;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: string;

  @Column({ name: 'requested_by', type: 'varchar', nullable: true })
  requestedBy: string | null;

  @Column({ name: 'request_date', type: 'varchar', nullable: true })
  requestDate: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'assigned_to', type: 'varchar', nullable: true })
  assignedTo: string | null;

  @Column({ name: 'estimated_cost', type: 'numeric', precision: 14, scale: 2, default: 0 })
  estimatedCost: number;

  @Column({ name: 'actual_cost', type: 'numeric', precision: 14, scale: 2, nullable: true })
  actualCost: number | null;

  @Column({ name: 'completion_date', type: 'varchar', nullable: true })
  completionDate: string | null;

  @Column({ type: 'numeric', precision: 8, scale: 2, default: 0 })
  downtime: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
