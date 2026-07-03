import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('crm_proposals')
export class CrmProposal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: true })
  companyId: string;

  @Column({ type: 'varchar', nullable: true })
  proposalNumber: string;

  @Column()
  title: string;

  @Column({ type: 'varchar', nullable: true })
  customer: string;

  @Column({ type: 'varchar', nullable: true })
  customerCompany: string;

  @Column({ type: 'varchar', nullable: true })
  contactPerson: string;

  @Column({ type: 'varchar', default: 'draft' })
  status: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalValue: number;

  @Column({ type: 'int', default: 0 })
  sections: number;

  @Column({ type: 'int', default: 0 })
  pages: number;

  @Column({ type: 'varchar', nullable: true })
  submittedDate: string;

  @Column({ type: 'varchar', nullable: true })
  viewedDate: string;

  @Column({ type: 'varchar', nullable: true })
  respondedDate: string;

  @Column({ type: 'varchar', nullable: true })
  validUntil: string;

  @Column({ type: 'int', default: 50 })
  probability: number;

  @Column({ type: 'varchar', nullable: true })
  assignedTo: string;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'int', default: 0 })
  attachments: number;

  @Column({ type: 'varchar', nullable: true })
  lastActivity: string;

  @Column({ type: 'varchar', nullable: true })
  createdDate: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
