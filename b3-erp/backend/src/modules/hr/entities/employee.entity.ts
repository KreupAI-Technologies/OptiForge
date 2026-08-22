import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Department } from './department.entity';
import { Designation } from './designation.entity';
import { LeaveBalance } from './leave-balance.entity';
import { Attendance } from './attendance.entity';

export enum EmployeeStatus {
  ACTIVE = 'Active',
  ON_LEAVE = 'On Leave',
  ON_PROBATION = 'On Probation',
  SUSPENDED = 'Suspended',
  RESIGNED = 'Resigned',
  TERMINATED = 'Terminated',
  RETIRED = 'Retired',
}

export enum EmploymentType {
  FULL_TIME = 'Full Time',
  PART_TIME = 'Part Time',
  CONTRACT = 'Contract',
  INTERN = 'Intern',
  CONSULTANT = 'Consultant',
  TEMPORARY = 'Temporary',
}

export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female',
  OTHER = 'Other',
}

export enum MaritalStatus {
  SINGLE = 'Single',
  MARRIED = 'Married',
  DIVORCED = 'Divorced',
  WIDOWED = 'Widowed',
}

export enum BloodGroup {
  A_POSITIVE = 'A+',
  A_NEGATIVE = 'A-',
  B_POSITIVE = 'B+',
  B_NEGATIVE = 'B-',
  AB_POSITIVE = 'AB+',
  AB_NEGATIVE = 'AB-',
  O_POSITIVE = 'O+',
  O_NEGATIVE = 'O-',
}

@Entity('hr_employees')
export class Employee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Employee Identification
  @Column({ unique: true, length: 50 })
  employeeCode: string;

  @Column({ type: 'varchar', nullable: true })
  userId: string; // Link to system user

  @Column({ type: 'varchar', nullable: true })
  biometricId: string;

  @Column({ type: 'varchar', nullable: true })
  rfidCardNumber: string;

  // Personal Information
  @Column({ length: 50 })
  firstName: string;

  @Column({ length: 50, nullable: true })
  middleName: string;

  @Column({ length: 50 })
  lastName: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  fullName: string | null;

  @Column({ type: 'date', nullable: true })
  dateOfBirth: Date | null;

  @Column({
    type: 'enum',
    enum: Gender,
    nullable: true,
  })
  gender: Gender | null;

  @Column({
    type: 'enum',
    enum: MaritalStatus,
    default: MaritalStatus.SINGLE,
  })
  maritalStatus: MaritalStatus;

  @Column({
    type: 'enum',
    enum: BloodGroup,
    nullable: true,
  })
  bloodGroup: BloodGroup;

  @Column({ length: 100, nullable: true })
  nationality: string;

  @Column({ length: 100, nullable: true })
  religion: string;

  // Contact Information
  @Column({ type: 'varchar', length: 100, nullable: true })
  personalEmail: string | null;

  @Column({ unique: true, length: 100, nullable: true })
  companyEmail: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  mobileNumber: string | null;

  @Column({ length: 20, nullable: true })
  alternateNumber: string;

  @Column({ type: 'text', nullable: true })
  currentAddress: string | null;

  @Column({ type: 'text', nullable: true })
  permanentAddress: string;

  @Column({ length: 100, nullable: true })
  city: string;

  @Column({ length: 100, nullable: true })
  state: string;

  @Column({ length: 20, nullable: true })
  postalCode: string;

  @Column({ length: 100, nullable: true })
  country: string;

  // Employment Details
  @Column({ type: 'varchar', nullable: true })
  departmentId: string | null;

  @ManyToOne(() => Department, (department) => department.employees)
  @JoinColumn({ name: 'departmentId' })
  department: Department;

  @Column({ type: 'varchar', nullable: true })
  designationId: string | null;

  @ManyToOne(() => Designation, (designation) => designation.employees)
  @JoinColumn({ name: 'designationId' })
  designation: Designation;

  @Column({
    type: 'enum',
    enum: EmploymentType,
    default: EmploymentType.FULL_TIME,
  })
  employmentType: EmploymentType;

  @Column({ type: 'date', nullable: true })
  joiningDate: Date | null;

  @Column({ type: 'date', nullable: true })
  confirmationDate: Date;

  @Column({ type: 'date', nullable: true })
  probationEndDate: Date;

  @Column({ type: 'varchar', nullable: true })
  reportingManagerId: string;

  @Column({ nullable: true, length: 100 })
  reportingManagerName: string;

  @Column({ type: 'varchar', nullable: true })
  shiftId: string;

  @Column({ length: 100, nullable: true })
  workLocation: string;

  @Column({ length: 100, nullable: true })
  branch: string;

  @Column({ length: 100, nullable: true })
  costCenter: string;

  @Column({
    type: 'enum',
    enum: EmployeeStatus,
    default: EmployeeStatus.ON_PROBATION,
  })
  status: EmployeeStatus;

  // Salary Information
  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  basicSalary: number | null;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  grossSalary: number | null;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  ctc: number;

  @Column({ length: 50, default: 'Monthly' })
  salaryFrequency: string;

  @Column({ type: 'varchar', nullable: true })
  salaryStructureId: string;

  @Column({ length: 50, nullable: true })
  paymentMode: string; // Bank Transfer, Cash, Cheque

  // Bank Details
  @Column({ length: 100, nullable: true })
  bankName: string;

  @Column({ length: 100, nullable: true })
  bankBranch: string;

  @Column({ length: 50, nullable: true })
  accountNumber: string;

  @Column({ length: 50, nullable: true })
  ifscCode: string;

  @Column({ length: 100, nullable: true })
  accountHolderName: string;

  // Government IDs
  @Column({ length: 50, nullable: true })
  panNumber: string;

  @Column({ length: 50, nullable: true })
  aadharNumber: string;

  @Column({ length: 50, nullable: true })
  passportNumber: string;

  @Column({ type: 'date', nullable: true })
  passportExpiryDate: Date;

  @Column({ length: 50, nullable: true })
  pfNumber: string;

  @Column({ length: 50, nullable: true })
  esiNumber: string;

  @Column({ length: 50, nullable: true })
  uanNumber: string;

  // Emergency Contact
  @Column({ length: 100, nullable: true })
  emergencyContactName: string;

  @Column({ length: 50, nullable: true })
  emergencyContactRelation: string;

  @Column({ length: 20, nullable: true })
  emergencyContactPhone: string;

  // Education & Experience
  @Column({ type: 'json', nullable: true })
  education: Array<{
    degree: string;
    institution: string;
    yearOfPassing: number;
    percentage: number;
  }>;

  @Column({ type: 'json', nullable: true })
  previousEmployment: Array<{
    company: string;
    designation: string;
    from: string;
    to: string;
    responsibilities: string;
  }>;

  @Column({ type: 'simple-array', nullable: true })
  skills: string[];

  @Column({ type: 'simple-array', nullable: true })
  certifications: string[];

  // Exit Details
  @Column({ type: 'date', nullable: true })
  relievingDate: Date;

  @Column({ type: 'date', nullable: true })
  lastWorkingDay: Date;

  @Column({ type: 'text', nullable: true })
  exitReason: string;

  @Column({ type: 'text', nullable: true })
  exitNotes: string;

  @Column({ default: false })
  isExited: boolean;

  // Documents
  @Column({ type: 'json', nullable: true })
  documents: Array<{
    id: string;
    name: string;
    type: string;
    url: string;
    uploadedAt: Date;
  }>;

  // Profile
  @Column({ type: 'text', nullable: true })
  profilePhotoUrl: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'json', nullable: true })
  customFields: Record<string, any>;

  @Column({ nullable: true, length: 100 })
  createdBy: string;

  @Column({ nullable: true, length: 100 })
  updatedBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => LeaveBalance, (balance) => balance.employee)
  leaveBalances: LeaveBalance[];

  @OneToMany(() => Attendance, (attendance) => attendance.employee)
  attendances: Attendance[];
}
