import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * HR Travel Advance (orphan-endpoint build)
 * Backs /hr/travel/advances. ADDITIVE ONLY.
 */
@Entity('hr_travel_advances')
@Index('IDX_hr_travel_advances_companyId', ['companyId'])
export class TravelAdvance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column({ type: 'varchar', nullable: true })
  advanceNumber: string;

  @Column({ type: 'varchar', nullable: true })
  employeeName: string;

  @Column({ type: 'varchar', nullable: true })
  department: string;

  @Column({ type: 'varchar', nullable: true })
  tripNumber: string;

  @Column({ type: 'varchar', nullable: true })
  destination: string;

  @Column({ type: 'varchar', nullable: true })
  travelDates: string;

  @Column({ type: 'numeric', precision: 14, scale: 2, nullable: true })
  advanceAmount: number;

  @Column({ type: 'varchar', nullable: true })
  requestedDate: string;

  @Column({ type: 'text', nullable: true })
  purpose: string;

  @Column({ type: 'varchar', default: 'pending' })
  status: string;

  @Column({ type: 'varchar', nullable: true })
  approver: string;

  @Column({ type: 'varchar', nullable: true })
  approvedDate: string;

  @Column({ type: 'varchar', nullable: true })
  disbursedDate: string;

  @Column({ type: 'varchar', nullable: true })
  settledDate: string;

  @Column({ type: 'numeric', precision: 14, scale: 2, nullable: true })
  expensesSubmitted: number;

  @Column({ type: 'numeric', precision: 14, scale: 2, nullable: true })
  balanceAmount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
