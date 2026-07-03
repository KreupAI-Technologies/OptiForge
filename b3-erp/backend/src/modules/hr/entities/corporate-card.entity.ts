import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * HR Corporate Card (orphan-endpoint build)
 * Backs /hr/cards/management and /hr/travel/cards. ADDITIVE ONLY.
 */
@Entity('hr_corporate_cards')
@Index('IDX_hr_corporate_cards_companyId', ['companyId'])
export class CorporateCard {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column({ type: 'varchar', nullable: true })
  cardNumber: string;

  @Column({ type: 'varchar', nullable: true })
  cardType: string;

  @Column({ type: 'varchar', nullable: true })
  cardholderName: string;

  @Column({ type: 'varchar', nullable: true })
  employeeCode: string;

  @Column({ type: 'varchar', nullable: true })
  department: string;

  @Column({ type: 'varchar', nullable: true })
  designation: string;

  @Column({ type: 'varchar', nullable: true })
  cardProvider: string;

  @Column({ type: 'numeric', precision: 14, scale: 2, nullable: true })
  creditLimit: number;

  @Column({ type: 'numeric', precision: 14, scale: 2, nullable: true })
  availableLimit: number;

  @Column({ type: 'numeric', precision: 14, scale: 2, nullable: true })
  currentBalance: number;

  @Column({ type: 'numeric', precision: 14, scale: 2, nullable: true })
  monthlySpend: number;

  @Column({ type: 'varchar', nullable: true })
  issueDate: string;

  @Column({ type: 'varchar', nullable: true })
  expiryDate: string;

  @Column({ type: 'varchar', nullable: true })
  lastTransactionDate: string;

  @Column({ type: 'varchar', nullable: true })
  billingCycle: string;

  @Column({ type: 'varchar', default: 'active' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
