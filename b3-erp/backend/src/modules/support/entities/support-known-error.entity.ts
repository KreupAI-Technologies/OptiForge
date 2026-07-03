import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Support Known Error — backs /support/problems/known-errors.
 */
@Entity('support_known_errors')
export class SupportKnownError {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column({ type: 'varchar', nullable: true })
  errorId: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  workaround: string;

  @Column({ type: 'varchar', default: 'Active' })
  status: string;

  @Column({ type: 'varchar', nullable: true })
  category: string;

  @Column({ type: 'json', nullable: true })
  affectedSystems: string[];

  @Column({ type: 'json', nullable: true })
  relatedProblems: string[];

  @Column({ type: 'varchar', nullable: true })
  documentedBy: string;

  @Column({ type: 'varchar', nullable: true })
  documentedDate: string;

  @Column({ type: 'varchar', nullable: true })
  lastUpdated: string;

  @Column({ type: 'int', default: 0 })
  affectedUsers: number;

  @Column({ type: 'varchar', default: 'medium' })
  severity: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
