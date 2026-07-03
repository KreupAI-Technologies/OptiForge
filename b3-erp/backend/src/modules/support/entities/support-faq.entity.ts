import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Support FAQ
 * Backs the /support/knowledge/faqs page. Reference list of frequently
 * asked questions with categorisation and helpfulness metrics.
 */
@Entity('support_faqs')
export class SupportFaq {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column({ type: 'varchar', nullable: true })
  faqId: string;

  @Column({ type: 'text' })
  question: string;

  @Column({ type: 'text', nullable: true })
  answer: string;

  @Column({ type: 'varchar', nullable: true })
  category: string;

  @Column({ type: 'json', nullable: true })
  tags: string[];

  @Column({ type: 'int', default: 0 })
  views: number;

  @Column({ type: 'int', default: 0 })
  helpful: number;

  @Column({ type: 'int', default: 0 })
  notHelpful: number;

  @Column({ type: 'varchar', nullable: true })
  author: string;

  @Column({ default: false })
  featured: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
