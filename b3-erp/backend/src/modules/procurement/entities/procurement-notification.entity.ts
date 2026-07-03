import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('procurement_notifications')
@Index(['companyId', 'read'])
export class ProcurementNotification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  companyId: string;

  @Column({ length: 50, default: 'info' })
  type: string;

  @Column({ length: 20, default: 'medium' })
  priority: string;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  message: string;

  @Column({ default: false })
  read: boolean;

  @Column({ length: 255, nullable: true })
  action: string;

  @Column({ length: 255, nullable: true })
  actionUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
