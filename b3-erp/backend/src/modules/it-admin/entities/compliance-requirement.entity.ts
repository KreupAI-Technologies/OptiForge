import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

// Catalog of compliance requirements (GDPR, ISO 27001, PCI DSS, SOC 2, etc.)
// backing the it-admin audit/compliance page "requirements" tab and the
// aggregated generate-report endpoint.
@Entity('it_compliance_requirements')
@Index(['companyId'])
export class ComplianceRequirement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  companyId: string;

  @Column({ length: 100, default: 'General' })
  standard: string; // GDPR | ISO 27001 | PCI DSS | SOC 2 ...

  @Column({ length: 200 })
  requirement: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 100, default: 'General' })
  category: string;

  @Column({ length: 50, default: 'Compliant' })
  status: string; // Compliant | Partially Compliant | Non-Compliant

  @Column({ length: 50, default: 'Medium' })
  severity: string; // Low | Medium | High | Critical

  @Column({ type: 'integer', default: 100 })
  compliance: number; // 0-100 percentage

  @Column({ length: 50, nullable: true })
  lastAssessed: string;

  @Column({ length: 50, nullable: true })
  nextReview: string;

  @Column({ length: 200, nullable: true })
  owner: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
