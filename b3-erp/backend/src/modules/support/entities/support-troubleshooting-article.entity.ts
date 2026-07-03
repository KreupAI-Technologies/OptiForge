import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Support Troubleshooting Article — backs /support/knowledge/troubleshooting.
 */
@Entity('support_troubleshooting_articles')
export class SupportTroubleshootingArticle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column({ type: 'varchar', nullable: true })
  articleId: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  problem: string;

  @Column({ type: 'text', nullable: true })
  solution: string;

  @Column({ type: 'varchar', nullable: true })
  category: string;

  @Column({ type: 'varchar', default: 'medium' })
  severity: string;

  @Column({ type: 'json', nullable: true })
  steps: string[];

  @Column({ type: 'json', nullable: true })
  causes: string[];

  @Column({ type: 'json', nullable: true })
  prevention: string[];

  @Column({ type: 'json', nullable: true })
  tags: string[];

  @Column({ type: 'int', default: 0 })
  views: number;

  @Column({ type: 'int', default: 0 })
  helpful: number;

  @Column({ type: 'varchar', nullable: true })
  lastUpdated: string;

  @Column({ type: 'varchar', nullable: true })
  author: string;

  @Column({ type: 'json', nullable: true })
  relatedArticles: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
