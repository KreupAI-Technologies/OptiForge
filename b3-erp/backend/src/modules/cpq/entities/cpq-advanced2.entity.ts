import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

// Guided-selling questions/rules — backs the advanced-features
// "Guided Selling" tab. A simple ordered list of qualifying questions with
// their answer options and the products/recommendations they map to.
@Entity('cpq_guided_selling_questions')
@Index('IDX_cpq_guided_selling_company', ['companyId'])
export class CPQGuidedSellingQuestion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  // single | multiple | number | text | boolean | range
  @Column({ type: 'varchar', default: 'single' })
  questionType: string;

  @Column({ type: 'boolean', default: true })
  required: boolean;

  @Column({ type: 'int', default: 0 })
  displayOrder: number;

  // Answer options for choice-type questions.
  @Column({ type: 'json', nullable: true })
  options: {
    label: string;
    value: string;
    recommended?: boolean;
    productIds?: string[];
  }[];

  @Column({ type: 'text', nullable: true })
  helpText: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// Margin guardrails — backs the advanced-features "Margin Analysis" tab
// guardrail list. Each rule fires an action (warn/block/require_approval)
// when a quote crosses the configured threshold.
@Entity('cpq_margin_guardrails')
@Index('IDX_cpq_margin_guardrails_company', ['companyId'])
export class CPQMarginGuardrail {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column({ type: 'varchar' })
  name: string;

  // min_margin | max_discount | target_margin | floor_price
  @Column({ type: 'varchar', default: 'min_margin' })
  guardrailType: string;

  @Column({ type: 'decimal', precision: 8, scale: 2, default: 0 })
  threshold: number;

  @Column({ type: 'boolean', default: true })
  enabled: boolean;

  // warn | block | require_approval
  @Column({ type: 'varchar', default: 'warn' })
  action: string;

  @Column({ type: 'json', nullable: true })
  notifyRoles: string[];

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
