import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * TrainingEnrollment (orphan-endpoint build)
 * Backs hr/training-enrollments. ADDITIVE ONLY.
 */
@Entity('hr_training_enrollments')
@Index('IDX_hr_training_enrollments_companyId', ['companyId'])
export class TrainingEnrollment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column({ type: 'varchar', nullable: true })
  employeeId: string;
  @Column({ type: 'varchar', nullable: true })
  employeeName: string;
  @Column({ type: 'varchar', nullable: true })
  programCode: string;
  @Column({ type: 'varchar', nullable: true })
  programTitle: string;
  @Column({ type: 'varchar', nullable: true })
  category: string;
  @Column({ type: 'varchar', nullable: true })
  startDate: string;
  @Column({ type: 'varchar', nullable: true })
  endDate: string;
  @Column({ type: 'numeric', precision: 8, scale: 2, nullable: true })
  duration: number;
  @Column({ type: 'int', default: 0 })
  progress: number;
  @Column({ type: 'int', default: 0 })
  attendance: number;
  @Column({ type: 'varchar', nullable: true })
  instructor: string;
  @Column({ type: 'varchar', nullable: true })
  location: string;
  @Column({ type: 'varchar', nullable: true })
  mode: string;
  @Column({ type: 'boolean', default: false })
  certification: boolean;
  @Column({ type: 'varchar', default: 'upcoming' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
