import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Records a verify/reject decision made against a technical drawing on the
 * documents/verification page. Keyed by drawingId so the latest decision per
 * drawing is retrievable even before a full drawings master exists.
 */
@Entity('pm_drawing_verifications')
export class DrawingVerification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id', type: 'varchar', default: 'default' })
  companyId: string;

  @Column({ name: 'project_id', type: 'varchar', nullable: true })
  projectId: string;

  @Column({ name: 'drawing_id', type: 'varchar' })
  drawingId: string;

  @Column({ type: 'varchar', default: 'Verified' })
  status: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'verified_by', type: 'varchar', nullable: true })
  verifiedBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
