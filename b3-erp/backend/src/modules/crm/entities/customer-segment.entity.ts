import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('crm_customer_segments')
export class CustomerSegment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: true })
  companyId: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'simple-array', nullable: true })
  criteria: string[];

  @Column({ type: 'int', default: 0 })
  customerCount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalRevenue: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  avgLifetimeValue: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, default: 0 })
  growthRate: number;

  @Column({ type: 'varchar', default: 'blue' })
  color: string;

  @Column({ type: 'varchar', default: 'active' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
