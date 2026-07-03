import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

/** HR Certificate Request (orphan-endpoint build) — backs /hr/documents/certificates/*. recordType = experience|salary|employment. includeDetails = JSON text. */
@Entity('hr_certificate_requests')
export class CertificateRequest {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() companyId: string;
  @Column({ type: 'varchar', default: 'experience' }) recordType: string;
  @Column({ type: 'varchar', nullable: true }) requestDate: string;
  @Column({ type: 'text', nullable: true }) purpose: string;
  @Column({ type: 'varchar', nullable: true }) addressedTo: string;
  @Column({ type: 'varchar', nullable: true }) period: string;
  @Column({ type: 'boolean', default: false }) includeBreakup: boolean;
  @Column({ type: 'text', nullable: true }) includeDetails: string;
  @Column({ type: 'varchar', default: 'email' }) deliveryMode: string;
  @Column({ type: 'varchar', default: 'pending' }) status: string;
  @Column({ type: 'varchar', nullable: true }) requestedBy: string;
  @Column({ type: 'varchar', nullable: true }) approvedBy: string;
  @Column({ type: 'varchar', nullable: true }) approvedOn: string;
  @Column({ type: 'varchar', nullable: true }) generatedOn: string;
  @Column({ type: 'varchar', nullable: true }) deliveredOn: string;
  @Column({ type: 'varchar', nullable: true }) rejectedReason: string;
  @Column({ type: 'text', nullable: true }) remarks: string;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
