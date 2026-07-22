import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('procurement_compliance_records')
@Index(['companyId', 'status'])
export class ProcurementComplianceRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  companyId: string;

  @Column({ name: 'supplier_id', type: 'varchar', length: 100, nullable: true })
  supplierId: string;

  @Column({ type: 'varchar', length: 255 })
  requirement: string;

  // compliant | non-compliant | pending | in-progress | expired
  @Column({ type: 'varchar', length: 30, default: 'pending' })
  status: string;

  @Column({ type: 'text', nullable: true })
  evidence: string;

  @Column({ name: 'due_date', type: 'date', nullable: true })
  dueDate: Date;

  @Column({ name: 'completed_date', type: 'date', nullable: true })
  completedDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
