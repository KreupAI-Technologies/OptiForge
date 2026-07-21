import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('pm_production_jobs')
export class PmProductionJobEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id', type: 'varchar', default: 'default' })
  companyId: string;

  @Column({ name: 'project_id', type: 'varchar' })
  projectId: string;

  // 'laser' | 'bending' | 'fabrication' | 'welding' | 'buffing' | 'shutter'
  @Column({ name: 'operation_type', type: 'varchar' })
  operationType: string;

  @Column({ name: 'job_code', type: 'varchar', nullable: true })
  jobCode: string;

  @Column({ name: 'part_name', type: 'varchar', nullable: true })
  partName: string;

  @Column({ type: 'varchar', nullable: true })
  material: string;

  @Column({ type: 'varchar', nullable: true })
  thickness: string;

  @Column({ type: 'int', default: 0 })
  quantity: number;

  @Column({ type: 'varchar', default: 'Pending' })
  status: string;

  // Op-specific fields (e.g. logoEtchVerified, bends, weldType, finishType, etc.)
  @Column({ type: 'jsonb', nullable: true })
  extra: Record<string, any> | null;

  @Column({ name: 'created_by', type: 'varchar', nullable: true })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
