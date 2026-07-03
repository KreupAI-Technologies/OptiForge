import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * HR Asset Request (orphan-endpoint build)
 * Backs /hr/assets/requests and /hr/assets/inventory/requests.
 */
@Entity('hr_asset_requests')
export class AssetRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column({ type: 'varchar', nullable: true })
  requestId: string;

  @Column({ type: 'varchar', nullable: true })
  requestDate: string;

  @Column({ type: 'varchar', nullable: true })
  requester: string;

  @Column({ type: 'varchar', nullable: true })
  employeeCode: string;

  @Column({ type: 'varchar', nullable: true })
  department: string;

  @Column({ type: 'varchar', nullable: true })
  designation: string;

  @Column({ type: 'varchar', nullable: true })
  assetCategory: string;

  @Column({ type: 'varchar', nullable: true })
  assetName: string;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ type: 'varchar', default: 'medium' })
  priority: string;

  @Column({ type: 'text', nullable: true })
  purpose: string;

  @Column({ type: 'varchar', default: 'pending' })
  status: string;

  @Column({ type: 'varchar', nullable: true })
  approver: string;

  @Column({ type: 'varchar', nullable: true })
  approvalDate: string;

  @Column({ type: 'varchar', nullable: true })
  fulfillmentDate: string;

  @Column({ type: 'text', nullable: true })
  remarks: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
