import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Support Scheduled Change — backs /support/changes/scheduled.
 */
@Entity('support_scheduled_changes')
export class SupportScheduledChange {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column({ type: 'varchar', nullable: true })
  ticketNumber: string;

  @Column()
  title: string;

  @Column({ type: 'varchar', default: 'Normal' })
  type: string;

  @Column({ type: 'varchar', nullable: true })
  category: string;

  @Column({ type: 'varchar', default: 'P3' })
  priority: string;

  @Column({ type: 'varchar', nullable: true })
  implementer: string;

  @Column({ type: 'varchar', nullable: true })
  implementationDate: string;

  @Column({ type: 'varchar', nullable: true })
  implementationTime: string;

  @Column({ type: 'varchar', nullable: true })
  duration: string;

  @Column({ type: 'varchar', default: 'Scheduled' })
  status: string;

  @Column({ type: 'json', nullable: true })
  affectedSystems: string[];

  @Column({ default: false })
  downtime: boolean;

  @Column({ default: false })
  backupCompleted: boolean;

  @Column({ default: false })
  stakeholdersNotified: boolean;

  @Column({ type: 'varchar', nullable: true })
  changeWindow: string;

  @Column({ type: 'varchar', nullable: true })
  approvedBy: string;

  @Column({ type: 'varchar', nullable: true })
  approvalDate: string;

  @Column({ default: false })
  rollbackPlan: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
