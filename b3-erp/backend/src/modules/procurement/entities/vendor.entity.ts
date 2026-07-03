import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('procurement_vendors')
@Index(['companyId', 'status'])
export class Vendor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  companyId: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  vendorCode: string;

  @Column({ type: 'varchar', length: 255 })
  legalName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  tradeName: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  gstNumber: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  panNumber: string;

  @Column({ type: 'varchar', length: 40, nullable: true })
  cinNumber: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  msmeRegistration: string;

  @Column({ type: 'decimal', precision: 3, scale: 1, default: 0 })
  rating: number;

  // active | inactive | blacklisted | on_hold
  @Column({ type: 'varchar', length: 20, default: 'active' })
  status: string;

  @Column({ type: 'jsonb', nullable: true })
  contactPersons: any;

  @Column({ type: 'jsonb', nullable: true })
  addresses: any;

  @Column({ type: 'jsonb', nullable: true })
  bankDetails: any;

  @Column({ type: 'jsonb', nullable: true })
  paymentTerms: any;

  @Column({ type: 'jsonb', nullable: true })
  categories: any;

  @Column({ type: 'jsonb', nullable: true })
  specificMaterials: any;

  @Column({ type: 'jsonb', nullable: true })
  certifications: any;

  @Column({ type: 'jsonb', nullable: true })
  documents: any;

  @Column({ type: 'int', default: 0 })
  totalPOs: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  totalSpendYTD: number;

  @Column({ type: 'date', nullable: true })
  registeredDate: Date;

  @Column({ type: 'date', nullable: true })
  lastOrderDate: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
