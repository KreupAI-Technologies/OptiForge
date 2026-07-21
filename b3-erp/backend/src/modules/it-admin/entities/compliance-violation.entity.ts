import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

// Compliance violations raised against a compliance requirement / standard.
// Backs the audit/compliance page "Violations" tab: list (+filters), create,
// and resolve (PUT /:id -> status Resolved + resolvedAt).
@Entity('it_compliance_violations')
@Index(['companyId'])
@Index(['status'])
@Index(['severity'])
export class ComplianceViolation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  companyId: string;

  // Optional link back to the compliance requirement this violates.
  @Column({ nullable: true })
  requirementId: string;

  @Column({ length: 100, default: 'General' })
  category: string; // GDPR | SOC 2 | ISO 27001 | ...

  @Column({ length: 200, nullable: true })
  requirement: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 50, default: 'Medium' })
  severity: string; // Low | Medium | High | Critical

  @Column({ length: 50, default: 'Open' })
  status: string; // Open | In Progress | Resolved

  @Column({ length: 200, nullable: true })
  affectedEntity: string;

  @Column({ length: 200, nullable: true })
  detectedBy: string;

  @Column({ length: 200, nullable: true })
  assignedTo: string;

  @Column({ type: 'timestamp', nullable: true })
  detectedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  dueDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  resolvedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
