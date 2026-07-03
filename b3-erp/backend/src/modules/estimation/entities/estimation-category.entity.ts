import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('estimation_categories')
@Index(['companyId', 'code'])
export class EstimationCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  companyId: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  code: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  parentCategory: string;

  // material | labor | equipment | overhead | subcontractor | other
  @Column({ type: 'varchar', length: 50, default: 'material' })
  type: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  defaultMarkup: number;

  @Column({ type: 'integer', default: 0 })
  itemCount: number;

  @Column({ type: 'integer', default: 0 })
  sortOrder: number;

  // active | inactive
  @Column({ type: 'varchar', length: 20, default: 'active' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
