import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('pm_project_categories')
export class PmProjectCategoryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id', type: 'varchar', default: 'default' })
  companyId: string;

  @Column({ name: 'category_name', type: 'varchar', nullable: true })
  categoryName: string;

  @Column({ name: 'category_code', type: 'varchar', nullable: true })
  categoryCode: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'parent_category', type: 'varchar', nullable: true })
  parentCategory: string;

  @Column({ name: 'project_types', type: 'jsonb', nullable: true })
  projectTypes: string[];

  @Column({ type: 'varchar', nullable: true })
  color: string;

  @Column({ type: 'varchar', nullable: true })
  icon: string;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
