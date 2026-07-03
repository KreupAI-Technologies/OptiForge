import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * HR Compliance Register / Tracker item
 * Shared table backing two mock-only pages:
 *   - /hr/compliance/labor/registers  (entryType = 'register')
 *   - /hr/compliance/labor/tracker    (entryType = 'tracker')
 * ADDITIVE ONLY.
 */
@Entity('hr_compliance_registers')
@Index('IDX_hr_compliance_registers_companyId', ['companyId'])
export class ComplianceRegister {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  // 'register' | 'tracker'
  @Column({ type: 'varchar', default: 'register' })
  entryType: string;

  @Column({ type: 'varchar', nullable: true })
  registerName: string;

  @Column({ type: 'varchar', nullable: true })
  act: string;

  @Column({ type: 'varchar', nullable: true })
  formNumber: string;

  @Column({ type: 'text', nullable: true })
  requirement: string;

  @Column({ type: 'varchar', nullable: true })
  applicability: string;

  @Column({ type: 'varchar', nullable: true })
  frequency: string;

  @Column({ type: 'varchar', nullable: true })
  responsibility: string;

  @Column({ type: 'varchar', nullable: true })
  lastUpdated: string;

  @Column({ type: 'varchar', nullable: true })
  lastCompleted: string;

  @Column({ type: 'varchar', nullable: true })
  nextDue: string;

  @Column({ type: 'varchar', default: 'compliant' })
  status: string;

  @Column({ type: 'int', nullable: true })
  totalEntries: number;

  @Column({ type: 'varchar', nullable: true })
  format: string;

  @Column({ type: 'varchar', nullable: true })
  retentionPeriod: string;

  @Column({ type: 'jsonb', nullable: true })
  documents: string[];

  @Column({ type: 'text', nullable: true })
  penalties: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
