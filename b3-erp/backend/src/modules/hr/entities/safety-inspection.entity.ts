import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * HR Safety Inspection / Audit (orphan-endpoint build). ADDITIVE ONLY.
 * Shared discriminator table backing /hr/safety/audits/* pages:
 * `recordType` = schedule | inspection | finding | action.
 * Page-specific fields live in `meta` (jsonb).
 */
@Entity('hr_safety_inspections')
@Index('IDX_hr_safety_inspections_companyId', ['companyId'])
export class SafetyInspection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column({ type: 'varchar', default: 'inspection' })
  recordType: string;

  @Column({ type: 'varchar', nullable: true })
  code: string;

  @Column({ type: 'varchar', nullable: true })
  title: string;

  @Column({ type: 'varchar', nullable: true })
  auditType: string;

  @Column({ type: 'varchar', nullable: true })
  area: string;

  @Column({ type: 'varchar', nullable: true })
  department: string;

  @Column({ type: 'varchar', nullable: true })
  auditor: string;

  @Column({ type: 'varchar', nullable: true })
  scheduledDate: string;

  @Column({ type: 'varchar', nullable: true })
  completedDate: string;

  @Column({ type: 'varchar', nullable: true })
  frequency: string;

  @Column({ type: 'varchar', nullable: true })
  severity: string;

  @Column({ type: 'varchar', nullable: true })
  priority: string;

  @Column({ type: 'varchar', nullable: true })
  assignedTo: string;

  @Column({ type: 'varchar', nullable: true })
  dueDate: string;

  @Column({ type: 'int', nullable: true })
  score: number;

  @Column({ type: 'int', nullable: true })
  findingsCount: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', default: 'scheduled' })
  status: string;

  @Column({ type: 'text', nullable: true })
  remarks: string;

  @Column({ type: 'jsonb', nullable: true })
  meta: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
