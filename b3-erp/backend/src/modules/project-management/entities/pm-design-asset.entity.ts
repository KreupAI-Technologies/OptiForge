import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('pm_design_assets')
export class PmDesignAssetEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id', type: 'varchar', default: 'default' })
  companyId: string;

  @Column({ name: 'project_id', type: 'varchar', nullable: true })
  projectId: string;

  @Column({ name: 'file_name', type: 'varchar', nullable: true })
  fileName: string;

  @Column({ type: 'varchar', default: 'drawing' })
  category: string;

  @Column({ type: 'int', default: 1 })
  version: number;

  @Column({ name: 'upload_date', type: 'varchar', nullable: true })
  uploadDate: string;

  @Column({ type: 'varchar', default: 'pending' })
  status: string;

  @Column({ name: 'thumbnail_url', type: 'varchar', nullable: true })
  thumbnailUrl: string;

  @Column({ name: 'file_url', type: 'varchar', nullable: true })
  fileUrl: string;

  @Column({ type: 'text', nullable: true })
  comments: string;

  @Column({ name: 'is_latest', type: 'boolean', default: true })
  isLatest: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
