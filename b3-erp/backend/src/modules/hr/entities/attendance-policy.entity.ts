import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * AttendancePolicy (orphan-endpoint build)
 * Backs hr/attendance-policies. ADDITIVE ONLY.
 */
@Entity('hr_attendance_policies')
@Index('IDX_hr_attendance_policies_companyId', ['companyId'])
export class AttendancePolicy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column({ type: 'varchar', nullable: true })
  name: string;
  @Column({ type: 'varchar', nullable: true })
  type: string;
  @Column({ type: 'text', nullable: true })
  description: string;
  @Column({ type: 'varchar', nullable: true })
  applicableTo: string;
  @Column({ type: 'varchar', nullable: true })
  effectiveFrom: string;
  @Column({ type: 'varchar', default: 'active' })
  status: string;
  @Column({ type: 'jsonb', nullable: true })
  rules: any;
  @Column({ type: 'varchar', nullable: true })
  createdBy: string;
  @Column({ type: 'varchar', nullable: true })
  lastModified: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
