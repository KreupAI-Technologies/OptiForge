import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Typed relationships between CRM accounts (customers) that fall outside the
 * simple parent/child hierarchy captured on `crm_customers.parentCustomerId`.
 * Supports non-hierarchical types such as `partner` and `competitor`.
 */
@Entity('crm_account_relationships')
export class CrmAccountRelationship {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: true })
  companyId: string;

  @Column({ type: 'varchar' })
  sourceAccountId: string;

  @Column({ type: 'varchar' })
  targetAccountId: string;

  @Column({ type: 'varchar', nullable: true })
  targetAccountName: string;

  // parent | child | partner | competitor
  @Column({ type: 'varchar', default: 'partner' })
  relationshipType: string;

  @Column({ type: 'boolean', default: false })
  bidirectional: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
