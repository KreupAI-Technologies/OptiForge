import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * WorkflowBuilderGraph
 *
 * Backs the visual workflow builder (ReactFlow canvas) at
 * frontend `/admin/workflows/builder`. Stores the raw ReactFlow
 * graph (nodes + edges) as jsonb so the canvas can be saved and
 * reloaded verbatim.
 *
 * Kept intentionally separate from `WorkflowDefinition` (which models
 * a normalized steps/triggers workflow engine definition) so the
 * visual-builder save/load feature does not collide with other
 * workflow work.
 */
@Entity('workflow_builder_graphs')
export class WorkflowBuilderGraph {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'jsonb', nullable: true })
  nodes: any;

  @Column({ type: 'jsonb', nullable: true })
  edges: any;

  @Column({ type: 'varchar', length: 50, default: 'draft' })
  status: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  createdBy: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  updatedBy: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
