import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('pm_dispatch_catalog')
export class PmDispatchCatalogEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id', type: 'varchar', default: 'default' })
  companyId: string;

  @Column({ type: 'varchar', nullable: true })
  code: string;

  @Column({ type: 'varchar', nullable: true })
  name: string;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  weight: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  volume: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
