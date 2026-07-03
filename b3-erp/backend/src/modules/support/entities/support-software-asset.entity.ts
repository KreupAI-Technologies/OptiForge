import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Support Software Asset — backs /support/assets/software.
 */
@Entity('support_software_assets')
export class SupportSoftwareAsset {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column()
  name: string;

  @Column({ type: 'varchar', nullable: true })
  vendor: string;

  @Column({ type: 'varchar', default: 'Other' })
  category: string;

  @Column({ type: 'varchar', nullable: true })
  version: string;

  @Column({ type: 'varchar', default: 'Subscription' })
  licenseType: string;

  @Column({ type: 'json', nullable: true })
  licenses: { total: number; used: number; available: number };

  @Column({ type: 'json', nullable: true })
  cost: { perLicense: number; totalAnnual: number; billingCycle: string };

  @Column({ type: 'json', nullable: true })
  deployment: { type: string; installCount: number; lastDeployed: string };

  @Column({ type: 'json', nullable: true })
  contract: {
    startDate: string;
    renewalDate: string;
    vendor: string;
    contactPerson: string;
    contactEmail: string;
  };

  @Column({ type: 'json', nullable: true })
  compliance: { status: string; lastAudit: string; nextAudit: string };

  @Column({ type: 'json', nullable: true })
  support: { level: string; expiryDate: string; supportHours: string };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
