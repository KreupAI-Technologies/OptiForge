import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('sales_reports')
export class SalesReport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: true })
  companyId: string;

  @Column()
  name: string;

  @Column({ type: 'varchar', default: 'sales' })
  type: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', nullable: true })
  period: string;

  @Column({ type: 'date', nullable: true })
  generatedDate: Date;

  @Column({ type: 'varchar', nullable: true })
  generatedBy: string;

  @Column({ type: 'varchar', nullable: true })
  fileSize: string;

  @Column({ type: 'varchar', default: 'PDF' })
  format: string;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  keyMetrics: { label: string; value: string }[];

  @Column({ type: 'varchar', default: 'ready' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
