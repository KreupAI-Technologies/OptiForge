import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

// Net-new orphan settings entity backing /production/die-tool-assets.
// Additive only — distinct table from anything used by DiesToolsService.
@Entity('production_die_tool_assets')
export class DieToolAsset {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'asset_code', unique: true })
  assetCode: string;

  @Column()
  name: string;

  @Column({ type: 'varchar', length: 20, default: 'Tool' })
  type: string;

  @Column({ type: 'varchar', length: 20, default: 'Available' })
  status: string;

  @Column({ name: 'life_used', type: 'int', default: 0 })
  lifeUsed: number;

  @Column({ name: 'max_life', type: 'int', default: 0 })
  maxLife: number;

  @Column({ type: 'varchar', nullable: true })
  location: string | null;

  @Column({ name: 'current_work_order', type: 'varchar', nullable: true })
  currentWorkOrder: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
