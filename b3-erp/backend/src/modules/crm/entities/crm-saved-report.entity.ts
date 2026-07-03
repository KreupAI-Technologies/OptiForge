import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('crm_saved_reports')
export class CrmSavedReport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: true })
  companyId: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', default: 'table' })
  reportType: string;

  @Column({ type: 'varchar', nullable: true })
  module: string;

  @Column({ type: 'varchar', nullable: true })
  category: string;

  // Report definition (columns, filters, groupBy, chart config) stored as JSON string.
  @Column({ type: 'text', nullable: true })
  definition: string;

  @Column({ type: 'varchar', nullable: true })
  schedule: string;

  @Column({ type: 'boolean', default: false })
  isFavorite: boolean;

  @Column({ type: 'boolean', default: false })
  isShared: boolean;

  @Column({ type: 'varchar', nullable: true })
  createdBy: string;

  @Column({ type: 'varchar', nullable: true })
  lastRun: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
