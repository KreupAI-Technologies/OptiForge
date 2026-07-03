import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('pm_boq_line_templates')
export class PmBoqLineTemplateEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id', type: 'varchar', default: 'default' })
  companyId: string;

  @Column({ type: 'varchar', nullable: true })
  item: string;

  @Column({ type: 'varchar', nullable: true })
  description: string;

  @Column({ type: 'varchar', nullable: true })
  unit: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  quantity: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  rate: number;

  @Column({ type: 'numeric', precision: 15, scale: 2, default: 0 })
  amount: number;

  @Column({ name: 'is_valid', type: 'boolean', default: true })
  isValid: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
