import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('pm_material_status')
export class PmMaterialStatusEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id', type: 'varchar', default: 'default' })
  companyId: string;

  @Column({ name: 'project_id', type: 'varchar', nullable: true })
  projectId: string;

  @Column({ type: 'varchar', nullable: true })
  name: string;

  @Column({ name: 'total_qty', type: 'numeric', precision: 12, scale: 2, default: 0 })
  totalQty: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  reserved: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  ordered: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  received: number;

  @Column({ type: 'varchar', default: 'Procuring' })
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
