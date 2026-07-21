import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * HR Recognition / Praise (net-new HR Performance build)
 *
 * Backs GET/POST /hr/recognitions plus the like & comment actions on the
 * app/hr/performance/feedback/recognition page. `likedBy` tracks employee ids
 * so a repeat like is idempotent; `likes` is the derived count.
 *
 * ADDITIVE ONLY: created with CREATE TABLE IF NOT EXISTS in
 * prisma/manual/orphan_hr_performance_net_new.sql. Never DROP/ALTER existing tables.
 */
@Index('IDX_hr_recognitions_company', ['companyId'])
@Entity('hr_recognitions')
export class Recognition {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column({ type: 'varchar', nullable: true })
  fromEmployeeId: string;

  @Column({ type: 'varchar', nullable: true })
  fromEmployeeName: string;

  @Column({ type: 'varchar', nullable: true })
  toEmployeeId: string;

  @Column({ type: 'varchar', nullable: true })
  toEmployeeName: string;

  @Column({ type: 'varchar', nullable: true })
  recognitionType: string;

  /** Core value / category, e.g. 'Teamwork'. */
  @Column({ type: 'varchar', nullable: true })
  category: string;

  @Column({ type: 'varchar', nullable: true })
  title: string;

  @Column({ type: 'text', nullable: true })
  message: string;

  @Column({ type: 'varchar', nullable: true, default: 'public' })
  visibility: string;

  @Column({ type: 'int', default: 0 })
  likes: number;

  @Column({ type: 'text', array: true, default: '{}' })
  likedBy: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
