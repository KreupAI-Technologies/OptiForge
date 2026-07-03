import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('workflow_config_templates')
export class WorkflowConfigTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', nullable: true })
  category: string;

  @Column({ type: 'varchar', nullable: true })
  triggerType: string;

  @Column({ type: 'int', default: 0 })
  steps: number;

  @Column({ type: 'int', default: 0 })
  activeInstances: number;

  // active | draft | archived
  @Column({ default: 'active' })
  status: string;

  @Column({ type: 'json', nullable: true })
  stepDetails: Record<string, unknown>[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
