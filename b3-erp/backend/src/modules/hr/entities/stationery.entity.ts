import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

/** HR Stationery (orphan-endpoint build) — backs /hr/assets/office/stationery. */
@Entity('hr_stationery')
export class Stationery {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() companyId: string;
  @Column({ type: 'varchar', nullable: true }) itemCode: string;
  @Column({ type: 'varchar', nullable: true }) itemName: string;
  @Column({ type: 'varchar', default: 'other' }) category: string;
  @Column({ type: 'varchar', nullable: true }) brand: string;
  @Column({ type: 'varchar', default: 'pcs' }) unit: string;
  @Column({ type: 'int', default: 0 }) totalQuantity: number;
  @Column({ type: 'int', default: 0 }) issued: number;
  @Column({ type: 'int', default: 0 }) available: number;
  @Column({ type: 'int', default: 0 }) minStockLevel: number;
  @Column({ type: 'int', default: 0 }) reorderLevel: number;
  @Column({ type: 'numeric', precision: 14, scale: 2, default: 0 }) unitCost: number;
  @Column({ type: 'numeric', precision: 14, scale: 2, default: 0 }) totalValue: number;
  @Column({ type: 'varchar', nullable: true }) location: string;
  @Column({ type: 'varchar', nullable: true }) supplier: string;
  @Column({ type: 'varchar', nullable: true }) lastPurchaseDate: string;
  @Column({ type: 'varchar', default: 'in_stock' }) status: string;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
