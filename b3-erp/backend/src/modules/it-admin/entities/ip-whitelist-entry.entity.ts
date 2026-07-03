import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('it_ip_whitelist_entries')
@Index(['companyId'])
export class IpWhitelistEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  companyId: string;

  @Column({ length: 100 })
  ipAddress: string;

  @Column({ length: 50, default: 'Single' })
  type: string; // Single | Range

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 100, nullable: true })
  category: string;

  @Column({ length: 150, nullable: true })
  addedBy: string;

  @Column({ length: 50, nullable: true })
  addedDate: string;

  @Column({ length: 50, nullable: true })
  lastAccess: string;

  @Column({ type: 'int', default: 0 })
  accessCount: number;

  @Column({ length: 50, default: 'Active' })
  status: string;

  @Column({ length: 50, nullable: true })
  expiresAt: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
