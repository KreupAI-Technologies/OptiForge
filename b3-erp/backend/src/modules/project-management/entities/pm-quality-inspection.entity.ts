import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('pm_quality_inspections')
export class PmQualityInspectionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id', type: 'varchar', default: 'default' })
  companyId: string;

  @Column({ name: 'inspection_number', type: 'varchar', nullable: true })
  inspectionNumber: string;

  @Column({ name: 'project_id', type: 'varchar', nullable: true })
  projectId: string;

  @Column({ name: 'project_name', type: 'varchar', nullable: true })
  projectName: string;

  @Column({ name: 'inspection_date', type: 'varchar', nullable: true })
  inspectionDate: string;

  @Column({ name: 'inspection_type', type: 'varchar', nullable: true })
  inspectionType: string;

  @Column({ type: 'varchar', nullable: true })
  phase: string;

  @Column({ name: 'work_package', type: 'varchar', nullable: true })
  workPackage: string;

  @Column({ name: 'inspector_name', type: 'varchar', nullable: true })
  inspectorName: string;

  @Column({ name: 'inspector_id', type: 'varchar', nullable: true })
  inspectorId: string;

  @Column({ type: 'jsonb', nullable: true })
  checklist: any;

  @Column({ name: 'total_check_points', type: 'int', default: 0 })
  totalCheckPoints: number;

  @Column({ type: 'int', default: 0 })
  passed: number;

  @Column({ type: 'int', default: 0 })
  failed: number;

  @Column({ name: 'not_applicable', type: 'int', default: 0 })
  notApplicable: number;

  @Column({ type: 'int', default: 0 })
  pending: number;

  @Column({ name: 'overall_status', type: 'varchar', default: 'Pending' })
  overallStatus: string;

  @Column({ type: 'int', default: 0 })
  defects: number;

  @Column({ name: 'critical_defects', type: 'int', default: 0 })
  criticalDefects: number;

  @Column({ type: 'int', default: 0 })
  photos: number;

  @Column({ name: 'signed_off', type: 'boolean', default: false })
  signedOff: boolean;

  @Column({ name: 'sign_off_by', type: 'varchar', nullable: true })
  signOffBy: string;

  @Column({ name: 'sign_off_date', type: 'varchar', nullable: true })
  signOffDate: string;

  @Column({ name: 'next_inspection_date', type: 'varchar', nullable: true })
  nextInspectionDate: string;

  @Column({ type: 'text', nullable: true })
  remarks: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
