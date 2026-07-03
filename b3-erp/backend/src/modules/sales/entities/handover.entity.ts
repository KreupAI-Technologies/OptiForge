import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('sales_handovers')
export class Handover {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: true })
  companyId: string;

  @Column({ type: 'varchar' })
  handoverNumber: string;

  @Column({ type: 'varchar', nullable: true })
  projectNumber: string;

  @Column({ type: 'varchar' })
  projectName: string;

  @Column({ type: 'varchar', nullable: true })
  customer: string;

  @Column({ type: 'varchar', nullable: true })
  salesPerson: string;

  @Column({ type: 'varchar', nullable: true })
  projectManager: string;

  @Column({ type: 'date', nullable: true })
  handoverDate: Date;

  @Column({ type: 'varchar', default: 'Pending' })
  status: string;

  @Column({ type: 'int', default: 0 })
  completionPercentage: number;

  @Column({ type: 'int', default: 0 })
  documentsAttached: number;

  @Column({ type: 'int', default: 0 })
  requiredDocuments: number;

  @Column({ type: 'date', nullable: true })
  clientRequestDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
