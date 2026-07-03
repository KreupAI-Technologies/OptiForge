import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * SkillAssessment (orphan-endpoint build)
 * Backs hr/skill-assessments. ADDITIVE ONLY.
 */
@Entity('hr_skill_assessments')
@Index('IDX_hr_skill_assessments_companyId', ['companyId'])
export class SkillAssessment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column({ type: 'varchar', nullable: true })
  employeeId: string;
  @Column({ type: 'varchar', nullable: true })
  employeeName: string;
  @Column({ type: 'varchar', nullable: true })
  skillCode: string;
  @Column({ type: 'varchar', nullable: true })
  skillName: string;
  @Column({ type: 'varchar', nullable: true })
  category: string;
  @Column({ type: 'varchar', nullable: true })
  assessmentDate: string;
  @Column({ type: 'varchar', nullable: true })
  assessor: string;
  @Column({ type: 'varchar', nullable: true })
  currentLevel: string;
  @Column({ type: 'varchar', nullable: true })
  targetLevel: string;
  @Column({ type: 'int', default: 0 })
  score: number;
  @Column({ type: 'text', nullable: true })
  feedback: string;
  @Column({ type: 'varchar', default: 'pending' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
