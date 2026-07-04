import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * HR Safety Hazard / Risk (orphan-endpoint build). ADDITIVE ONLY.
 * Shared discriminator table backing /hr/safety/risk/* pages:
 * `recordType` = hazard | risk | control | evaluation.
 * Page-specific fields live in `meta` (jsonb).
 */
@Entity('hr_safety_hazards')
@Index('IDX_hr_safety_hazards_companyId', ['companyId'])
export class SafetyHazard {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column({ type: 'varchar', default: 'hazard' })
  recordType: string;

  @Column({ type: 'varchar', nullable: true })
  code: string;

  @Column({ type: 'varchar', nullable: true })
  title: string;

  @Column({ type: 'varchar', nullable: true })
  category: string;

  @Column({ type: 'varchar', nullable: true })
  location: string;

  @Column({ type: 'varchar', nullable: true })
  department: string;

  @Column({ type: 'varchar', nullable: true })
  identifiedBy: string;

  @Column({ type: 'varchar', nullable: true })
  date: string;

  @Column({ type: 'varchar', nullable: true })
  severity: string;

  @Column({ type: 'varchar', nullable: true })
  likelihood: string;

  @Column({ type: 'varchar', nullable: true })
  riskLevel: string;

  @Column({ type: 'int', nullable: true })
  riskScore: number;

  @Column({ type: 'varchar', nullable: true })
  owner: string;

  @Column({ type: 'text', nullable: true })
  controlMeasures: string;

  @Column({ type: 'varchar', default: 'open' })
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
