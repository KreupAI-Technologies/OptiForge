import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Unique,
} from 'typeorm';

/**
 * A "like" placed by a user on a CRM activity record. One row per
 * (activity, user); toggling a like inserts or deletes the row. The activity's
 * aggregate `likeCount` is derived from these rows.
 */
@Entity('crm_activity_likes')
@Unique('UQ_crm_activity_like_activity_user', ['activityId', 'userId'])
export class CrmActivityLike {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  activityId: string;

  @Column({ type: 'varchar' })
  userId: string;

  @CreateDateColumn()
  createdAt: Date;
}
