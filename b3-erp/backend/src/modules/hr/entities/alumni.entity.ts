import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * HR Alumni (orphan-endpoint build)
 * Backs /hr/alumni/directory, /hr/alumni/network and /hr/alumni/rehire.
 * `kind` distinguishes 'member' | 'event' | 'post' | 'rehire'. ADDITIVE ONLY.
 */
@Entity('hr_alumni')
@Index('IDX_hr_alumni_companyId', ['companyId'])
export class Alumni {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column({ type: 'varchar', default: 'member' })
  kind: string;

  @Column({ type: 'varchar', nullable: true })
  employeeCode: string;

  @Column({ type: 'varchar', nullable: true })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  designation: string;

  @Column({ type: 'varchar', nullable: true })
  department: string;

  @Column({ type: 'varchar', nullable: true })
  joinDate: string;

  @Column({ type: 'varchar', nullable: true })
  exitDate: string;

  @Column({ type: 'varchar', nullable: true })
  tenure: string;

  @Column({ type: 'varchar', nullable: true })
  currentCompany: string;

  @Column({ type: 'varchar', nullable: true })
  currentDesignation: string;

  @Column({ type: 'varchar', nullable: true })
  location: string;

  @Column({ type: 'varchar', nullable: true })
  email: string;

  @Column({ type: 'varchar', nullable: true })
  phone: string;

  @Column({ type: 'varchar', nullable: true })
  linkedinUrl: string;

  @Column({ type: 'json', nullable: true })
  achievements: string[];

  @Column({ type: 'json', nullable: true })
  industryExpertise: string[];

  @Column({ type: 'boolean', default: false })
  willingToMentor: boolean;

  @Column({ type: 'boolean', default: false })
  availableForRehire: boolean;

  @Column({ type: 'varchar', nullable: true })
  reasonForLeaving: string;

  @Column({ type: 'varchar', nullable: true })
  lastContactDate: string;

  // Rehire (kind='rehire')
  @Column({ type: 'varchar', nullable: true })
  previousDesignation: string;

  @Column({ type: 'varchar', nullable: true })
  proposedDesignation: string;

  @Column({ type: 'varchar', nullable: true })
  proposedDepartment: string;

  @Column({ type: 'numeric', precision: 14, scale: 2, nullable: true })
  proposedCTC: number;

  @Column({ type: 'varchar', nullable: true })
  requestedBy: string;

  @Column({ type: 'varchar', nullable: true })
  requestDate: string;

  @Column({ type: 'int', nullable: true })
  eligibilityScore: number;

  @Column({ type: 'varchar', nullable: true })
  performanceRating: string;

  @Column({ type: 'varchar', nullable: true })
  backgroundCheckStatus: string;

  @Column({ type: 'text', nullable: true })
  comments: string;

  // Event / Post (kind='event' | 'post') — flexible payload
  @Column({ type: 'json', nullable: true })
  details: Record<string, any>;

  @Column({ type: 'varchar', default: 'active' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
