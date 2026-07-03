import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('as_knowledge_faqs')
export class KnowledgeFaq {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 500 })
  question: string;

  @Column({ type: 'text' })
  answer: string;

  @Column({ length: 100, default: 'General' })
  category: string;

  @Column({ type: 'int', default: 0 })
  helpful: number;

  @Column({ type: 'int', default: 0 })
  unhelpful: number;

  @Column({ type: 'int', default: 0 })
  views: number;

  @Column({ default: false })
  featured: boolean;

  @Column({ length: 20, default: 'active' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
