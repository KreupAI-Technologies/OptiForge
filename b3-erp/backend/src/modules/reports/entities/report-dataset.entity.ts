import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * Generic, additive store for pre-computed report datasets.
 *
 * Each row holds the full render payload for a single report page, keyed by
 * (companyId, reportKey). Report pages fetch their dataset by reportKey and use
 * `payload` when present; otherwise they fall back to their built-in defaults.
 *
 * This table is ADDITIVE ONLY — it never replaces or alters existing domain
 * tables. `payload` is a free-form JSON object matching the shape the page
 * renders (summary scalars + arrays such as agingBuckets, rows, etc.).
 */
@Entity('report_datasets')
@Index('report_datasets_company_key_uq', ['companyId', 'reportKey'], { unique: true })
export class ReportDataset {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 64 })
  companyId: string;

  // e.g. "finance.ar-aging", "crm.leads", "inventory.aging"
  @Column({ type: 'varchar', length: 150 })
  reportKey: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  title: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  category: string;

  // Full render payload for the page (summary + arrays).
  @Column({ type: 'jsonb', nullable: true })
  payload: Record<string, unknown>;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
