import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * SalaryTemplate (orphan-endpoint build)
 * Backs hr/salary-templates. ADDITIVE ONLY.
 */
@Entity('hr_salary_templates')
@Index('IDX_hr_salary_templates_companyId', ['companyId'])
export class SalaryTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column({ type: 'varchar', nullable: true })
  templateCode: string;
  @Column({ type: 'varchar', nullable: true })
  templateName: string;
  @Column({ type: 'varchar', nullable: true })
  grade: string;
  @Column({ type: 'varchar', nullable: true })
  employmentType: string;
  @Column({ type: 'varchar', nullable: true })
  ctcRange: string;
  @Column({ type: 'jsonb', nullable: true })
  components: any;
  @Column({ type: 'int', default: 0 })
  assignedCount: number;
  @Column({ type: 'varchar', default: 'active' })
  status: string;
  @Column({ type: 'varchar', nullable: true })
  createdBy: string;
  @Column({ type: 'varchar', nullable: true })
  createdOn: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
