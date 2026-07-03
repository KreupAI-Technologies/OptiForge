import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Omnichannel Interaction
 * Backs the /support/omnichannel page (unified inbox). Each row is a support
 * conversation/interaction surfaced across a channel (email/chat/phone/social/
 * whatsapp/portal), aligned with the frontend ConversationMessage shape.
 */
@Entity('support_omnichannel_interactions')
@Index('IDX_omnichannel_interactions_company', ['companyId'])
export class OmnichannelInteraction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column()
  ticketId: string;

  @Column()
  subject: string;

  @Column()
  customerName: string;

  @Column({ type: 'varchar', nullable: true })
  customerEmail: string;

  @Column({ type: 'varchar', nullable: true })
  customerAvatar: string;

  /** email | chat | phone | social | whatsapp | portal | video | sms | all */
  @Column({ type: 'varchar', default: 'email' })
  channel: string;

  @Column({ type: 'text', nullable: true })
  lastMessage: string;

  @Column({ type: 'varchar', nullable: true })
  lastMessageTime: string;

  @Column({ type: 'int', default: 0 })
  unreadCount: number;

  /** critical | high | medium | low */
  @Column({ type: 'varchar', default: 'medium' })
  priority: string;

  /** open | pending | resolved | closed */
  @Column({ type: 'varchar', default: 'open' })
  status: string;

  @Column({ type: 'varchar', nullable: true })
  assignedToName: string;

  @Column({ type: 'varchar', nullable: true })
  assignedToAvatar: string;

  @Column({ type: 'json', nullable: true })
  tags: string[];

  @Column({ type: 'boolean', default: false })
  starred: boolean;

  @Column({ type: 'boolean', default: false })
  hasAttachments: boolean;

  @Column({ type: 'varchar', nullable: true })
  slaDeadline: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
