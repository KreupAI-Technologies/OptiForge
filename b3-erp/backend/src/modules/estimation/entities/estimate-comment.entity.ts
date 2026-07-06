import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('estimation_comments')
@Index('IDX_estimation_comments_estimate', ['companyId', 'estimateId'])
export class EstimateComment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column({ type: 'varchar' })
  estimateId: string;

  @Column({ type: 'varchar', nullable: true })
  authorId: string;

  @Column({ type: 'varchar', nullable: true })
  authorName: string;

  @Column({ type: 'text' })
  message: string;

  // comment | approval-note | rejection-note | revision-request
  @Column({ type: 'varchar', default: 'comment' })
  commentType: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
