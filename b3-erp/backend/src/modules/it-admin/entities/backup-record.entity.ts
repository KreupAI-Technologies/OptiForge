import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('it_backup_records')
@Index(['companyId'])
export class BackupRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  companyId: string;

  @Column({ length: 200 })
  name: string;

  @Column({ length: 50, default: 'full' })
  type: string;

  @Column({ length: 50, default: 'completed' })
  status: string;

  @Column({ length: 50, nullable: true })
  size: string;

  @Column({ length: 50, nullable: true })
  location: string;

  @Column({ length: 50, nullable: true })
  startedAt: string;

  @Column({ length: 50, nullable: true })
  completedAt: string;

  @Column({ length: 50, nullable: true })
  duration: string;

  @Column({ type: 'boolean', default: false })
  automated: boolean;

  @Column({ length: 150, nullable: true })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
