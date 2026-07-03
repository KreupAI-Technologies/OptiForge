import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('pm_layout_briefings')
export class LayoutBriefingEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id', type: 'varchar', default: 'default' })
  companyId: string;

  @Column({ name: 'briefing_number', type: 'varchar', nullable: true })
  briefingNumber: string;

  @Column({ name: 'project_id', type: 'varchar', nullable: true })
  projectId: string;

  @Column({ name: 'project_name', type: 'varchar', nullable: true })
  projectName: string;

  @Column({ name: 'briefing_date', type: 'varchar', nullable: true })
  briefingDate: string;

  @Column({ name: 'briefing_time', type: 'varchar', nullable: true })
  briefingTime: string;

  @Column({ type: 'varchar', nullable: true })
  location: string;

  @Column({ type: 'varchar', nullable: true })
  organizer: string;

  @Column({ type: 'varchar', default: 'Scheduled' })
  status: string;

  @Column({ type: 'jsonb', nullable: true })
  attendees: any;

  @Column({ type: 'text', nullable: true })
  agenda: string;

  @Column({ type: 'text', nullable: true })
  minutes: string;

  @Column({ name: 'action_items', type: 'text', nullable: true })
  actionItems: string;

  @Column({ type: 'jsonb', nullable: true })
  attachments: any;

  @Column({ type: 'varchar', nullable: true })
  duration: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
