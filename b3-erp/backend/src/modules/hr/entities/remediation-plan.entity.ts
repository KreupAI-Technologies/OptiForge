import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * RemediationPlan (orphan-endpoint build)
 * Backs hr/remediation-plans (HR Compliance > Audit > Remediation Plans).
 * Corrective-action plans that close out audit findings. ADDITIVE ONLY.
 */
@Entity('hr_remediation_plans')
@Index('IDX_hr_remediation_plans_companyId', ['companyId'])
export class RemediationPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column({ type: 'varchar', nullable: true })
  planCode: string;
  @Column({ type: 'varchar', nullable: true })
  planTitle: string;
  @Column({ type: 'text', nullable: true })
  description: string;
  @Column({ type: 'varchar', nullable: true })
  findingId: string;
  @Column({ type: 'varchar', nullable: true })
  findingCode: string;
  @Column({ type: 'varchar', nullable: true })
  auditName: string;
  @Column({ type: 'varchar', default: 'medium' })
  priority: string;
  @Column({ type: 'text', nullable: true })
  correctiveAction: string;
  @Column({ type: 'text', nullable: true })
  rootCause: string;
  @Column({ type: 'varchar', nullable: true })
  responsiblePersonName: string;
  @Column({ type: 'varchar', nullable: true })
  startDate: string;
  @Column({ type: 'varchar', nullable: true })
  targetCompletionDate: string;
  @Column({ type: 'varchar', nullable: true })
  actualCompletionDate: string;
  @Column({ type: 'int', default: 0 })
  progressPercent: number;
  @Column({ type: 'text', nullable: true })
  verificationNotes: string;
  @Column({ type: 'text', nullable: true })
  remarks: string;
  @Column({ type: 'varchar', default: 'open' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
