import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

/** HR AMC Contract (orphan-endpoint build) — backs /hr/assets/maintenance/amc. coverage = JSON text. */
@Entity('hr_amc_contracts')
export class AmcContract {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() companyId: string;
  @Column({ type: 'varchar', nullable: true }) contractId: string;
  @Column({ type: 'varchar', default: 'other' }) assetCategory: string;
  @Column({ type: 'varchar', nullable: true }) vendor: string;
  @Column({ type: 'varchar', nullable: true }) vendorContact: string;
  @Column({ type: 'varchar', nullable: true }) startDate: string;
  @Column({ type: 'varchar', nullable: true }) endDate: string;
  @Column({ type: 'int', default: 0 }) duration: number;
  @Column({ type: 'int', default: 0 }) numberOfAssets: number;
  @Column({ type: 'numeric', precision: 14, scale: 2, default: 0 }) contractValue: number;
  @Column({ type: 'varchar', default: 'annual' }) paymentTerms: string;
  @Column({ type: 'text', nullable: true }) coverage: string;
  @Column({ type: 'varchar', nullable: true }) responseTime: string;
  @Column({ type: 'varchar', default: 'active' }) status: string;
  @Column({ type: 'varchar', nullable: true }) renewalDate: string;
  @Column({ type: 'varchar', nullable: true }) location: string;
  @Column({ type: 'varchar', nullable: true }) contactPerson: string;
  @Column({ type: 'text', nullable: true }) remarks: string;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
