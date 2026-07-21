import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * HR Certification Tracking (orphan-endpoint build)
 * Reuses the prisma table `hr_certification_tracking` (model CertificationTracking).
 * Backs GET/POST/PUT/DELETE /hr/certifications (+ renew, upload). ADDITIVE ONLY.
 */
@Entity('hr_certification_tracking')
@Index('IDX_hr_certification_tracking_companyId', ['companyId'])
export class CertificationTracking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column({ type: 'varchar', nullable: true })
  employeeId: string;

  @Column({ type: 'varchar', nullable: true })
  employeeName: string;

  @Column({ type: 'varchar', nullable: true })
  employeeCode: string;

  // FE createCertification sends certificationName; keep `name` as the column.
  @Column({ type: 'varchar', nullable: true })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  issuer: string;

  @Column({ type: 'varchar', nullable: true })
  issueDate: string;

  @Column({ type: 'varchar', nullable: true })
  expiryDate: string;

  // active, expired, pending_renewal, revoked
  @Column({ type: 'varchar', default: 'active' })
  status: string;

  @Column({ type: 'varchar', nullable: true })
  fileUrl: string;

  @Column({ type: 'jsonb', nullable: true })
  renewalHistory: Record<string, unknown>[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
