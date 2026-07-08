import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export interface BomImportRow {
  code: string;
  description: string;
  quantity: number;
  unitCost: number;
  lineTotal: number;
}

@Entity('estimation_bom_import_sessions')
export class EstimationBomImportSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column({ type: 'varchar', nullable: true })
  estimateId: string;

  @Column()
  fileName: string;

  @Column({ type: 'varchar', default: 'completed' })
  status: string;

  @Column({ type: 'int', default: 0 })
  rowCount: number;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  rows: BomImportRow[];

  @Column({ type: 'jsonb', default: () => "'[]'" })
  errors: string[];

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalValue: number;

  @CreateDateColumn()
  createdAt: Date;
}
