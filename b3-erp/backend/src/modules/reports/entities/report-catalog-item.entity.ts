import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * Additive catalog of available reports, grouped by module/category.
 *
 * Each row describes a single report shown on a module report-landing page
 * (e.g. /reports/financial lists all `module = 'financial'` items). This is a
 * pure catalog/master table — it never replaces or alters existing domain
 * tables. Pages read the catalog for their module and render cards linking to
 * the underlying report detail page (`href`).
 */
@Entity('report_catalog_items')
@Index('report_catalog_items_company_module_idx', ['companyId', 'module'])
export class ReportCatalogItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 64 })
  companyId: string;

  // Owning module: financial | sales | inventory | hr | procurement | production
  @Column({ type: 'varchar', length: 60 })
  module: string;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description: string;

  // Sub-grouping within a module, e.g. "Financial Statements", "Payroll".
  @Column({ type: 'varchar', length: 120, nullable: true })
  category: string;

  // How often the report is typically run, e.g. Monthly, Weekly, On-Demand.
  @Column({ type: 'varchar', length: 60, nullable: true })
  frequency: string;

  // Deep-link to the report detail page, e.g. "/reports/finance/pl".
  @Column({ type: 'varchar', length: 300, nullable: true })
  href: string;

  // ISO date (yyyy-mm-dd) of the last generation, if any.
  @Column({ type: 'varchar', length: 40, nullable: true })
  lastGenerated: string;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
