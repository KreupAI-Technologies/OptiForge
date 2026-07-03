import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('crm_approval_workflows')
export class CrmApprovalWorkflow {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: true })
  companyId: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', default: 'custom' })
  type: string;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  // Nested stages / conditions stored as JSON strings.
  @Column({ type: 'text', nullable: true })
  stages: string;

  @Column({ type: 'text', nullable: true })
  conditions: string;

  @Column({ type: 'int', default: 0 })
  totalApprovals: number;

  @Column({ type: 'int', default: 0 })
  pending: number;

  @Column({ type: 'int', default: 0 })
  approved: number;

  @Column({ type: 'int', default: 0 })
  rejected: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
