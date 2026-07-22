import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * CurrencyMaster — master record for a currency the tenant transacts in.
 * Distinct from exchange rates (those live in FinanceExchangeRate).
 * Additive table finance_currency_master.
 */
@Entity('finance_currency_master')
export class CurrencyMaster {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 10 })
  code: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 10, nullable: true })
  symbol: string;

  @Column({ name: 'is_base_currency', type: 'boolean', default: false })
  isBaseCurrency: boolean;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'decimal_places', type: 'int', default: 2 })
  decimalPlaces: number;

  @Column({ name: 'company_id', length: 100, nullable: true })
  companyId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
