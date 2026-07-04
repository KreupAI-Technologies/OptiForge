import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * HR Safety Wellness (orphan-endpoint build). ADDITIVE ONLY.
 * Shared discriminator table backing /hr/safety/wellness/* pages:
 * `recordType` = checkup | program | occupational | ergonomics.
 * Page-specific fields live in `meta` (jsonb).
 */
@Entity('hr_safety_wellness')
@Index('IDX_hr_safety_wellness_companyId', ['companyId'])
export class SafetyWellness {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column({ type: 'varchar', default: 'checkup' })
  recordType: string;

  @Column({ type: 'varchar', nullable: true })
  code: string;

  @Column({ type: 'varchar', nullable: true })
  title: string;

  @Column({ type: 'varchar', nullable: true })
  category: string;

  @Column({ type: 'varchar', nullable: true })
  employeeId: string;

  @Column({ type: 'varchar', nullable: true })
  employeeName: string;

  @Column({ type: 'varchar', nullable: true })
  department: string;

  @Column({ type: 'varchar', nullable: true })
  scheduledDate: string;

  @Column({ type: 'varchar', nullable: true })
  completedDate: string;

  @Column({ type: 'varchar', nullable: true })
  provider: string;

  @Column({ type: 'varchar', nullable: true })
  result: string;

  @Column({ type: 'varchar', nullable: true })
  riskLevel: string;

  @Column({ type: 'int', nullable: true })
  participants: number;

  @Column({ type: 'int', nullable: true })
  score: number;

  @Column({ type: 'varchar', nullable: true })
  exposureType: string;

  @Column({ type: 'varchar', nullable: true })
  nextDue: string;

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
