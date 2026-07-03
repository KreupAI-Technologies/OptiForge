import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Support Agent — backs /support/team/agents.
 * Support desk agent profile with performance metrics and skills.
 */
@Entity('support_agents')
export class SupportAgent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column()
  name: string;

  @Column({ type: 'varchar', nullable: true })
  email: string;

  @Column({ type: 'varchar', nullable: true })
  phone: string;

  @Column({ type: 'varchar', nullable: true })
  role: string;

  @Column({ type: 'varchar', nullable: true })
  team: string;

  @Column({ type: 'varchar', default: 'Offline' })
  status: string;

  @Column({ type: 'varchar', nullable: true })
  avatar: string;

  @Column({ type: 'varchar', nullable: true })
  joinDate: string;

  @Column({ type: 'varchar', nullable: true })
  location: string;

  @Column({ type: 'varchar', nullable: true })
  shift: string;

  @Column({ type: 'int', default: 0 })
  activeTickets: number;

  @Column({ type: 'int', default: 0 })
  resolvedToday: number;

  @Column({ type: 'int', default: 0 })
  resolvedThisMonth: number;

  @Column({ type: 'varchar', nullable: true })
  avgResolutionTime: string;

  @Column({ type: 'numeric', precision: 4, scale: 2, default: 0 })
  satisfaction: number;

  @Column({ type: 'varchar', nullable: true })
  responseTime: string;

  @Column({ type: 'numeric', precision: 5, scale: 2, default: 0 })
  slaCompliance: number;

  @Column({ type: 'json', nullable: true })
  skills: string[];

  @Column({ type: 'json', nullable: true })
  specializations: string[];

  @Column({ type: 'json', nullable: true })
  certifications: string[];

  @Column({ type: 'json', nullable: true })
  performance: { thisMonth: number; lastMonth: number; trend: string };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
