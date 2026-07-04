import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * SalaryComponentDef (orphan-endpoint build)
 * Backs hr/salary-components. ADDITIVE ONLY.
 */
@Entity('hr_salary_components')
@Index('IDX_hr_salary_components_companyId', ['companyId'])
export class SalaryComponentDef {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column({ type: 'varchar', nullable: true })
  code: string;
  @Column({ type: 'varchar', nullable: true })
  name: string;
  @Column({ type: 'varchar', nullable: true })
  type: string;
  @Column({ type: 'varchar', nullable: true })
  category: string;
  @Column({ type: 'varchar', nullable: true })
  calculationType: string;
  @Column({ type: 'boolean', default: false })
  taxable: boolean;
  @Column({ type: 'boolean', default: false })
  pfApplicable: boolean;
  @Column({ type: 'boolean', default: false })
  esiApplicable: boolean;
  @Column({ type: 'int', default: 0 })
  displayOrder: number;
  @Column({ type: 'varchar', default: 'active' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
