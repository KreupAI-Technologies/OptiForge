import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('it_document_templates')
@Index(['companyId'])
export class DocumentTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  companyId: string;

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 50, default: 'email' })
  type: string; // email | document | report | invoice | label

  @Column({ length: 100, nullable: true })
  category: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ type: 'simple-array', nullable: true })
  variables: string[];

  @Column({ length: 50, default: 'html' })
  format: string; // html | pdf | docx | plain

  @Column({ length: 50, nullable: true })
  lastModified: string;

  @Column({ type: 'int', default: 0 })
  usageCount: number;

  @Column({ default: false })
  isDefault: boolean;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
