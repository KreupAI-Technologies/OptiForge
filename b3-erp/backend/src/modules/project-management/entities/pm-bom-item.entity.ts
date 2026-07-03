import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('pm_bom_items')
export class PmBomItemEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id', type: 'varchar', default: 'default' })
  companyId: string;

  @Column({ name: 'project_id', type: 'varchar', nullable: true })
  projectId: string;

  @Column({ name: 'parent_id', type: 'varchar', nullable: true })
  parentId: string;

  @Column({ name: 'item_id', type: 'varchar', nullable: true })
  itemId: string;

  @Column({ type: 'varchar', nullable: true })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  sku: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  quantity: number;

  @Column({ type: 'varchar', nullable: true })
  uom: string;

  @Column({ type: 'int', default: 0 })
  level: number;

  @Column({ type: 'varchar', default: 'In Stock' })
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
