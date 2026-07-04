import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * HR Safety Management (orphan-endpoint build). ADDITIVE ONLY.
 * Shared discriminator table backing /hr/safety/management/* pages:
 * `recordType` = training | committee | policy | procedure.
 * Page-specific fields live in `meta` (jsonb).
 */
@Entity('hr_safety_trainings')
@Index('IDX_hr_safety_trainings_companyId', ['companyId'])
export class SafetyTraining {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column({ type: 'varchar', default: 'training' })
  recordType: string;

  @Column({ type: 'varchar', nullable: true })
  code: string;

  @Column({ type: 'varchar', nullable: true })
  title: string;

  @Column({ type: 'varchar', nullable: true })
  category: string;

  @Column({ type: 'varchar', nullable: true })
  trainer: string;

  @Column({ type: 'varchar', nullable: true })
  department: string;

  @Column({ type: 'varchar', nullable: true })
  scheduledDate: string;

  @Column({ type: 'varchar', nullable: true })
  completedDate: string;

  @Column({ type: 'int', nullable: true })
  participants: number;

  @Column({ type: 'varchar', nullable: true })
  duration: string;

  @Column({ type: 'varchar', nullable: true })
  memberName: string;

  @Column({ type: 'varchar', nullable: true })
  role: string;

  @Column({ type: 'varchar', nullable: true })
  version: string;

  @Column({ type: 'varchar', nullable: true })
  effectiveDate: string;

  @Column({ type: 'varchar', nullable: true })
  reviewDate: string;

  @Column({ type: 'varchar', nullable: true })
  owner: string;

  @Column({ type: 'int', nullable: true })
  compliancePercent: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', default: 'active' })
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
