import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { WorkCenter } from './work-center.entity';

export type CapacityPlanStatus = 'draft' | 'active' | 'completed' | 'cancelled';
export type CapacityPlanType = 'rough_cut' | 'detailed' | 'finite' | 'infinite';

@Entity('production_capacity_plans')
export class CapacityPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id' })
  companyId: string;

  @Column({ name: 'plan_number', unique: true })
  planNumber: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 20 })
  planType: CapacityPlanType;

  @Column({ type: 'varchar', length: 20, default: 'draft' })
  status: CapacityPlanStatus;

  @Column({ name: 'start_date', type: 'date' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'date' })
  endDate: Date;

  @Column({ name: 'work_center_id', type: 'varchar', nullable: true })
  workCenterId: string | null;

  @ManyToOne(() => WorkCenter, { nullable: true })
  @JoinColumn({ name: 'work_center_id' })
  workCenter: WorkCenter;

  @Column({ name: 'available_capacity', type: 'decimal', precision: 15, scale: 2 })
  availableCapacity: number;

  @Column({ name: 'required_capacity', type: 'decimal', precision: 15, scale: 2 })
  requiredCapacity: number;

  @Column({ name: 'utilization_percentage', type: 'decimal', precision: 5, scale: 2, default: 0 })
  utilizationPercentage: number;

  @Column({ name: 'capacity_unit', default: 'hours' })
  capacityUnit: string;

  @Column({ type: 'jsonb', nullable: true })
  capacityBreakdown: {
    period: string;
    available: number;
    required: number;
    utilization: number;
  }[] | null;

  @Column({ type: 'jsonb', nullable: true })
  resourceAllocations: {
    resourceId: string;
    resourceType: string;
    allocatedHours: number;
  }[] | null;

  @Column({ type: 'jsonb', nullable: true })
  constraints: {
    type: string;
    description: string;
    impact: string;
  }[] | null;

  @Column({ name: 'is_bottleneck', type: 'boolean', default: false })
  isBottleneck: boolean;

  // Deterministic level-load / optimization pass result
  @Column({ name: 'is_optimized', type: 'boolean', default: false })
  isOptimized: boolean;

  @Column({ name: 'optimization_score', type: 'decimal', precision: 5, scale: 2, nullable: true })
  optimizationScore: number | null;

  @Column({ name: 'optimized_at', type: 'timestamp', nullable: true })
  optimizedAt: Date | null;

  // Persisted overtime allocations produced by overtime planning
  @Column({ name: 'overtime_plans', type: 'jsonb', nullable: true })
  overtimePlans:
    | {
        workCenterId: string | null;
        workCenterName: string | null;
        shortfallHours: number;
        overtimeHours: number;
        shifts: number;
        estimatedCost: number;
        plannedFor: string;
      }[]
    | null;

  @Column({ name: 'total_overtime_hours', type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalOvertimeHours: number;

  @Column({ name: 'created_by' })
  createdBy: string;

  @Column({ name: 'approved_by', type: 'varchar', nullable: true })
  approvedBy: string | null;

  @Column({ name: 'approved_at', type: 'timestamp', nullable: true })
  approvedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
