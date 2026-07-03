import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Support Assignment Rule — backs /support/automation/assignment.
 */
@Entity('support_assignment_rules')
export class SupportAssignmentRule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int', default: 100 })
  priority: number;

  @Column({ type: 'json', nullable: true })
  conditions: Array<{ field: string; operator: string; value: string }>;

  @Column({ type: 'varchar', default: 'Round Robin' })
  assignmentLogic: string;

  @Column({ type: 'varchar', nullable: true })
  assignTo: string;

  @Column({ default: true })
  active: boolean;

  @Column({ type: 'int', default: 0 })
  matchedTickets: number;

  @Column({ type: 'varchar', nullable: true })
  avgAssignmentTime: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
