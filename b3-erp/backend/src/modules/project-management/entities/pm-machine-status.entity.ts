import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('pm_machine_status')
export class PmMachineStatusEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id', type: 'varchar', default: 'default' })
  companyId: string;

  @Column({ name: 'project_id', type: 'varchar', nullable: true })
  projectId: string;

  @Column({ type: 'varchar', nullable: true })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  type: string;

  @Column({ type: 'varchar', default: 'Idle' })
  status: string;

  @Column({ type: 'int', default: 0 })
  oee: number;

  @Column({ name: 'current_job', type: 'varchar', nullable: true })
  currentJob: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
