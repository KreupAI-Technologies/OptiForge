import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * HR Training Waitlist (orphan-endpoint build)
 * Reuses the prisma table `hr_training_waitlist` (model TrainingWaitlist).
 * Backs GET/POST /hr/training-waitlist (+ notify). ADDITIVE ONLY.
 */
@Entity('hr_training_waitlist')
@Index('IDX_hr_training_waitlist_companyId', ['companyId'])
export class TrainingWaitlist {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column({ type: 'varchar', nullable: true })
  programId: string;

  @Column({ type: 'varchar', nullable: true })
  scheduleId: string;

  @Column({ type: 'varchar', nullable: true })
  employeeId: string;

  @Column({ type: 'varchar', nullable: true })
  employeeName: string;

  @Column({ type: 'int', default: 0 })
  position: number;

  // waiting, notified, enrolled, expired
  @Column({ type: 'varchar', default: 'waiting' })
  status: string;

  @Column({ type: 'timestamp', nullable: true })
  notifiedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
