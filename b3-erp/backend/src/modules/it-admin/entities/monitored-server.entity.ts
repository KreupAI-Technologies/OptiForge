import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

// Physical/logical servers shown on the monitoring/health "Servers" tab.
// Seeded with a default fleet on first read when the table is empty.
@Entity('it_monitored_servers')
@Index(['companyId'])
@Index(['status'])
export class MonitoredServer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  companyId: string;

  @Column({ length: 200 })
  name: string;

  @Column({ length: 200, nullable: true })
  host: string;

  @Column({ length: 100, default: 'Application Server' })
  role: string; // Web Server | Database Server | Application Server | Cache Server

  @Column({ length: 50, default: 'Healthy' })
  status: string; // Healthy | Warning | Down

  @Column({ type: 'float', default: 0 })
  cpuPct: number;

  @Column({ type: 'float', default: 0 })
  memPct: number;

  @Column({ type: 'float', default: 0 })
  diskPct: number;

  @Column({ type: 'float', default: 0 })
  networkPct: number;

  @Column({ length: 100, nullable: true })
  uptime: string;

  @Column({ length: 100, nullable: true })
  location: string;

  @Column({ type: 'timestamp', nullable: true })
  lastRestartAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastCheckAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
