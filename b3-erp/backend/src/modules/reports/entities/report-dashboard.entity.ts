import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * Additive store for user-saved custom dashboards (the "My Dashboards" list on
 * the /reports/dashboards page). Pure additive master table — it never replaces
 * or alters existing domain tables and is independent of any Prisma model.
 */
@Entity('report_dashboards')
@Index('report_dashboards_company_idx', ['companyId'])
export class ReportDashboard {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 64 })
  companyId: string;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description: string;

  // Overview | Sales | Operations | Finance | Analytics | Custom
  @Column({ type: 'varchar', length: 60, nullable: true })
  category: string;

  // Free-form dashboard layout / widget configuration.
  @Column({ type: 'jsonb', nullable: true })
  layout: Record<string, unknown>;

  @Column({ type: 'jsonb', nullable: true })
  widgets: Record<string, unknown>[];

  @Column({ type: 'varchar', length: 120, nullable: true })
  createdByName: string;

  @Column({ default: false })
  isDefault: boolean;

  @Column({ default: false })
  isLocked: boolean;

  @Column({ default: false })
  isFavorite: boolean;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
