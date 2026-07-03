import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('pm_resource_allocations')
export class PmResourceAllocationEntity {
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

  @Column({ name: 'project_phase', type: 'varchar', nullable: true })
  projectPhase: string;

  @Column({ name: 'allocated_hours', type: 'numeric', precision: 10, scale: 2, default: 0 })
  allocatedHours: number;

  @Column({ name: 'start_date', type: 'varchar', nullable: true })
  startDate: string;

  @Column({ name: 'end_date', type: 'varchar', nullable: true })
  endDate: string;

  @Column({ type: 'int', default: 0 })
  allocation: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
