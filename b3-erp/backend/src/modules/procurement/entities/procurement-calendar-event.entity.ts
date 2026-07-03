import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('procurement_calendar_events')
@Index(['companyId', 'eventDate'])
export class ProcurementCalendarEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  companyId: string;

  @Column({ length: 255 })
  title: string;

  @Column({ length: 50, default: 'meeting' })
  type: string;

  @Column({ type: 'date' })
  eventDate: Date;

  @Column({ length: 50, nullable: true })
  time: string;

  @Column({ length: 255, nullable: true })
  vendor: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 255, nullable: true })
  location: string;

  @Column({ type: 'int', nullable: true })
  items: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  value: number;

  @Column({ length: 50, default: 'scheduled' })
  status: string;

  @Column({ length: 20, default: 'medium' })
  priority: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
