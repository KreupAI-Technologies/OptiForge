import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * Additive store for user-saved / custom reports (the "My Reports" list on the
 * custom report builder page). Pure additive master table — it never replaces
 * or alters existing domain tables and is independent of the Prisma-based
 * SavedReport model.
 */
@Entity('report_saved_items')
@Index('report_saved_items_company_idx', ['companyId'])
export class ReportSavedItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 64 })
  companyId: string;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description: string;

  // finance | sales | inventory | hr | production | quality | custom
  @Column({ type: 'varchar', length: 60, nullable: true })
  category: string;

  // The base data source / dataset the report reads, e.g. "sales_orders".
  @Column({ type: 'varchar', length: 120, nullable: true })
  dataSource: string;

  // Free-form builder configuration (selected fields, filters, chart, etc.).
  @Column({ type: 'jsonb', nullable: true })
  config: Record<string, unknown>;

  @Column({ type: 'varchar', length: 20, default: 'pdf' })
  outputFormat: string;

  @Column({ type: 'varchar', length: 120, nullable: true })
  createdByName: string;

  @Column({ default: false })
  isFavorite: boolean;

  @Column({ default: false })
  isShared: boolean;

  @Column({ type: 'int', default: 0 })
  runCount: number;

  @Column({ type: 'varchar', length: 40, nullable: true })
  lastRunAt: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
