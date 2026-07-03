import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * HR Safety Incident (orphan-endpoint build)
 * Backs /hr/safety/incidents/tracking. ADDITIVE ONLY.
 */
@Entity('hr_safety_incidents')
@Index('IDX_hr_safety_incidents_companyId', ['companyId'])
export class SafetyIncident {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column({ type: 'varchar', nullable: true })
  incidentNumber: string;

  @Column({ type: 'varchar', nullable: true })
  reportedDate: string;

  @Column({ type: 'varchar', nullable: true })
  incidentDate: string;

  @Column({ type: 'varchar', nullable: true })
  incidentTime: string;

  @Column({ type: 'varchar', nullable: true })
  location: string;

  @Column({ type: 'varchar', nullable: true })
  department: string;

  @Column({ type: 'varchar', nullable: true })
  severity: string;

  @Column({ type: 'varchar', nullable: true })
  type: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', nullable: true })
  reportedBy: string;

  @Column({ type: 'varchar', nullable: true })
  employeeInvolved: string;

  @Column({ type: 'int', nullable: true })
  witnessCount: number;

  @Column({ type: 'varchar', default: 'reported' })
  status: string;

  @Column({ type: 'varchar', nullable: true })
  investigator: string;

  @Column({ type: 'text', nullable: true })
  rootCause: string;

  @Column({ type: 'int', nullable: true })
  daysLost: number;

  @Column({ type: 'boolean', default: false })
  medicalAttention: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
