import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';

/**
 * The set of skills recorded against a resource (user). One row per resource;
 * skills are stored as a JSON array of skill names.
 */
@Entity('pm_resource_skills')
@Unique('UQ_pm_resource_skills_resource', ['resourceId'])
export class PmResourceSkill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id', type: 'varchar', default: 'default' })
  companyId: string;

  @Column({ name: 'resource_id', type: 'varchar' })
  resourceId: string;

  @Column({ name: 'resource_name', type: 'varchar', nullable: true })
  resourceName: string;

  @Column({ type: 'jsonb', nullable: true })
  skills: string[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
