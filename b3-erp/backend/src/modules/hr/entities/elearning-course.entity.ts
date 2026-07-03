import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * ElearningCourse (orphan-endpoint build)
 * Backs hr/elearning-courses. ADDITIVE ONLY.
 */
@Entity('hr_elearning_courses')
@Index('IDX_hr_elearning_courses_companyId', ['companyId'])
export class ElearningCourse {
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
  @Column({ type: 'int', default: 0 })
  modules: number;
  @Column({ type: 'int', default: 0 })
  enrolled: number;
  @Column({ type: 'numeric', precision: 3, scale: 2, nullable: true })
  rating: number;
  @Column({ type: 'int', default: 0 })
  reviews: number;
  @Column({ type: 'varchar', nullable: true })
  instructor: string;
  @Column({ type: 'varchar', nullable: true })
  thumbnail: string;
  @Column({ type: 'boolean', default: false })
  certification: boolean;
  @Column({ type: 'varchar', nullable: true })
  language: string;
  @Column({ type: 'varchar', default: 'active' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
