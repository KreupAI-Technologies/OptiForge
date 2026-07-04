import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Support Report Template
 * Backs the /support/reports page. Stores the report-template catalog
 * (name, category, frequency, recipients, last run) that the Report
 * Templates table renders. Derived KPI series stay computed on the FE.
 */
@Entity('support_report_templates')
export class SupportReportTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column()
  name: string;

  // Operations | Performance | Compliance | Customer | Executive
  @Column({ type: 'varchar', nullable: true })
  category: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  // On-Demand | Daily | Weekly | Monthly
  @Column({ type: 'varchar', default: 'On-Demand' })
  frequency: string;

  // Available export formats, e.g. ["PDF", "Excel", "CSV"]
  @Column({ type: 'json', nullable: true })
  format: string[];

  @Column({ type: 'int', default: 0 })
  recipients: number;

  @Column({ default: false })
  scheduled: boolean;

  @Column({ type: 'int', default: 0 })
  popularity: number;

  @Column({ type: 'varchar', nullable: true })
  lastGenerated: string;

  // Free-form extension bag for future attributes.
  @Column({ type: 'json', nullable: true })
  meta: Record<string, unknown>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
