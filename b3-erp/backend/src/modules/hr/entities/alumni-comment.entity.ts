import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * HR Alumni Comment (orphan-endpoint build)
 * Backs the comment feature on /hr/alumni/network posts.
 * A comment belongs to an alumni network post (`postId`) and is authored by
 * an alumnus/employee (`authorId`). ADDITIVE ONLY.
 */
@Entity('hr_alumni_comments')
@Index('IDX_hr_alumni_comments_companyId', ['companyId'])
@Index('IDX_hr_alumni_comments_postId', ['postId'])
export class AlumniComment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column({ type: 'varchar' })
  postId: string;

  @Column({ type: 'varchar', nullable: true })
  alumniId: string;

  @Column({ type: 'varchar', nullable: true })
  authorId: string;

  @Column({ type: 'varchar', nullable: true })
  authorName: string;

  @Column({ type: 'text' })
  body: string;

  @Column({ type: 'varchar', default: 'active' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
