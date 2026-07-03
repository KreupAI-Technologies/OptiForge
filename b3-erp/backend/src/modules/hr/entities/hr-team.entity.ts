import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * HrTeam (orphan-endpoint build)
 * Backs hr/teams. ADDITIVE ONLY.
 */
@Entity('hr_teams')
@Index('IDX_hr_teams_companyId', ['companyId'])
export class HrTeam {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column({ type: 'varchar', nullable: true })
  code: string;
  @Column({ type: 'varchar', nullable: true })
  name: string;
  @Column({ type: 'varchar', nullable: true })
  department: string;
  @Column({ type: 'varchar', nullable: true })
  teamLead: string;
  @Column({ type: 'varchar', nullable: true })
  teamLeadId: string;
  @Column({ type: 'varchar', nullable: true })
  teamLeadEmail: string;
  @Column({ type: 'varchar', nullable: true })
  teamLeadPhone: string;
  @Column({ type: 'int', default: 0 })
  memberCount: number;
  @Column({ type: 'int', default: 0 })
  activeProjects: number;
  @Column({ type: 'int', default: 0 })
  completedProjects: number;
  @Column({ type: 'numeric', precision: 6, scale: 2, nullable: true })
  avgPerformance: number;
  @Column({ type: 'numeric', precision: 6, scale: 2, nullable: true })
  budgetUtilization: number;
  @Column({ type: 'varchar', nullable: true })
  establishedDate: string;
  @Column({ type: 'varchar', nullable: true })
  location: string;
  @Column({ type: 'varchar', nullable: true })
  shift: string;
  @Column({ type: 'jsonb', nullable: true })
  members: any;
  @Column({ type: 'varchar', default: 'active' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
