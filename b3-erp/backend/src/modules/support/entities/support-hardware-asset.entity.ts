import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Support Hardware Asset — backs /support/assets/hardware.
 */
@Entity('support_hardware_assets')
export class SupportHardwareAsset {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column({ type: 'varchar', nullable: true })
  assetTag: string;

  @Column()
  name: string;

  @Column({ type: 'varchar', default: 'Other' })
  category: string;

  @Column({ type: 'varchar', nullable: true })
  manufacturer: string;

  @Column({ type: 'varchar', nullable: true })
  model: string;

  @Column({ type: 'varchar', nullable: true })
  serialNumber: string;

  @Column({ type: 'varchar', default: 'Active' })
  status: string;

  @Column({ type: 'varchar', default: 'Good' })
  condition: string;

  @Column({ type: 'json', nullable: true })
  location: { building: string; floor: string; room: string };

  @Column({ type: 'json', nullable: true })
  assignedTo: { name: string; department: string; email: string } | null;

  @Column({ type: 'json', nullable: true })
  purchase: { date: string; cost: number; vendor: string; warrantyExpiry: string };

  @Column({ type: 'json', nullable: true })
  specifications: Record<string, string>;

  @Column({ type: 'json', nullable: true })
  maintenance: { lastService: string; nextService: string; serviceCount: number };

  @Column({ type: 'json', nullable: true })
  lifecycle: {
    age: string;
    expectedLife: string;
    remainingLife: string;
    depreciation: number;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
