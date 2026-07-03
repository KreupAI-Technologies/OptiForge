import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ReworkPriority {
  HIGH = 'High',
  MEDIUM = 'Medium',
  LOW = 'Low',
}

export enum ReworkStatus {
  PENDING = 'Pending',
  IN_REWORK = 'In Rework',
  COMPLETED = 'Completed',
  RE_INSPECTION = 'Re-inspection',
}

@Entity('quality_rework_items')
export class ReworkItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true, length: 50 })
  reworkCode: string;

  @Column({ nullable: true, length: 50 })
  defectId: string;

  @Column({ nullable: true, length: 50 })
  projectId: string;

  @Column({ length: 200 })
  component: string;

  @Column({ nullable: true, length: 150 })
  defectType: string;

  @Column({
    type: 'enum',
    enum: ReworkPriority,
    default: ReworkPriority.MEDIUM,
  })
  priority: ReworkPriority;

  @Column({ nullable: true, length: 150 })
  assignedTo: string;

  @Column({
    type: 'enum',
    enum: ReworkStatus,
    default: ReworkStatus.PENDING,
  })
  status: ReworkStatus;

  @Column({ type: 'int', default: 0 })
  iterations: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ nullable: true, length: 100 })
  createdBy: string;

  @Column({ nullable: true, length: 100 })
  updatedBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
