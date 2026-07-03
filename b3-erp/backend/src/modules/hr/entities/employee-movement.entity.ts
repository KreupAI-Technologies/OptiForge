import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * HR Employee Movement
 * Backs the /hr/employees/transfers-promotions page. A single record covers
 * both transfers and promotions (and combined "both") for an employee, along
 * with its approval workflow state.
 */
@Entity('hr_employee_movements')
export class EmployeeMovement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  companyId: string;

  @Column({ type: 'varchar', nullable: true })
  employeeCode: string;

  @Column({ type: 'varchar', nullable: true })
  name: string;

  // 'promotion' | 'transfer' | 'both'
  @Column({ type: 'varchar', default: 'promotion' })
  type: string;

  @Column({ type: 'varchar', nullable: true })
  fromDesignation: string;

  @Column({ type: 'varchar', nullable: true })
  toDesignation: string;

  @Column({ type: 'varchar', nullable: true })
  fromDepartment: string;

  @Column({ type: 'varchar', nullable: true })
  toDepartment: string;

  @Column({ type: 'varchar', nullable: true })
  fromLocation: string;

  @Column({ type: 'varchar', nullable: true })
  toLocation: string;

  @Column({ type: 'varchar', nullable: true })
  effectiveDate: string;

  @Column({ type: 'varchar', nullable: true })
  requestDate: string;

  @Column({ type: 'varchar', nullable: true })
  requestedBy: string;

  @Column({ type: 'varchar', nullable: true })
  approvedBy: string;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  salaryIncrement: number;

  // 'pending' | 'approved' | 'rejected' | 'implemented'
  @Column({ type: 'varchar', default: 'pending' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
