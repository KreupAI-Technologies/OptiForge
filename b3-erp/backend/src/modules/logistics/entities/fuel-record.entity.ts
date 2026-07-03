import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum FuelRecordStatus {
  VERIFIED = 'verified',
  PENDING = 'pending',
  DISPUTED = 'disputed',
  APPROVED = 'approved',
}

@Entity('logistics_fuel_records')
export class FuelRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  fuelId: string;

  @Column({ nullable: true, length: 50 })
  vehicleId: string;

  @Column({ nullable: true, length: 50 })
  vehicleNumber: string;

  @Column({ nullable: true, length: 100 })
  vehicleType: string;

  @Column({ nullable: true, length: 150 })
  driverName: string;

  @Column({ nullable: true, length: 30 })
  fuelType: string; // diesel, petrol, cng, electric

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  quantity: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  unitPrice: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalCost: number;

  @Column({ nullable: true, length: 200 })
  fuelStation: string;

  @Column({ nullable: true, length: 200 })
  location: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  odometer: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  previousOdometer: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  distanceCovered: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  fuelEfficiency: number;

  @Column({ nullable: true, length: 30 })
  fillType: string; // full-tank, partial, top-up

  @Column({ nullable: true, length: 30 })
  paymentMethod: string; // cash, card, fuel-card, credit

  @Column({ nullable: true, length: 100 })
  invoiceNumber: string;

  @Column({ nullable: true, length: 150 })
  filledBy: string;

  @Column({ type: 'date', nullable: true })
  filledDate: string;

  @Column({ nullable: true, length: 20 })
  filledTime: string;

  @Column({ nullable: true, length: 50 })
  tripId: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({
    type: 'enum',
    enum: FuelRecordStatus,
    default: FuelRecordStatus.PENDING,
  })
  status: FuelRecordStatus;

  @Column({ nullable: true, length: 150 })
  verifiedBy: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  expectedEfficiency: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  efficiencyVariance: number;

  @Column({ default: false })
  anomalyDetected: boolean;

  @Column({ nullable: true, length: 100 })
  createdBy: string;

  @Column({ nullable: true, length: 100 })
  updatedBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
