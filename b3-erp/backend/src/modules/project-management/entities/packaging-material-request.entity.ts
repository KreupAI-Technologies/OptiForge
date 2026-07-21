import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('packaging_material_requests')
export class PackagingMaterialRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id', type: 'varchar', default: 'default' })
  companyId: string;

  @Column({ name: 'project_id', type: 'varchar', nullable: true })
  projectId: string;

  @Column({ name: 'material_id', type: 'varchar' })
  materialId: string;

  @Column({ name: 'material_name', type: 'varchar' })
  materialName: string;

  @Column({ type: 'numeric', precision: 15, scale: 2, default: 0 })
  quantity: number;

  @Column({ type: 'varchar', nullable: true })
  unit: string;

  @Column({ name: 'required_by', type: 'varchar', nullable: true })
  requiredBy: string;

  @Column({ type: 'varchar', default: 'Medium' })
  priority: string;

  @Column({ type: 'varchar', default: 'Requested' })
  status: string;

  @Column({ name: 'requested_by', type: 'varchar', nullable: true })
  requestedBy: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
