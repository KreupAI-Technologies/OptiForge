import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

// Net-new additive table backing Non-Conformance Reports (NCR) raised from the
// Quality Assurance module. No existing procurement NCR entity exists; the
// project-management module's quality "defects" table is a different context.
@Entity('procurement_ncrs')
@Index(['companyId', 'status'])
@Index(['companyId', 'createdAt'])
export class ProcurementNcr {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  companyId: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  ncrNumber: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  inspectionId: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  supplierId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  supplier: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  // minor | major | critical
  @Column({ type: 'varchar', length: 20, default: 'minor' })
  severity: string;

  // open | investigating | capa | closed
  @Column({ type: 'varchar', length: 20, default: 'open' })
  status: string;

  @Column({ type: 'text', nullable: true })
  rootCause: string;

  @Column({ type: 'text', nullable: true })
  correctiveAction: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
