import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** HR Document Audit Log (orphan-endpoint build) — backs /hr/documents/compliance/audit. */
@Entity('hr_document_audit_logs')
export class DocumentAuditLog {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() companyId: string;
  @Column({ type: 'varchar', nullable: true }) timestamp: string;
  @Column({ type: 'varchar', default: 'view' }) action: string;
  @Column({ type: 'varchar', nullable: true }) documentType: string;
  @Column({ type: 'varchar', nullable: true }) documentId: string;
  @Column({ type: 'varchar', nullable: true }) employeeId: string;
  @Column({ type: 'varchar', nullable: true }) employeeName: string;
  @Column({ type: 'varchar', nullable: true }) performedBy: string;
  @Column({ type: 'varchar', nullable: true }) performedByRole: string;
  @Column({ type: 'varchar', nullable: true }) ipAddress: string;
  @Column({ type: 'text', nullable: true }) remarks: string;
  @CreateDateColumn() createdAt: Date;
}
