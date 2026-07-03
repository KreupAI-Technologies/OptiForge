import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * HR Shift Assignment
 * Backs the /hr/shifts/assignment page. Records which shift an employee is
 * assigned to and for what effective period.
 */
@Entity('hr_shift_assignments')
export class ShiftAssignment {
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
  shiftCode: string;

  @Column({ type: 'varchar', nullable: true })
  shiftName: string;

  @Column({ type: 'varchar', nullable: true })
  effectiveFrom: string;

  @Column({ type: 'varchar', nullable: true })
  effectiveTo: string;

  @Column({ type: 'varchar', default: 'Active' })
  status: string;

  @Column({ type: 'varchar', nullable: true })
  assignedBy: string;

  @Column({ type: 'varchar', nullable: true })
  assignedDate: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
