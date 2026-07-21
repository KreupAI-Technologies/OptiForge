import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * HR Performance Review Meeting (net-new HR Performance build)
 *
 * Backs GET/POST/PUT /hr/review-meetings and the reschedule action on the
 * app/hr/performance/reviews/meetings page.
 *
 * ADDITIVE ONLY: created with CREATE TABLE IF NOT EXISTS in
 * prisma/manual/orphan_hr_performance_net_new.sql. Never DROP/ALTER existing tables.
 */
@Index('IDX_hr_review_meetings_company', ['companyId'])
@Entity('hr_review_meetings')
export class ReviewMeeting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column({ type: 'varchar', nullable: true })
  reviewId: string;

  @Column({ type: 'varchar', nullable: true })
  employeeId: string;

  @Column({ type: 'varchar', nullable: true })
  employeeName: string;

  @Column({ type: 'varchar', nullable: true })
  role: string;

  @Column({ type: 'varchar', nullable: true, default: 'review_discussion' })
  meetingType: string;

  /** e.g. 'remote' | 'in_person'. */
  @Column({ type: 'varchar', nullable: true })
  type: string;

  @Column({ type: 'varchar', nullable: true })
  scheduledDate: string;

  @Column({ type: 'varchar', nullable: true })
  scheduledTime: string;

  @Column({ type: 'varchar', nullable: true })
  duration: string;

  @Column({ type: 'varchar', nullable: true })
  location: string;

  @Column({ type: 'varchar', nullable: true })
  meetingLink: string;

  @Column({ type: 'varchar', nullable: true, default: 'scheduled' })
  status: string;

  @Column({ type: 'text', nullable: true })
  agenda: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
