import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('pm_resource_utilization')
export class PmResourceUtilizationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id', type: 'varchar', default: 'default' })
  companyId: string;

  @Column({ name: 'resource_id', type: 'varchar', nullable: true })
  resourceId: string;

  @Column({ name: 'resource_name', type: 'varchar', nullable: true })
  resourceName: string;

  @Column({ type: 'varchar', nullable: true })
  role: string;

  @Column({ type: 'varchar', nullable: true })
  department: string;

  @Column({ name: 'employee_type', type: 'varchar', nullable: true })
  employeeType: string;

  @Column({ name: 'total_capacity', type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalCapacity: number;

  @Column({ name: 'allocated_hours', type: 'decimal', precision: 10, scale: 2, default: 0 })
  allocatedHours: number;

  @Column({ name: 'actual_hours', type: 'decimal', precision: 10, scale: 2, default: 0 })
  actualHours: number;

  @Column({ type: 'decimal', precision: 6, scale: 2, default: 0 })
  utilization: number;

  @Column({ type: 'decimal', precision: 6, scale: 2, default: 0 })
  efficiency: number;

  @Column({ name: 'billable_hours', type: 'decimal', precision: 10, scale: 2, default: 0 })
  billableHours: number;

  @Column({ name: 'non_billable_hours', type: 'decimal', precision: 10, scale: 2, default: 0 })
  nonBillableHours: number;

  @Column({ name: 'overtime_hours', type: 'decimal', precision: 10, scale: 2, default: 0 })
  overtimeHours: number;

  @Column({ name: 'leave_hours', type: 'decimal', precision: 10, scale: 2, default: 0 })
  leaveHours: number;

  @Column({ name: 'idle_hours', type: 'decimal', precision: 10, scale: 2, default: 0 })
  idleHours: number;

  @Column({ name: 'active_projects', type: 'int', default: 0 })
  activeProjects: number;

  @Column({ name: 'cost_per_hour', type: 'decimal', precision: 15, scale: 2, default: 0 })
  costPerHour: number;

  @Column({ name: 'total_revenue', type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalRevenue: number;

  @Column({ name: 'total_cost', type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalCost: number;

  @Column({ type: 'varchar', nullable: true })
  availability: string;

  @Column({ type: 'varchar', default: 'Active' })
  status: string;

  @Column({ name: 'current_projects', type: 'jsonb', nullable: true })
  currentProjects: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
