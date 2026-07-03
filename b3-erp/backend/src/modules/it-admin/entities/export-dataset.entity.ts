import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('it_export_datasets')
@Index(['companyId'])
export class ExportDataset {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  companyId: string;

  @Column({ length: 200 })
  name: string;

  @Column({ length: 100, default: 'General' })
  category: string;

  @Column({ type: 'integer', default: 0 })
  recordCount: number;

  @Column({ length: 50, nullable: true })
  size: string;

  @Column({ type: 'boolean', default: true })
  exportable: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
