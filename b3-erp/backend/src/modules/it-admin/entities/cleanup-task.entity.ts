import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

// Database-maintenance cleanup tasks shown on the database/cleanup page.
// Seeded with a default catalog on first read (installation-checklist pattern).
// run/:id stamps lastRunAt + returns a summary; PUT /:id toggles enabled.
@Entity('it_cleanup_tasks')
@Index(['companyId'])
@Index(['category'])
export class CleanupTask {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  companyId: string;

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 50, default: 'logs' })
  category: string; // logs | temp | orphaned | duplicates | archived

  @Column({ length: 50, default: 'low' })
  impact: string; // low | medium | high

  @Column({ length: 50, nullable: true })
  estimatedSpace: string;

  @Column({ type: 'bigint', default: 0 })
  recordCount: number;

  @Column({ type: 'boolean', default: false })
  automated: boolean;

  @Column({ type: 'boolean', default: true })
  enabled: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastRunAt: Date;

  @Column({ type: 'bigint', default: 0 })
  recordsAffected: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
