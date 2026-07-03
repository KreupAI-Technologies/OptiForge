import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * HR Compliance Audit
 * Backs /hr/compliance/audit/audits. ADDITIVE ONLY.
 */
@Entity('hr_compliance_audits')
@Index('IDX_hr_compliance_audits_companyId', ['companyId'])
export class ComplianceAudit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column({ type: 'varchar', nullable: true })
  auditId: string;

  @Column({ type: 'varchar', nullable: true })
  title: string;

  @Column({ type: 'varchar', nullable: true })
  auditType: string;

  @Column({ type: 'jsonb', nullable: true })
  scope: string[];

  @Column({ type: 'varchar', nullable: true })
  auditor: string;

  @Column({ type: 'varchar', nullable: true })
  scheduledDate: string;

  @Column({ type: 'varchar', nullable: true })
  completedDate: string;

  @Column({ type: 'varchar', default: 'scheduled' })
  status: string;

  @Column({ type: 'int', default: 0 })
  findings: number;

  @Column({ type: 'int', default: 0 })
  criticalFindings: number;

  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })
  complianceScore: number;

  @Column({ type: 'varchar', nullable: true })
  nextAuditDue: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
