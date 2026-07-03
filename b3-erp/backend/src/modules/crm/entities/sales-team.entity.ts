import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('crm_sales_teams')
export class SalesTeam {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: true })
  companyId: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', default: 'sales' })
  type: string;

  @Column({ type: 'varchar', nullable: true })
  manager: string;

  @Column({ type: 'int', default: 0 })
  members: number;

  @Column({ type: 'varchar', default: 'active' })
  status: string;

  @Column({ type: 'json', nullable: true })
  performance: {
    totalRevenue: number;
    totalQuota: number;
    quotaAttainment: number;
    activeDeals: number;
    wonDeals: number;
    avgWinRate: number;
  };

  @Column({ type: 'simple-array', nullable: true })
  territories: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
