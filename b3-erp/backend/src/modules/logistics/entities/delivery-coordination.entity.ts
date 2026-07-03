import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum DeliveryCoordinationStatus {
  PENDING = 'Pending',
  COORDINATED = 'Coordinated',
  TRANSPORTER_NOTIFIED = 'Transporter Notified',
  SITE_INFORMED = 'Site Informed',
  READY = 'Ready',
}

export enum DeliveryTransportMethod {
  OWN_VEHICLE = 'Own Vehicle',
  THIRD_PARTY = 'Third Party',
  COURIER = 'Courier',
}

@Entity('logistics_delivery_coordinations')
export class DeliveryCoordination {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50 })
  woNumber: string;

  @Column({ length: 200 })
  customerName: string;

  // Site Location
  @Column({ type: 'text', nullable: true })
  siteAddress: string;

  @Column({ nullable: true, length: 100 })
  siteGps: string;

  @Column({ nullable: true, length: 200 })
  siteLandmark: string;

  // Site Contact
  @Column({ nullable: true, length: 150 })
  contactName: string;

  @Column({ nullable: true, length: 50 })
  contactPhone: string;

  @Column({ nullable: true, length: 150 })
  contactEmail: string;

  @Column({ nullable: true, length: 100 })
  contactRole: string;

  // Delivery Timing
  @Column({ type: 'date', nullable: true })
  preferredDate: string;

  @Column({ nullable: true, length: 50 })
  preferredTime: string;

  @Column({ nullable: true, length: 50 })
  timeSlot: string; // Morning, Afternoon, Evening

  @Column({
    type: 'enum',
    enum: DeliveryTransportMethod,
    default: DeliveryTransportMethod.OWN_VEHICLE,
  })
  transportMethod: DeliveryTransportMethod;

  @Column({ nullable: true, length: 200 })
  transporter: string;

  @Column({
    type: 'enum',
    enum: DeliveryCoordinationStatus,
    default: DeliveryCoordinationStatus.PENDING,
  })
  status: DeliveryCoordinationStatus;

  @Column({ default: false })
  transporterNotified: boolean;

  @Column({ default: false })
  siteContactNotified: boolean;

  @Column({ nullable: true, length: 100 })
  createdBy: string;

  @Column({ nullable: true, length: 100 })
  updatedBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
