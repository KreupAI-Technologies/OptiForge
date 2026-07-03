import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Support Ticket Category
 * Backs the /support/tickets/categories page. Reference list used to
 * classify support tickets with SLA targets and resolution metrics.
 */
@Entity('support_ticket_categories')
export class SupportTicketCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', nullable: true })
  color: string;

  @Column({ type: 'int', default: 0 })
  ticketCount: number;

  @Column({ type: 'varchar', nullable: true })
  avgResolutionTime: string;

  @Column({ type: 'varchar', nullable: true })
  slaTarget: string;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
