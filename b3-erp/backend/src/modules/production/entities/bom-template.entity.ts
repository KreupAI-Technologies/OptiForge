import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

// Net-new entity backing assembly/BOM templates used by /production/bom/add.
// A template is a reusable set of component rows the user can start a new BOM from.
@Entity('production_bom_templates')
export class BomTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  code: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  category: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'bom_type', type: 'varchar', length: 30, default: 'manufacturing' })
  bomType: string;

  @Column({ type: 'varchar', length: 20, default: 'PCS' })
  uom: string;

  // Reusable component rows. Matches the shape the BOM import endpoint accepts.
  @Column({ type: 'jsonb', nullable: true })
  components:
    | {
        itemCode?: string;
        itemName?: string;
        quantity?: number;
        uom?: string;
        itemType?: string;
        scrapPercentage?: number;
        makeOrBuy?: string;
        unitCost?: number;
        level?: number;
      }[]
    | null;

  @Column({ name: 'component_count', type: 'int', default: 0 })
  componentCount: number;

  @Column({ type: 'varchar', length: 20, default: 'active' })
  status: string;

  @Column({ name: 'created_by', type: 'varchar', nullable: true })
  createdBy: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
