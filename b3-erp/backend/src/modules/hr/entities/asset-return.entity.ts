import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * HR Asset Return (orphan-endpoint build)
 * Backs /hr/assets/return. `accessories` is stored as JSON text.
 */
@Entity('hr_asset_returns')
export class AssetReturn {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column({ type: 'varchar', nullable: true })
  returnId: string;

  @Column({ type: 'varchar', nullable: true })
  assetTag: string;

  @Column({ type: 'varchar', nullable: true })
  assetType: string;

  @Column({ type: 'varchar', nullable: true })
  assetCategory: string;

  @Column({ type: 'varchar', nullable: true })
  returnedBy: string;

  @Column({ type: 'varchar', nullable: true })
  employeeCode: string;

  @Column({ type: 'varchar', nullable: true })
  department: string;

  @Column({ type: 'varchar', nullable: true })
  assignedDate: string;

  @Column({ type: 'varchar', nullable: true })
  returnDate: string;

  @Column({ type: 'varchar', nullable: true })
  returnReason: string;

  @Column({ type: 'varchar', nullable: true })
  condition: string;

  @Column({ type: 'varchar', default: 'pending_inspection' })
  status: string;

  @Column({ type: 'varchar', nullable: true })
  inspectedBy: string;

  @Column({ type: 'varchar', nullable: true })
  inspectionDate: string;

  @Column({ type: 'text', nullable: true })
  inspectionNotes: string;

  @Column({ type: 'numeric', precision: 14, scale: 2, nullable: true })
  damageCharges: number;

  @Column({ type: 'text', nullable: true })
  accessories: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
