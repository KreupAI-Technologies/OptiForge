import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * HR Shift Swap
 * Backs the /hr/shifts/swaps page. Records a request to swap shifts between a
 * requester and a target employee, plus its approval workflow state.
 */
@Entity('hr_shift_swaps')
export class ShiftSwap {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column({ type: 'varchar', nullable: true })
  requesterId: string;

  @Column({ type: 'varchar', nullable: true })
  requesterName: string;

  @Column({ type: 'varchar', nullable: true })
  requesterDepartment: string;

  @Column({ type: 'varchar', nullable: true })
  requesterShift: string;

  @Column({ type: 'varchar', nullable: true })
  requesterDate: string;

  @Column({ type: 'varchar', nullable: true })
  targetId: string;

  @Column({ type: 'varchar', nullable: true })
  targetName: string;

  @Column({ type: 'varchar', nullable: true })
  targetDepartment: string;

  @Column({ type: 'varchar', nullable: true })
  targetShift: string;

  @Column({ type: 'varchar', nullable: true })
  targetDate: string;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @Column({ type: 'varchar', default: 'Pending' })
  status: string;

  @Column({ type: 'varchar', nullable: true })
  requestDate: string;

  @Column({ type: 'varchar', nullable: true })
  approvedBy: string;

  @Column({ type: 'varchar', nullable: true })
  approvedDate: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
