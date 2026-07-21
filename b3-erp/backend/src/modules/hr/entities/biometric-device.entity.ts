import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * HR Biometric Device registry (net-new HR Attendance build)
 *
 * Backs GET/POST/PUT/DELETE /hr/biometric-devices and the Add Device action on
 * app/hr/attendance/biometric. The existing attendance sync action
 * (/hr/attendance/sync/:deviceId) reads devices registered here.
 *
 * ADDITIVE ONLY: created with CREATE TABLE IF NOT EXISTS in
 * prisma/manual/orphan_hr_performance_net_new.sql. Never DROP/ALTER existing tables.
 */
@Index('IDX_hr_biometric_devices_company', ['companyId'])
@Entity('hr_biometric_devices')
export class BiometricDevice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column({ type: 'varchar', nullable: true })
  deviceId: string;

  @Column({ type: 'varchar', nullable: true })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  model: string;

  @Column({ type: 'varchar', nullable: true })
  location: string;

  @Column({ type: 'varchar', nullable: true })
  ipAddress: string;

  @Column({ type: 'int', nullable: true, default: 4370 })
  port: number;

  /** online | offline | error. */
  @Column({ type: 'varchar', nullable: true, default: 'online' })
  status: string;

  @Column({ type: 'timestamptz', nullable: true })
  lastSyncAt: Date;

  @Column({ type: 'int', default: 0 })
  enrolledUsers: number;

  @Column({ type: 'boolean', default: false })
  batteryBackup: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
