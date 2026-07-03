import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * HR Vehicle Fuel record (orphan-endpoint build)
 * Backs /hr/assets/vehicles/fuel — fuel refill log.
 */
@Entity('hr_vehicle_fuel')
export class VehicleFuel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column({ type: 'varchar', nullable: true })
  recordId: string;

  @Column({ type: 'varchar', nullable: true })
  vehicleNumber: string;

  @Column({ type: 'varchar', nullable: true })
  vehicleName: string;

  @Column({ type: 'varchar', nullable: true })
  registrationNumber: string;

  @Column({ type: 'varchar', nullable: true })
  fuelDate: string;

  @Column({ type: 'varchar', nullable: true })
  fuelType: string;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  quantity: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  pricePerLiter: number;

  @Column({ type: 'numeric', precision: 14, scale: 2, default: 0 })
  totalCost: number;

  @Column({ type: 'int', default: 0 })
  odometer: number;

  @Column({ type: 'varchar', nullable: true })
  fuelStation: string;

  @Column({ type: 'varchar', nullable: true })
  billNumber: string;

  @Column({ type: 'varchar', nullable: true })
  filledBy: string;

  @Column({ type: 'varchar', nullable: true })
  location: string;

  @Column({ type: 'text', nullable: true })
  remarks: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
