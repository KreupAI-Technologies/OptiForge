import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * HR Asset Maintenance (orphan-endpoint build)
 * Consolidated record backing /hr/assets/maintenance/requests and
 * /hr/assets/maintenance/history. `recordType` = request | history.
 * `partsReplaced` stored as JSON text.
 */
@Entity('hr_asset_maintenance')
export class AssetMaintenance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column({ type: 'varchar', default: 'request' })
  recordType: string;

  @Column({ type: 'varchar', nullable: true })
  requestId: string;

  @Column({ type: 'varchar', nullable: true })
  ticketId: string;

  @Column({ type: 'varchar', nullable: true })
  assetTag: string;

  @Column({ type: 'varchar', nullable: true })
  assetName: string;

  @Column({ type: 'varchar', nullable: true })
  assetCategory: string;

  @Column({ type: 'varchar', nullable: true })
  issueType: string;

  @Column({ type: 'text', nullable: true })
  issueDescription: string;

  @Column({ type: 'varchar', nullable: true })
  requestedBy: string;

  @Column({ type: 'varchar', nullable: true })
  reportedBy: string;

  @Column({ type: 'varchar', nullable: true })
  employeeCode: string;

  @Column({ type: 'varchar', nullable: true })
  department: string;

  @Column({ type: 'varchar', default: 'medium' })
  priority: string;

  @Column({ type: 'varchar', default: 'pending' })
  status: string;

  @Column({ type: 'varchar', nullable: true })
  requestDate: string;

  @Column({ type: 'varchar', nullable: true })
  reportedDate: string;

  @Column({ type: 'varchar', nullable: true })
  expectedDate: string;

  @Column({ type: 'varchar', nullable: true })
  startDate: string;

  @Column({ type: 'varchar', nullable: true })
  completionDate: string;

  @Column({ type: 'varchar', nullable: true })
  assignedTo: string;

  @Column({ type: 'varchar', nullable: true })
  approvedBy: string;

  @Column({ type: 'varchar', nullable: true })
  approvalDate: string;

  @Column({ type: 'varchar', nullable: true })
  vendor: string;

  @Column({ type: 'numeric', precision: 14, scale: 2, nullable: true })
  estimatedCost: number;

  @Column({ type: 'numeric', precision: 14, scale: 2, nullable: true })
  cost: number;

  @Column({ type: 'int', nullable: true })
  resolutionTime: number;

  @Column({ type: 'text', nullable: true })
  workDone: string;

  @Column({ type: 'text', nullable: true })
  partsReplaced: string;

  @Column({ type: 'varchar', nullable: true })
  location: string;

  @Column({ type: 'varchar', nullable: true })
  contactNumber: string;

  @Column({ type: 'text', nullable: true })
  remarks: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
