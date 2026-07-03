import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export type TrialInstallationType =
  | 'Wall Cabinet'
  | 'Base Cabinet'
  | 'Full Kitchen'
  | 'Partition'
  | 'Other';
export type TrialInstallationStatus =
  | 'Scheduled'
  | 'In Progress'
  | 'Completed'
  | 'Issues Found';

// Net-new orphan list entity backing /production/trial-installations.
@Entity('production_trial_installations')
export class TrialInstallation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'wo_number', type: 'varchar', nullable: true })
  woNumber: string | null;

  @Column({ name: 'product_name', type: 'varchar', nullable: true })
  productName: string | null;

  @Column({ name: 'installation_type', type: 'varchar', length: 30, default: 'Other' })
  installationType: TrialInstallationType;

  @Column({ type: 'varchar', length: 20, default: 'Scheduled' })
  status: TrialInstallationStatus;

  @Column({ name: 'scheduled_date', type: 'varchar', nullable: true })
  scheduledDate: string | null;

  @Column({ name: 'completion_date', type: 'varchar', nullable: true })
  completionDate: string | null;

  @Column({ type: 'varchar', nullable: true })
  supervisor: string | null;

  @Column({ type: 'varchar', nullable: true })
  location: string | null;

  @Column({ type: 'jsonb', nullable: true })
  checklist: {
    id: string;
    item: string;
    status: 'Pass' | 'Fail' | 'Pending';
    notes?: string;
  }[] | null;

  @Column({ name: 'issues_found', type: 'int', default: 0 })
  issuesFound: number;

  @Column({ type: 'boolean', default: false })
  approved: boolean;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
