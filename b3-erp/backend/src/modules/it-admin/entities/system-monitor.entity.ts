import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

// Unified monitoring record. `kind` discriminates between the three
// monitoring views: 'health' (component/service status), 'error' (error-log
// entries) and 'performance' (metric samples). Flexible columns cover all
// three so a single table + endpoint family backs monitoring/health,
// monitoring/errors and monitoring/performance pages.
@Entity('it_system_monitor')
@Index(['companyId'])
@Index(['kind'])
export class SystemMonitor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  companyId: string;

  @Column({ length: 50, default: 'health' })
  kind: string; // health | error | performance

  @Column({ length: 200 })
  name: string;

  @Column({ length: 100, nullable: true })
  category: string;

  @Column({ length: 50, default: 'healthy' })
  status: string; // healthy | degraded | down | resolved | active | new

  @Column({ length: 50, nullable: true })
  severity: string; // info | warning | error | critical

  @Column({ type: 'text', nullable: true })
  message: string;

  @Column({ length: 100, nullable: true })
  source: string;

  @Column({ type: 'float', nullable: true })
  value: number; // metric value / uptime / count

  @Column({ length: 50, nullable: true })
  unit: string; // %, ms, MB, count

  @Column({ type: 'float', nullable: true })
  threshold: number;

  @Column({ type: 'integer', default: 0 })
  occurrences: number;

  @Column({ length: 100, nullable: true })
  lastOccurred: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
