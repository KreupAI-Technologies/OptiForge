import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

/** HR Vehicle Assignment (orphan-endpoint build) — backs /hr/assets/vehicles/assignment. */
@Entity('hr_vehicle_assignments')
export class VehicleAssignment {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() companyId: string;
  @Column({ type: 'varchar', nullable: true }) assignmentId: string;
  @Column({ type: 'varchar', nullable: true }) vehicleNumber: string;
  @Column({ type: 'varchar', nullable: true }) vehicleName: string;
  @Column({ type: 'varchar', nullable: true }) registrationNumber: string;
  @Column({ type: 'varchar', nullable: true }) assignedTo: string;
  @Column({ type: 'varchar', nullable: true }) employeeCode: string;
  @Column({ type: 'varchar', nullable: true }) department: string;
  @Column({ type: 'varchar', nullable: true }) designation: string;
  @Column({ type: 'varchar', nullable: true }) assignmentDate: string;
  @Column({ type: 'varchar', nullable: true }) returnDate: string;
  @Column({ type: 'text', nullable: true }) purpose: string;
  @Column({ type: 'varchar', default: 'active' }) status: string;
  @Column({ type: 'int', default: 0 }) odometerReadingStart: number;
  @Column({ type: 'int', nullable: true }) odometerReadingEnd: number;
  @Column({ type: 'varchar', nullable: true }) location: string;
  @Column({ type: 'text', nullable: true }) remarks: string;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
