import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * HR Safety PPE (orphan-endpoint build). ADDITIVE ONLY.
 * Shared discriminator table backing /hr/safety/ppe/* pages:
 * `recordType` = stock | issuance | assignment.
 * Page-specific fields live in `meta` (jsonb).
 */
@Entity('hr_safety_ppe')
@Index('IDX_hr_safety_ppe_companyId', ['companyId'])
export class SafetyPpe {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column({ type: 'varchar', default: 'stock' })
  recordType: string;

  @Column({ type: 'varchar', nullable: true })
  itemCode: string;

  @Column({ type: 'varchar', nullable: true })
  itemName: string;

  @Column({ type: 'varchar', nullable: true })
  category: string;

  @Column({ type: 'varchar', nullable: true })
  size: string;

  @Column({ type: 'int', nullable: true })
  quantity: number;

  @Column({ type: 'int', nullable: true })
  inStock: number;

  @Column({ type: 'int', nullable: true })
  reorderLevel: number;

  @Column({ type: 'varchar', nullable: true })
  employeeId: string;

  @Column({ type: 'varchar', nullable: true })
  employeeName: string;

  @Column({ type: 'varchar', nullable: true })
  department: string;

  @Column({ type: 'varchar', nullable: true })
  issuedDate: string;

  @Column({ type: 'varchar', nullable: true })
  expiryDate: string;

  @Column({ type: 'varchar', nullable: true })
  nextReplacement: string;

  @Column({ type: 'varchar', nullable: true })
  condition: string;

  @Column({ type: 'varchar', nullable: true })
  supplier: string;

  @Column({ type: 'varchar', default: 'available' })
  status: string;

  @Column({ type: 'text', nullable: true })
  remarks: string;

  @Column({ type: 'jsonb', nullable: true })
  meta: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
