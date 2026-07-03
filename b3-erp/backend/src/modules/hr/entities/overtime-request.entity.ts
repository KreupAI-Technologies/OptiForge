import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * HR Overtime Request (orphan-endpoint build)
 * Backs /hr/overtime/requests and /hr/overtime/approval. ADDITIVE ONLY.
 */
@Entity('hr_overtime_requests')
@Index('IDX_hr_overtime_requests_companyId', ['companyId'])
export class OvertimeRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column({ type: 'varchar', nullable: true })
  requestId: string;

  @Column({ type: 'varchar', nullable: true })
  employeeCode: string;

  @Column({ type: 'varchar', nullable: true })
  employeeName: string;

  @Column({ type: 'varchar', nullable: true })
  department: string;

  @Column({ type: 'varchar', nullable: true })
  designation: string;

  @Column({ type: 'varchar', nullable: true })
  date: string;

  @Column({ type: 'varchar', nullable: true })
  shiftType: string;

  @Column({ type: 'numeric', precision: 6, scale: 2, nullable: true })
  regularHours: number;

  @Column({ type: 'numeric', precision: 6, scale: 2, nullable: true })
  overtimeHours: number;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @Column({ type: 'varchar', nullable: true })
  requestDate: string;

  @Column({ type: 'varchar', default: 'pending' })
  status: string;

  @Column({ type: 'varchar', nullable: true })
  approvedBy: string;

  @Column({ type: 'varchar', nullable: true })
  approvedDate: string;

  @Column({ type: 'numeric', precision: 14, scale: 2, nullable: true })
  calculatedAmount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
