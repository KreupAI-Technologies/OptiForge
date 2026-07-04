import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * IoT Device
 * Backs the /advanced-features/iot device telemetry dashboard. Each row is a
 * monitored piece of equipment with its latest status and last reading snapshot.
 */
@Entity('iot_devices')
export class IotDevice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  // Human-friendly device code, e.g. DEV-001
  @Column({ type: 'varchar', nullable: true })
  code: string;

  @Column()
  name: string;

  // e.g. cnc, press, robot, conveyor, molder
  @Column({ type: 'varchar', nullable: true })
  type: string;

  // online | warning | offline
  @Column({ type: 'varchar', default: 'offline' })
  status: string;

  @Column({ type: 'varchar', nullable: true })
  temperature: string;

  @Column({ type: 'varchar', nullable: true })
  vibration: string;

  @Column({ type: 'varchar', nullable: true })
  power: string;

  @Column({ type: 'varchar', nullable: true })
  uptime: string;

  @Column({ type: 'varchar', nullable: true })
  lastPing: string;

  // Free-form latest reading / extension bag.
  @Column({ type: 'json', nullable: true })
  meta: Record<string, unknown>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
