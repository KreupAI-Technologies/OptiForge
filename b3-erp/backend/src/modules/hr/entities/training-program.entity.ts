import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * HR Training Program (orphan-endpoint build)
 * Backs /hr/training/programs/catalog. ADDITIVE ONLY.
 */
@Entity('hr_training_programs')
@Index('IDX_hr_training_programs_companyId', ['companyId'])
export class TrainingProgram {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column({ type: 'varchar', nullable: true })
  code: string;

  @Column({ type: 'varchar', nullable: true })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', nullable: true })
  category: string;

  @Column({ type: 'varchar', nullable: true })
  level: string;

  @Column({ type: 'numeric', precision: 8, scale: 2, nullable: true })
  duration: number;

  @Column({ type: 'varchar', nullable: true })
  mode: string;

  @Column({ type: 'varchar', nullable: true })
  instructor: string;

  @Column({ type: 'varchar', nullable: true })
  department: string;

  @Column({ type: 'int', nullable: true })
  capacity: number;

  @Column({ type: 'int', nullable: true })
  enrolled: number;

  @Column({ type: 'numeric', precision: 14, scale: 2, nullable: true })
  cost: number;

  @Column({ type: 'varchar', nullable: true })
  nextBatch: string;

  @Column({ type: 'varchar', nullable: true })
  location: string;

  @Column({ type: 'boolean', default: false })
  certification: boolean;

  @Column({ type: 'varchar', default: 'active' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
