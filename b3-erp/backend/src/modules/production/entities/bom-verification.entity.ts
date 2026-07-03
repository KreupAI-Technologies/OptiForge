import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

// Net-new orphan list entity backing /production/bom/verification.
@Entity('production_bom_verifications')
export class BomVerification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'bom_code', type: 'varchar', nullable: true })
  bomCode: string | null;

  @Column({ name: 'product_name', type: 'varchar', nullable: true })
  productName: string | null;

  @Column({ name: 'verification_date', type: 'varchar', nullable: true })
  verificationDate: string | null;

  @Column({ name: 'verified_by', type: 'varchar', nullable: true })
  verifiedBy: string | null;

  @Column({ type: 'varchar', length: 30, default: 'Pending' })
  status: string;

  @Column({ type: 'int', default: 0 })
  completeness: number;

  @Column({ name: 'submitted_to_procurement', type: 'boolean', default: false })
  submittedToProcurement: boolean;

  @Column({ type: 'jsonb', nullable: true })
  checks: any[] | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
