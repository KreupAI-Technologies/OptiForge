import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

// Net-new additive table backing the Quality Assurance inspection templates grid.
@Entity('procurement_inspection_templates')
@Index(['companyId', 'category'])
export class ProcurementInspectionTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  companyId: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  category: string;

  @Column({ type: 'integer', default: 0 })
  checkpoints: number;

  @Column({ type: 'integer', default: 0 })
  usage: number;

  @Column({ type: 'date', nullable: true })
  lastUsed: Date;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
