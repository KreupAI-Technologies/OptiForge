import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('crm_pipeline_stage_configs')
export class PipelineStageConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: true })
  companyId: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', default: 'sales' })
  pipelineType: string;

  @Column({ type: 'int', default: 0 })
  orderIndex: number;

  @Column({ type: 'int', default: 0 })
  probability: number;

  @Column({ type: 'varchar', default: 'blue' })
  color: string;

  @Column({ type: 'boolean', default: false })
  isWon: boolean;

  @Column({ type: 'boolean', default: false })
  isLost: boolean;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
