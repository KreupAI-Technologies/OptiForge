import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * PolicyAcknowledgment (orphan-endpoint build)
 * Backs hr/policy-acknowledgments. ADDITIVE ONLY.
 */
@Entity('hr_policy_acknowledgments')
@Index('IDX_hr_policy_acknowledgments_companyId', ['companyId'])
export class PolicyAcknowledgment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column({ type: 'varchar', nullable: true })
  employeeId: string;
  @Column({ type: 'varchar', nullable: true })
  employeeName: string;
  @Column({ type: 'varchar', nullable: true })
  department: string;
  @Column({ type: 'varchar', nullable: true })
  designation: string;
  @Column({ type: 'varchar', nullable: true })
  policyName: string;
  @Column({ type: 'varchar', nullable: true })
  policyVersion: string;
  @Column({ type: 'varchar', nullable: true })
  policyCategory: string;
  @Column({ type: 'varchar', nullable: true })
  assignedDate: string;
  @Column({ type: 'varchar', nullable: true })
  dueDate: string;
  @Column({ type: 'varchar', nullable: true })
  acknowledgmentDate: string;
  @Column({ type: 'varchar', nullable: true })
  acknowledgedVia: string;
  @Column({ type: 'int', default: 0 })
  remindersSent: number;
  @Column({ type: 'varchar', nullable: true })
  lastReminderDate: string;
  @Column({ type: 'text', nullable: true })
  remarks: string;
  @Column({ type: 'varchar', default: 'pending' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
