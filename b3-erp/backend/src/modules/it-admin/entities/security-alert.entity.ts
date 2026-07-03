import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('it_security_alerts')
@Index(['companyId'])
export class SecurityAlert {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  companyId: string;

  @Column({ length: 100, default: 'suspicious_activity' })
  type: string;

  @Column({ length: 50, default: 'medium' })
  severity: string;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 50, nullable: true })
  timestamp: string;

  @Column({ length: 150, nullable: true })
  source: string;

  @Column({ length: 100, nullable: true })
  ipAddress: string;

  @Column({ length: 100, nullable: true })
  userId: string;

  @Column({ length: 150, nullable: true })
  userName: string;

  @Column({ length: 50, default: 'new' })
  status: string;

  @Column({ type: 'text', nullable: true })
  actionTaken: string;

  @Column({ length: 150, nullable: true })
  assignedTo: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
