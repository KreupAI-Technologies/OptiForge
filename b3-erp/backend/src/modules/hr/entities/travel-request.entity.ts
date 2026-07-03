import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * HR Travel Request (orphan-endpoint build)
 * Backs /hr/travel/requests and /hr/travel/history (history = completed trips).
 * ADDITIVE ONLY.
 */
@Entity('hr_travel_requests')
@Index('IDX_hr_travel_requests_companyId', ['companyId'])
export class TravelRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column({ type: 'varchar', nullable: true })
  requestNumber: string;

  @Column({ type: 'varchar', nullable: true })
  employeeCode: string;

  @Column({ type: 'varchar', nullable: true })
  employeeName: string;

  @Column({ type: 'varchar', nullable: true })
  department: string;

  @Column({ type: 'varchar', nullable: true })
  designation: string;

  @Column({ type: 'varchar', nullable: true })
  travelType: string;

  @Column({ type: 'text', nullable: true })
  purpose: string;

  @Column({ type: 'varchar', nullable: true })
  fromLocation: string;

  @Column({ type: 'varchar', nullable: true })
  toLocation: string;

  @Column({ type: 'varchar', nullable: true })
  startDate: string;

  @Column({ type: 'varchar', nullable: true })
  endDate: string;

  @Column({ type: 'int', nullable: true })
  duration: number;

  @Column({ type: 'numeric', precision: 14, scale: 2, nullable: true })
  estimatedCost: number;

  @Column({ type: 'numeric', precision: 14, scale: 2, nullable: true })
  totalCost: number;

  @Column({ type: 'numeric', precision: 14, scale: 2, nullable: true })
  advanceAmount: number;

  @Column({ type: 'numeric', precision: 14, scale: 2, nullable: true })
  expensesClaimed: number;

  @Column({ type: 'varchar', default: 'pending' })
  status: string;

  @Column({ type: 'varchar', nullable: true })
  submittedDate: string;

  @Column({ type: 'varchar', nullable: true })
  approver: string;

  @Column({ type: 'varchar', nullable: true })
  approvedDate: string;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
