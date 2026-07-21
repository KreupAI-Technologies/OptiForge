import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

/**
 * Comment on an HR Recognition (net-new HR Performance build)
 *
 * Backs POST /hr/recognitions/:id/comments and is returned inline via
 * GET /hr/recognitions/:id/comments.
 *
 * ADDITIVE ONLY: created with CREATE TABLE IF NOT EXISTS in
 * prisma/manual/orphan_hr_performance_net_new.sql. Never DROP/ALTER existing tables.
 */
@Index('IDX_hr_recognition_comments_recognition', ['recognitionId'])
@Entity('hr_recognition_comments')
export class RecognitionComment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  recognitionId: string;

  @Column({ type: 'varchar', nullable: true })
  authorId: string;

  @Column({ type: 'varchar', nullable: true })
  authorName: string;

  @Column({ type: 'text' })
  body: string;

  @CreateDateColumn()
  createdAt: Date;
}
