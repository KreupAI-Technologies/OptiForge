import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * CollectionActivity — a logged collections touchpoint (call/email/meeting/note)
 * against a receivable. Additive table finance_collection_activity.
 */
@Entity('finance_collection_activity')
export class CollectionActivity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'receivable_id', length: 100, nullable: true })
  receivableId: string;

  @Column({ name: 'activity_type', length: 30, default: 'note' })
  activityType: string; // call | email | meeting | note

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'follow_up_date', type: 'date', nullable: true })
  followUpDate: Date;

  @Column({ length: 100, nullable: true })
  outcome: string;

  @Column({ name: 'created_by', length: 100, nullable: true })
  createdBy: string;

  @Column({ name: 'company_id', length: 100, nullable: true })
  companyId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
