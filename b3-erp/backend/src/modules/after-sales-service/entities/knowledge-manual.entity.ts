import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('as_knowledge_manuals')
export class KnowledgeManual {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  title: string;

  @Column({ length: 100, nullable: true })
  productModel: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 100, default: 'General' })
  category: string;

  @Column({ length: 150, nullable: true })
  author: string;

  @Column({ type: 'date', nullable: true })
  datePublished: string;

  @Column({ length: 50, nullable: true })
  fileSize: string;

  @Column({ length: 20, default: 'pdf' })
  format: string;

  @Column({ type: 'int', default: 0 })
  downloads: number;

  @Column({ type: 'numeric', precision: 3, scale: 1, default: 0 })
  rating: number;

  @Column({ type: 'int', default: 0 })
  views: number;

  @Column({ length: 50, default: 'English' })
  language: string;

  @Column({ type: 'int', default: 0 })
  pages: number;

  @Column({ type: 'int', default: 1 })
  versions: number;

  @Column({ default: false })
  featured: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
