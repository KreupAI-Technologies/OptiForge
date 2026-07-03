import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

/** HR Asset Audit (orphan-endpoint build) — backs /hr/assets/inventory/audit. */
@Entity('hr_asset_audits')
export class AssetAudit {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() companyId: string;
  @Column({ type: 'varchar', nullable: true }) auditId: string;
  @Column({ type: 'varchar', nullable: true }) auditDate: string;
  @Column({ type: 'varchar', default: 'scheduled' }) auditType: string;
  @Column({ type: 'varchar', nullable: true }) location: string;
  @Column({ type: 'varchar', nullable: true }) auditor: string;
  @Column({ type: 'int', default: 0 }) totalAssets: number;
  @Column({ type: 'int', default: 0 }) verified: number;
  @Column({ type: 'int', default: 0 }) missing: number;
  @Column({ type: 'int', default: 0 }) damaged: number;
  @Column({ type: 'varchar', default: 'pending' }) status: string;
  @Column({ type: 'varchar', nullable: true }) completionDate: string;
  @Column({ type: 'text', nullable: true }) remarks: string;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
