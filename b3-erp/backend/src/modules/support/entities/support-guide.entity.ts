import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Support Knowledge Guide — backs /support/knowledge/guides.
 */
@Entity('support_guides')
export class SupportGuide {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column({ type: 'varchar', nullable: true })
  guideId: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', nullable: true })
  category: string;

  @Column({ type: 'varchar', default: 'Beginner' })
  difficulty: string;

  @Column({ type: 'varchar', nullable: true })
  readTime: string;

  @Column({ type: 'int', default: 0 })
  views: number;

  @Column({ type: 'int', default: 0 })
  helpful: number;

  @Column({ type: 'varchar', nullable: true })
  lastUpdated: string;

  @Column({ type: 'varchar', nullable: true })
  author: string;

  @Column({ type: 'json', nullable: true })
  tags: string[];

  @Column({ type: 'int', default: 0 })
  sections: number;

  @Column({ default: false })
  featured: boolean;

  @Column({ type: 'varchar', default: 'Article' })
  format: string;

  @Column({ type: 'varchar', nullable: true })
  thumbnail: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
