import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Support Agent Skill Matrix — backs /support/team/skills.
 * Per-agent skill inventory with expertise levels and certifications.
 */
@Entity('support_agent_skills')
export class SupportAgentSkill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column({ type: 'varchar', nullable: true })
  agentId: string;

  @Column()
  agentName: string;

  @Column({ type: 'varchar', nullable: true })
  team: string;

  @Column({ type: 'varchar', nullable: true })
  avatar: string;

  @Column({ type: 'json', nullable: true })
  skills: Array<{
    category: string;
    skillName: string;
    level: string;
    yearsExperience: number;
    certifications: string[];
    lastUpdated: string;
  }>;

  @Column({ type: 'int', default: 0 })
  totalSkills: number;

  @Column({ type: 'int', default: 0 })
  expertLevel: number;

  @Column({ type: 'int', default: 0 })
  certifications: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
