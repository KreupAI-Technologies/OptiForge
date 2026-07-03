import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('sales_handover_package_documents')
export class HandoverPackageDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: true })
  companyId: string;

  // Links a document to its handover / project package.
  @Column({ type: 'varchar', nullable: true })
  projectId: string;

  @Column({ type: 'varchar', nullable: true })
  projectNumber: string;

  @Column({ type: 'varchar', nullable: true })
  projectName: string;

  @Column({ type: 'varchar', nullable: true })
  customer: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  type: string;

  @Column({ type: 'varchar', default: 'Missing' })
  status: string;

  @Column({ type: 'date', nullable: true })
  uploadDate: Date;

  @Column({ type: 'varchar', nullable: true })
  uploadedBy: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
