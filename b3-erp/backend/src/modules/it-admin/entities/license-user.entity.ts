import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('it_license_users')
@Index(['companyId'])
export class LicenseUser {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  companyId: string;

  @Column({ length: 200 })
  name: string;

  @Column({ length: 200, nullable: true })
  email: string;

  @Column({ length: 100, nullable: true })
  role: string;

  @Column({ length: 100, nullable: true })
  department: string;

  @Column({ length: 50, default: 'Named' })
  licenseType: string;

  @Column({ length: 50, default: 'active' })
  status: string;

  @Column({ length: 50, nullable: true })
  assignedDate: string;

  @Column({ length: 50, nullable: true })
  lastActive: string;

  @Column({ length: 50, nullable: true })
  validUntil: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
