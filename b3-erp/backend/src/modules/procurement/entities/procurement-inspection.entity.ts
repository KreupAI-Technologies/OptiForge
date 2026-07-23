import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

// Net-new additive table backing the Quality Assurance inspection queue.
// Sources the inspection cards + records results / rejections from the UI.
@Entity('procurement_inspections')
@Index(['companyId', 'status'])
@Index(['companyId', 'createdAt'])
export class ProcurementInspection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  companyId: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  poNumber: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  supplierId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  supplier: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  items: string;

  @Column({ type: 'integer', default: 0 })
  quantity: number;

  // low | medium | high | critical
  @Column({ type: 'varchar', length: 20, default: 'medium' })
  priority: string;

  @Column({ type: 'date', nullable: true })
  dueDate: Date;

  // pending | in_progress | completed | failed | rejected
  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  inspector: string;

  // low | medium | high
  @Column({ type: 'varchar', length: 20, default: 'medium' })
  riskLevel: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  templateId: string;

  // pass | fail | null (until results recorded)
  @Column({ type: 'varchar', length: 20, nullable: true })
  result: string;

  @Column({ type: 'integer', nullable: true })
  defectsFound: number;

  @Column({ type: 'text', nullable: true })
  resultNotes: string;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
