import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * LeaveEncashment (orphan-endpoint build)
 * Backs hr/leave-encashments. ADDITIVE ONLY.
 */
@Entity('hr_leave_encashments')
@Index('IDX_hr_leave_encashments_companyId', ['companyId'])
export class LeaveEncashment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column({ type: 'varchar', nullable: true })
  employeeId: string;
  @Column({ type: 'varchar', nullable: true })
  employeeName: string;
  @Column({ type: 'varchar', nullable: true })
  financialYear: string;
  @Column({ type: 'varchar', nullable: true })
  requestDate: string;
  @Column({ type: 'varchar', nullable: true })
  leaveType: string;
  @Column({ type: 'varchar', nullable: true })
  leaveTypeCode: string;
  @Column({ type: 'numeric', precision: 14, scale: 2, nullable: true })
  encashedDays: number;
  @Column({ type: 'numeric', precision: 14, scale: 2, nullable: true })
  perDayRate: number;
  @Column({ type: 'numeric', precision: 14, scale: 2, nullable: true })
  grossAmount: number;
  @Column({ type: 'numeric', precision: 14, scale: 2, nullable: true })
  tdsDeducted: number;
  @Column({ type: 'numeric', precision: 14, scale: 2, nullable: true })
  netAmount: number;
  @Column({ type: 'varchar', nullable: true })
  submittedOn: string;
  @Column({ type: 'varchar', nullable: true })
  approvedBy: string;
  @Column({ type: 'varchar', nullable: true })
  approvedOn: string;
  @Column({ type: 'varchar', nullable: true })
  processedOn: string;
  @Column({ type: 'varchar', nullable: true })
  paymentMode: string;
  @Column({ type: 'varchar', nullable: true })
  paymentReference: string;
  @Column({ type: 'varchar', nullable: true })
  paymentMonth: string;
  @Column({ type: 'text', nullable: true })
  remarks: string;
  @Column({ type: 'varchar', default: 'pending' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
