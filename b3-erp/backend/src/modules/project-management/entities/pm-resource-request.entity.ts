import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * A request for a resource to be assigned to a project. Distinct from an actual
 * allocation (project_resources) — a request is a pending demand that is later
 * approved and turned into an allocation.
 */
@Entity('pm_resource_requests')
export class PmResourceRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id', type: 'varchar', default: 'default' })
  companyId: string;

  @Column({ name: 'project_id', type: 'varchar', nullable: true })
  projectId: string;

  @Column({ name: 'resource_type', type: 'varchar', nullable: true })
  resourceType: string;

  @Column({ name: 'skills_required', type: 'text', nullable: true })
  skillsRequired: string;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ name: 'start_date', type: 'varchar', nullable: true })
  startDate: string;

  @Column({ name: 'end_date', type: 'varchar', nullable: true })
  endDate: string;

  @Column({ name: 'allocation_percentage', type: 'int', default: 100 })
  allocationPercentage: number;

  @Column({ type: 'varchar', default: 'medium' })
  priority: string;

  @Column({ type: 'text', nullable: true })
  justification: string;

  @Column({ type: 'varchar', default: 'pending' })
  status: string;

  @Column({ name: 'requested_by', type: 'varchar', nullable: true })
  requestedBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
