import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('collab_messages')
@Index(['companyId'])
@Index(['channelId'])
export class CollabMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  companyId: string;

  @Column({ type: 'varchar', length: 100 })
  channelId: string;

  @Column({ length: 200, nullable: true })
  senderName: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  senderId: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ length: 50, default: 'text' })
  messageType: string;

  @Column({ length: 50, nullable: true })
  status: string; // sent | delivered | read

  @Column({ type: 'timestamptz', nullable: true })
  sentAt: Date | null;

  @Column({ type: 'jsonb', nullable: true })
  meta: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
