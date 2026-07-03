import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('estimation_markup_settings')
export class MarkupSetting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column({ type: 'varchar' })
  category: string;

  @Column({ type: 'varchar', nullable: true })
  subcategory: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  defaultMarkup: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  minMarkup: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  maxMarkup: number;

  // material-only | material-labor | full-cost
  @Column({ type: 'varchar', default: 'full-cost' })
  costBasis: string;

  @Column({ type: 'boolean', default: false })
  approvalRequired: boolean;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  approvalThreshold: number;

  @Column({ type: 'varchar', nullable: true })
  updatedBy: string;

  // active | inactive
  @Column({ type: 'varchar', default: 'active' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
