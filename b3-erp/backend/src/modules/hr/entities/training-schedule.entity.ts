import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * HR Training Schedule (orphan-endpoint build)
 * Reuses the prisma table `hr_training_schedules` (model TrainingSchedule).
 * Backs GET/POST/PUT/DELETE /hr/training-schedules. ADDITIVE ONLY.
 */
@Entity('hr_training_schedules')
@Index('IDX_hr_training_schedules_companyId', ['companyId'])
export class TrainingSchedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column({ type: 'varchar', nullable: true })
  programId: string;

  @Column({ type: 'varchar', nullable: true })
  title: string;

  @Column({ type: 'varchar', nullable: true })
  trainer: string;

  @Column({ type: 'varchar', nullable: true })
  startDate: string;

  @Column({ type: 'varchar', nullable: true })
  endDate: string;

  @Column({ type: 'varchar', nullable: true })
  location: string;

  @Column({ type: 'int', nullable: true })
  capacity: number;

  @Column({ type: 'int', default: 0 })
  enrolled: number;

  @Column({ type: 'varchar', default: 'scheduled' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
