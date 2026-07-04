import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Shared discriminator table for after-sales analytics records:
 * technician performance and first-time-fix (FTF) records. The
 * `metricType` column distinguishes each variant so a single additive
 * table backs both analytics pages. Flexible numeric/string payload is
 * carried in `data` for page-specific fields.
 */
@Entity('as_service_analytics')
export class ServiceAnalytics {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // technician | ftf
  @Column({ length: 20, default: 'technician' })
  metricType: string;

  @Column({ length: 200, nullable: true })
  name: string;

  @Column({ length: 100, nullable: true })
  region: string;

  @Column({ length: 100, nullable: true })
  category: string;

  @Column({ type: 'jsonb', nullable: true })
  data: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
