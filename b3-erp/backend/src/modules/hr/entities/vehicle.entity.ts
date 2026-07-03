import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * HR Vehicle (orphan-endpoint build)
 * Backs /hr/assets/vehicles/list — the fleet register.
 */
@Entity('hr_vehicles')
export class Vehicle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column({ type: 'varchar', nullable: true })
  vehicleNumber: string;

  @Column({ type: 'varchar', nullable: true })
  vehicleType: string;

  @Column({ type: 'varchar', nullable: true })
  make: string;

  @Column({ type: 'varchar', nullable: true })
  model: string;

  @Column({ type: 'int', nullable: true })
  year: number;

  @Column({ type: 'varchar', nullable: true })
  purchaseDate: string;

  @Column({ type: 'numeric', precision: 14, scale: 2, default: 0 })
  purchaseCost: number;

  @Column({ type: 'varchar', nullable: true })
  registrationNumber: string;

  @Column({ type: 'varchar', nullable: true })
  insuranceExpiry: string;

  @Column({ type: 'varchar', nullable: true })
  pucExpiry: string;

  @Column({ type: 'varchar', nullable: true })
  fitnessExpiry: string;

  @Column({ type: 'int', default: 0 })
  currentOdometer: number;

  @Column({ type: 'varchar', nullable: true })
  fuelType: string;

  @Column({ type: 'varchar', default: 'available' })
  status: string;

  @Column({ type: 'varchar', nullable: true })
  assignedTo: string;

  @Column({ type: 'varchar', nullable: true })
  location: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
