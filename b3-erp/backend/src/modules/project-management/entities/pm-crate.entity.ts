import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('pm_crates')
export class PmCrateEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id', type: 'varchar', default: 'default' })
  companyId: string;

  @Column({ name: 'project_id', type: 'varchar', nullable: true })
  projectId: string;

  @Column({ type: 'varchar', nullable: true })
  number: string;

  @Column({ type: 'int', default: 0 })
  items: number;

  @Column({ name: 'design_weight', type: 'numeric', precision: 10, scale: 2, default: 0 })
  designWeight: number;

  @Column({ name: 'actual_weight', type: 'numeric', precision: 10, scale: 2, nullable: true })
  actualWeight: number;

  @Column({ type: 'varchar', default: 'Open' })
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
