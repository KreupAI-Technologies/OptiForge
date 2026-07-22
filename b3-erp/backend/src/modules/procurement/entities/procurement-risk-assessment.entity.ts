import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('procurement_risk_assessments')
@Index(['companyId', 'status'])
export class ProcurementRiskAssessment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  companyId: string;

  @Column({ name: 'supplier_id', type: 'varchar', length: 100, nullable: true })
  supplierId: string;

  // e.g. financial | operational | compliance | geopolitical | supply
  @Column({ type: 'varchar', length: 100 })
  category: string;

  // low | medium | high | critical
  @Column({ name: 'risk_level', type: 'varchar', length: 30, default: 'medium' })
  riskLevel: string;

  @Column({ type: 'int', default: 3 })
  likelihood: number;

  @Column({ type: 'int', default: 3 })
  impact: number;

  @Column({ name: 'mitigation_plan', type: 'text', nullable: true })
  mitigationPlan: string;

  // identified | assessed | mitigating | monitored | closed
  @Column({ type: 'varchar', length: 30, default: 'identified' })
  status: string;

  @Column({ name: 'review_date', type: 'date', nullable: true })
  reviewDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
