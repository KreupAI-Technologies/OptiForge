import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('crm_assignment_rules')
export class AssignmentRule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: true })
  companyId: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', default: 'round_robin' })
  type: string;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @Column({ type: 'int', default: 1 })
  priority: number;

  @Column({ type: 'json', nullable: true })
  criteria: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  assignees: Array<Record<string, any>>;

  @Column({ type: 'varchar', nullable: true })
  lastRun: string;

  @Column({ type: 'int', default: 0 })
  totalAssignments: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
