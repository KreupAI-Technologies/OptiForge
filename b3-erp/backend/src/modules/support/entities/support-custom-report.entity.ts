import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Support Custom Report
 * Backs the "Custom Report Builder" tab on the /support/reports page. Stores a
 * saved report definition (data source, selected columns, filters, chart type)
 * that can be re-run or shared.
 */
@Entity('support_custom_reports')
export class SupportCustomReport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  // tickets | sla | analytics | csat | agents ...
  @Column({ type: 'varchar' })
  dataSource: string;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  columns: string[];

  @Column({ type: 'jsonb', default: () => "'[]'" })
  filters: Record<string, unknown>[];

  // bar | line | pie | table | null
  @Column({ type: 'varchar', nullable: true })
  chartType: string;

  @Column({ type: 'boolean', default: false })
  isShared: boolean;

  @Column({ type: 'varchar', nullable: true })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
