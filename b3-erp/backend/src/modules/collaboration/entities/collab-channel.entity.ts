import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('collab_channels')
@Index(['companyId'])
export class CollabChannel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  companyId: string;

  @Column({ length: 200 })
  name: string;

  @Column({ length: 50, default: 'channel' })
  channelType: string; // channel | direct | group

  @Column({ length: 500, nullable: true })
  lastMessage: string;

  @Column({ type: 'timestamptz', nullable: true })
  lastMessageAt: Date | null;

  @Column({ type: 'int', default: 0 })
  unreadCount: number;

  @Column({ type: 'int', default: 0 })
  memberCount: number;

  @Column({ length: 50, nullable: true })
  status: string; // online | offline (for direct)

  @Column({ type: 'jsonb', nullable: true })
  meta: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
