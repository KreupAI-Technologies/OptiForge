import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * HR Asset Transfer (orphan-endpoint build)
 * Backs /hr/assets/transfer.
 */
@Entity('hr_asset_transfers')
export class AssetTransfer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column({ type: 'varchar', nullable: true })
  transferId: string;

  @Column({ type: 'varchar', nullable: true })
  assetTag: string;

  @Column({ type: 'varchar', nullable: true })
  assetType: string;

  @Column({ type: 'varchar', nullable: true })
  assetCategory: string;

  @Column({ type: 'varchar', nullable: true })
  fromEmployee: string;

  @Column({ type: 'varchar', nullable: true })
  fromEmployeeCode: string;

  @Column({ type: 'varchar', nullable: true })
  fromDepartment: string;

  @Column({ type: 'varchar', nullable: true })
  fromLocation: string;

  @Column({ type: 'varchar', nullable: true })
  toEmployee: string;

  @Column({ type: 'varchar', nullable: true })
  toEmployeeCode: string;

  @Column({ type: 'varchar', nullable: true })
  toDepartment: string;

  @Column({ type: 'varchar', nullable: true })
  toLocation: string;

  @Column({ type: 'varchar', nullable: true })
  initiatedBy: string;

  @Column({ type: 'varchar', nullable: true })
  initiatedDate: string;

  @Column({ type: 'varchar', nullable: true })
  transferReason: string;

  @Column({ type: 'varchar', default: 'pending' })
  status: string;

  @Column({ type: 'varchar', nullable: true })
  approvedBy: string;

  @Column({ type: 'varchar', nullable: true })
  approvalDate: string;

  @Column({ type: 'varchar', nullable: true })
  completionDate: string;

  @Column({ type: 'text', nullable: true })
  handoverNotes: string;

  @Column({ type: 'varchar', nullable: true })
  condition: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
