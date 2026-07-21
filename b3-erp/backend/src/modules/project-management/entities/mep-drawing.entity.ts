import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('pm_mep_drawings')
export class MepDrawingEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id', type: 'varchar', default: 'default' })
  companyId: string;

  @Column({ name: 'project_id', type: 'varchar' })
  projectId: string;

  @Column({ name: 'drawing_name', type: 'varchar', nullable: true })
  drawingName: string;

  @Column({ name: 'drawing_number', type: 'varchar', nullable: true })
  drawingNumber: string;

  // Mechanical | Electrical | Plumbing | HVAC | FireFighting
  @Column({ type: 'varchar', nullable: true })
  discipline: string;

  @Column({ type: 'varchar', default: 'Draft' })
  status: string;

  @Column({ type: 'varchar', default: 'R0' })
  revision: string;

  @Column({ name: 'file_url', type: 'varchar', nullable: true })
  fileUrl: string;

  @Column({ name: 'shared_with', type: 'jsonb', nullable: true })
  sharedWith: any;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'created_by', type: 'varchar', nullable: true })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
