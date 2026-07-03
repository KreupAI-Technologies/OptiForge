import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * HR Asset Allocation (orphan-endpoint build)
 * Backs /hr/assets/inventory/allocation.
 */
@Entity('hr_asset_allocations')
export class AssetAllocation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column({ type: 'varchar', nullable: true })
  allocationId: string;

  @Column({ type: 'varchar', nullable: true })
  assetTag: string;

  @Column({ type: 'varchar', nullable: true })
  assetName: string;

  @Column({ type: 'varchar', nullable: true })
  category: string;

  @Column({ type: 'varchar', nullable: true })
  employeeName: string;

  @Column({ type: 'varchar', nullable: true })
  employeeCode: string;

  @Column({ type: 'varchar', nullable: true })
  department: string;

  @Column({ type: 'varchar', nullable: true })
  designation: string;

  @Column({ type: 'varchar', nullable: true })
  location: string;

  @Column({ type: 'varchar', nullable: true })
  allocationDate: string;

  @Column({ type: 'varchar', nullable: true })
  expectedReturnDate: string;

  @Column({ type: 'varchar', nullable: true })
  actualReturnDate: string;

  @Column({ type: 'varchar', default: 'allocated' })
  status: string;

  @Column({ type: 'varchar', nullable: true })
  condition: string;

  @Column({ type: 'varchar', nullable: true })
  allocatedBy: string;

  @Column({ type: 'text', nullable: true })
  remarks: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
