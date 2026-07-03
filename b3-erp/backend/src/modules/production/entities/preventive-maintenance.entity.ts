import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

// Net-new orphan list entity backing /production/maintenance/preventive.
@Entity('production_preventive_maintenance')
export class PreventiveMaintenance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'equipment_code', type: 'varchar', nullable: true })
  equipmentCode: string | null;

  @Column({ name: 'equipment_name', type: 'varchar', nullable: true })
  equipmentName: string | null;

  @Column({ name: 'task_type', type: 'varchar', length: 30, default: 'inspection' })
  taskType: string;

  @Column({ type: 'varchar', length: 20, default: 'monthly' })
  frequency: string;

  @Column({ name: 'last_completed', type: 'varchar', nullable: true })
  lastCompleted: string | null;

  @Column({ name: 'next_due', type: 'varchar', nullable: true })
  nextDue: string | null;

  @Column({ name: 'estimated_duration', type: 'numeric', precision: 8, scale: 2, default: 0 })
  estimatedDuration: number;

  @Column({ name: 'assigned_to', type: 'varchar', nullable: true })
  assignedTo: string | null;

  @Column({ type: 'varchar', length: 20, default: 'scheduled' })
  status: string;

  @Column({ type: 'varchar', length: 20, default: 'medium' })
  priority: string;

  @Column({ name: 'checklist_items', type: 'int', default: 0 })
  checklistItems: number;

  @Column({ name: 'completed_items', type: 'int', default: 0 })
  completedItems: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
