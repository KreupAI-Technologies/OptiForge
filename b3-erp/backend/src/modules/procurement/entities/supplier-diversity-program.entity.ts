import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('supplier_diversity_programs')
@Index(['companyId', 'status'])
export class SupplierDiversityProgram {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  companyId: string;

  @Column({ name: 'supplier_id', type: 'varchar', length: 100, nullable: true })
  supplierId: string;

  // e.g. minority-owned | women-owned | veteran-owned | small-business
  @Column({ type: 'varchar', length: 100 })
  category: string;

  @Column({ name: 'certification_type', type: 'varchar', length: 100, nullable: true })
  certificationType: string;

  // prospect | certified | active | expired | inactive
  @Column({ type: 'varchar', length: 30, default: 'prospect' })
  status: string;

  @Column({
    name: 'spend_amount',
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
  })
  spendAmount: number;

  @Column({
    name: 'goal_percent',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  goalPercent: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
