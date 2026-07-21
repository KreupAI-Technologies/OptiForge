import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

// Reusable export templates shown on the database/export page. Each template
// pins a format + a set of datasets/tables (and optional column subset), so a
// user can apply it to pre-select tables. `apply` stamps lastUsedAt.
@Entity('it_export_templates')
@Index(['companyId'])
export class ExportTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  companyId: string;

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  // Primary dataset label (kept for simple filtering/back-compat).
  @Column({ length: 100, nullable: true })
  dataset: string;

  @Column({ length: 50, default: 'csv' })
  format: string; // csv | excel | json | sql | xml

  // Tables/datasets this template selects.
  @Column({ type: 'jsonb', nullable: true })
  tables: string[];

  // Optional column subset per template.
  @Column({ type: 'jsonb', nullable: true })
  columns: string[];

  // Optional filters (e.g. date_range, status).
  @Column({ type: 'jsonb', nullable: true })
  filters: string[];

  @Column({ type: 'timestamp', nullable: true })
  lastUsedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
