import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * Statutory filing records (GST / TDS) and their supporting artefacts.
 *
 * These are RECORD + GENERATE-DOCUMENT features. No real government portal
 * (GSTN / TRACES) is contacted — the filing/return records are persisted
 * locally and documents (PDF / Excel) are generated on demand.
 */

// ---------------------------------------------------------------------------
// GST returns (GSTR-1 / GSTR-3B) + imported GSTR-2A datasets
// ---------------------------------------------------------------------------
@Entity('gst_returns')
@Index(['returnType', 'period'])
export class GstReturn {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 20 })
  returnType: string; // GSTR-1, GSTR-3B, GSTR-2A

  @Column({ length: 20 })
  period: string; // e.g. "2025-01" (YYYY-MM)

  @Column({ type: 'date', nullable: true })
  dueDate: Date;

  @Column({ length: 30, default: 'Draft' })
  status: string; // Draft, Ready to File, Filed, Overdue, Imported

  @Column({ type: 'timestamp', nullable: true })
  filedDate: Date;

  // Acknowledgement / ARN number issued locally on filing.
  @Column({ length: 100, nullable: true })
  ackNo: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalSales: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalPurchases: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  outputTax: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  inputTax: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  netTax: number;

  // Line-item rows captured with the return (for GSTR-1/3B) or the imported
  // GSTR-2A dataset rows. Free-form JSON so the page can round-trip its rows.
  @Column({ type: 'json', nullable: true })
  rows: any[];

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ length: 100, nullable: true })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// TDS returns (24Q / 26Q / 27Q / 27EQ)
// ---------------------------------------------------------------------------
@Entity('tds_returns')
@Index(['formType', 'quarter'])
export class TdsReturn {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 20 })
  formType: string; // 24Q, 26Q, 27Q, 27EQ

  @Column({ length: 30 })
  quarter: string; // e.g. "Q4-2024-25"

  @Column({ type: 'date', nullable: true })
  dueDate: Date;

  @Column({ length: 30, default: 'Draft' })
  status: string; // Draft, Ready to File, Filed, Overdue

  @Column({ type: 'timestamp', nullable: true })
  filedDate: Date;

  @Column({ length: 100, nullable: true })
  acknowledgementNumber: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalDeductions: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalDeposited: number;

  @Column({ type: 'int', default: 0 })
  deducteeCount: number;

  @Column({ type: 'json', nullable: true })
  rows: any[];

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ length: 100, nullable: true })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// TDS challans (bank deposit receipts)
// ---------------------------------------------------------------------------
@Entity('tds_challans')
@Index(['section'])
export class TdsChallan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50 })
  challanNumber: string;

  @Column({ type: 'date' })
  challanDate: Date;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  amount: number;

  @Column({ length: 20 })
  section: string; // 194C, 194J, etc.

  @Column({ length: 150, nullable: true })
  bankName: string;

  @Column({ length: 20, nullable: true })
  bsrCode: string;

  @Column({ length: 30, default: 'Paid' })
  status: string; // Paid, Pending

  @Column({ length: 30, nullable: true })
  quarter: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ length: 100, nullable: true })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
