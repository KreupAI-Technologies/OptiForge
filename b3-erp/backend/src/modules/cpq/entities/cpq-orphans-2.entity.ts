import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Second-pass additive entities backing previously mock-only CPQ pages.
 *
 * Every table here is created with CREATE TABLE IF NOT EXISTS (see
 * prisma/manual/orphan_cpq.sql) and never modifies existing CPQ tables.
 * Column names match the property names exactly (TypeORM default naming).
 */

/**
 * Workflow approval requests — backs cpq/workflow/legal and
 * cpq/workflow/executive (also reusable for discount workflows). The
 * `requestType` column discriminates. Rich nested detail (issues, comments,
 * compliance checks, approval chain, financial impact, etc.) is stored under
 * the `payload` JSON column so the page can render the full record.
 */
@Entity('cpq_workflow_requests')
@Index(['companyId', 'requestType'])
export class CPQWorkflowRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column({
    type: 'enum',
    enum: ['legal', 'executive', 'discount'],
    default: 'legal',
  })
  requestType: 'legal' | 'executive' | 'discount';

  @Column({ type: 'varchar', nullable: true })
  reference: string | null;

  @Column({ type: 'varchar', nullable: true })
  documentNumber: string | null;

  @Column({ type: 'varchar', nullable: true })
  customerName: string | null;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  value: number;

  @Column({ type: 'varchar', nullable: true })
  requestedBy: string | null;

  @Column({ type: 'varchar', nullable: true })
  assignedTo: string | null;

  @Column({ type: 'varchar', nullable: true })
  priority: string | null;

  @Column({ type: 'varchar', nullable: true })
  status: string | null;

  @Column({ type: 'varchar', nullable: true })
  requestDate: string | null;

  @Column({ type: 'varchar', nullable: true })
  dueDate: string | null;

  @Column({ type: 'json', nullable: true })
  payload: Record<string, unknown> | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

/**
 * Quote version history rows — backs cpq/quotes/versions.
 */
@Entity('cpq_quote_versions_list')
@Index(['companyId', 'quoteNumber'])
export class CPQQuoteVersionRow {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column({ type: 'varchar', nullable: true })
  quoteNumber: string | null;

  @Column({ type: 'varchar', nullable: true })
  version: string | null;

  @Column({ type: 'varchar', nullable: true })
  customerName: string | null;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  value: number;

  @Column({ type: 'json', nullable: true })
  changes: string[] | null;

  @Column({
    type: 'enum',
    enum: [
      'price-increase',
      'price-decrease',
      'items-added',
      'items-removed',
      'terms-updated',
    ],
    default: 'items-added',
  })
  changeType:
    | 'price-increase'
    | 'price-decrease'
    | 'items-added'
    | 'items-removed'
    | 'terms-updated';

  @Column({ type: 'varchar', nullable: true })
  createdBy: string | null;

  @Column({ type: 'varchar', nullable: true })
  createdDate: string | null;

  @Column({
    type: 'enum',
    enum: ['draft', 'sent', 'current', 'superseded'],
    default: 'draft',
  })
  status: 'draft' | 'sent' | 'current' | 'superseded';

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

/**
 * Notification configuration rows — backs cpq/settings/notifications.
 * `settingType` discriminates email templates, escalation rules, toggles,
 * and thresholds; free-form config lives under the `config` JSON column.
 */
@Entity('cpq_notification_prefs')
@Index(['companyId', 'settingType'])
export class CPQNotificationSettingRow {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column({
    type: 'enum',
    enum: ['email-template', 'escalation-rule', 'toggle', 'threshold'],
    default: 'email-template',
  })
  settingType: 'email-template' | 'escalation-rule' | 'toggle' | 'threshold';

  @Column({ type: 'varchar', nullable: true })
  name: string | null;

  @Column({ type: 'varchar', nullable: true })
  subject: string | null;

  @Column({ type: 'boolean', default: true })
  enabled: boolean;

  @Column({ type: 'json', nullable: true })
  config: Record<string, unknown> | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

/**
 * Role / permission rows — backs cpq/settings/permissions.
 */
@Entity('cpq_permission_roles')
@Index(['companyId'])
export class CPQPermissionRole {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column({ type: 'varchar', nullable: true })
  name: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'int', default: 0 })
  usersCount: number;

  @Column({ type: 'json', nullable: true })
  permissions: Record<string, unknown> | null;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  approvalLimit: number | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

/**
 * External integration endpoints / connected systems — backs
 * cpq/integration/cad, cpq/integration/ecommerce and cpq/integration/erp.
 * The `system` column discriminates by integration family (cad|ecommerce|erp).
 * Secondary per-page datasets are stored under the `metadata` JSON column.
 */
@Entity('cpq_integration_endpoints')
@Index(['companyId', 'system'])
export class CPQIntegrationEndpoint {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column({ default: 'cad' })
  system: string;

  @Column({ type: 'varchar', nullable: true })
  name: string | null;

  @Column({ type: 'varchar', nullable: true })
  type: string | null;

  @Column({
    type: 'enum',
    enum: ['connected', 'disconnected', 'error'],
    default: 'connected',
  })
  status: 'connected' | 'disconnected' | 'error';

  @Column({ type: 'varchar', nullable: true })
  version: string | null;

  @Column({ type: 'varchar', nullable: true })
  lastSync: string | null;

  @Column({ type: 'int', default: 0 })
  recordCount: number;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, unknown> | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

/**
 * Guided product-configurator steps with their selectable options — backs
 * cpq/products/configurator. Options are stored as a JSON array on each step.
 */
@Entity('cpq_config_steps')
@Index(['companyId'])
export class CPQConfigStep {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column({ type: 'varchar', nullable: true })
  title: string | null;

  @Column({ type: 'int', default: 0 })
  stepOrder: number;

  @Column({ type: 'boolean', default: false })
  completed: boolean;

  @Column({ type: 'boolean', default: false })
  active: boolean;

  @Column({ type: 'json', nullable: true })
  options:
    | {
        id?: string;
        name?: string;
        price?: number;
        selected?: boolean;
        image?: string;
      }[]
    | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
