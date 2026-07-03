import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * HR Asset Item (orphan-endpoint build)
 * Consolidated physical-asset register backing the IT-asset pages
 * (laptops, desktops, monitors, mobiles) and office furniture.
 * `assetClass` distinguishes laptop | desktop | monitor | mobile | furniture.
 */
@Entity('hr_asset_items')
export class AssetItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column({ type: 'varchar', default: 'laptop' })
  assetClass: string;

  @Column({ type: 'varchar', nullable: true })
  assetTag: string;

  @Column({ type: 'varchar', nullable: true })
  brand: string;

  @Column({ type: 'varchar', nullable: true })
  model: string;

  @Column({ type: 'varchar', nullable: true })
  item: string;

  @Column({ type: 'varchar', nullable: true })
  category: string;

  @Column({ type: 'varchar', nullable: true })
  serialNumber: string;

  @Column({ type: 'varchar', nullable: true })
  processor: string;

  @Column({ type: 'varchar', nullable: true })
  ram: string;

  @Column({ type: 'varchar', nullable: true })
  storage: string;

  @Column({ type: 'varchar', nullable: true })
  imei: string;

  @Column({ type: 'varchar', nullable: true })
  simNumber: string;

  @Column({ type: 'varchar', nullable: true })
  os: string;

  @Column({ type: 'varchar', nullable: true })
  screenSize: string;

  @Column({ type: 'varchar', nullable: true })
  resolution: string;

  @Column({ type: 'varchar', nullable: true })
  purchaseDate: string;

  @Column({ type: 'varchar', nullable: true })
  warranty: string;

  @Column({ type: 'numeric', precision: 14, scale: 2, default: 0 })
  cost: number;

  @Column({ type: 'varchar', default: 'available' })
  status: string;

  @Column({ type: 'varchar', nullable: true })
  condition: string;

  @Column({ type: 'varchar', nullable: true })
  assignedTo: string;

  @Column({ type: 'varchar', nullable: true })
  employeeCode: string;

  @Column({ type: 'varchar', nullable: true })
  department: string;

  @Column({ type: 'varchar', nullable: true })
  location: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
