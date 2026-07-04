import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * HR Safety Emergency (orphan-endpoint build). ADDITIVE ONLY.
 * Shared discriminator table backing /hr/safety/emergency/* pages:
 * `recordType` = drill | plan | contact.
 * Page-specific fields live in `meta` (jsonb).
 */
@Entity('hr_safety_drills')
@Index('IDX_hr_safety_drills_companyId', ['companyId'])
export class SafetyDrill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column({ type: 'varchar', default: 'drill' })
  recordType: string;

  @Column({ type: 'varchar', nullable: true })
  code: string;

  @Column({ type: 'varchar', nullable: true })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  drillType: string;

  @Column({ type: 'varchar', nullable: true })
  location: string;

  @Column({ type: 'varchar', nullable: true })
  department: string;

  @Column({ type: 'varchar', nullable: true })
  conductedDate: string;

  @Column({ type: 'varchar', nullable: true })
  scheduledDate: string;

  @Column({ type: 'int', nullable: true })
  participants: number;

  @Column({ type: 'varchar', nullable: true })
  duration: string;

  @Column({ type: 'varchar', nullable: true })
  coordinator: string;

  @Column({ type: 'varchar', nullable: true })
  contactName: string;

  @Column({ type: 'varchar', nullable: true })
  role: string;

  @Column({ type: 'varchar', nullable: true })
  phone: string;

  @Column({ type: 'varchar', nullable: true })
  serviceType: string;

  @Column({ type: 'varchar', nullable: true })
  effectiveness: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', default: 'active' })
  status: string;

  @Column({ type: 'text', nullable: true })
  remarks: string;

  @Column({ type: 'jsonb', nullable: true })
  meta: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
