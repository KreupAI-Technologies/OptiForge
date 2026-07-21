import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * HR Policy
 * Net-new table backing the mock-only policy pages under
 * /hr/documents/policies/{leave,attendance,expense,conduct,handbook,other}.
 * `category` discriminates the category-filtered views.
 * ADDITIVE ONLY — see prisma/manual/orphan_hr_policies.sql.
 */
@Entity('hr_policies')
@Index('IDX_hr_policies_companyId', ['companyId'])
export class HrPolicy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column({ type: 'varchar' })
  title: string;

  // leave | attendance | expense | conduct | handbook | other
  @Column({ type: 'varchar', default: 'other' })
  category: string;

  @Column({ type: 'varchar', default: '1.0' })
  version: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ type: 'varchar', nullable: true })
  fileUrl: string;

  @Column({ type: 'varchar', nullable: true })
  fileName: string;

  @Column({ type: 'text', nullable: true })
  summary: string;

  // draft | published
  @Column({ type: 'varchar', default: 'draft' })
  status: string;

  @Column({ type: 'varchar', nullable: true })
  effectiveDate: string;

  @Column({ type: 'timestamp', nullable: true })
  publishedAt: Date;

  @Column({ type: 'varchar', nullable: true })
  publishedBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
