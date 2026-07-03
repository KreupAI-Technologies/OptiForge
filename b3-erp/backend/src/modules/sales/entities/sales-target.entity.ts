import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('sales_targets')
export class SalesTarget {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: true })
  companyId: string;

  @Column()
  name: string;

  @Column({ type: 'varchar', default: 'team' })
  type: string;

  @Column({ type: 'varchar', nullable: true })
  period: string;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  target: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  achieved: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, default: 0 })
  progress: number;

  @Column({ type: 'varchar', default: 'on-track' })
  status: string;

  @Column({ type: 'varchar', nullable: true })
  assignedTo: string;

  @Column({ type: 'varchar', nullable: true })
  category: string;

  @Column({ type: 'varchar', nullable: true })
  region: string;

  @Column({ type: 'date', nullable: true })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date;

  @Column({ type: 'int', default: 0 })
  daysRemaining: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
