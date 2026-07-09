import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

// Document templates — backs the advanced-features "Document Generator" tab
// template list. A reusable template (quote / proposal / contract cover, etc.)
// with a body containing {{placeholders}} substituted at generation time.
@Entity('cpq_document_templates')
@Index('IDX_cpq_document_templates_company', ['companyId'])
export class CPQDocumentTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  // quote | proposal | contract | cover_letter | custom
  @Column({ type: 'varchar', default: 'quote' })
  documentType: string;

  // Free-form template body with {{placeholder}} tokens.
  @Column({ type: 'text', nullable: true })
  content: string;

  // Ordered section list for structured templates.
  @Column({ type: 'json', nullable: true })
  sections: { title: string; body: string }[];

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// Generated documents — backs the "Document Generator" tab generated list.
// One record per document produced from a template; the resolved content is
// stored so the PDF can be regenerated on demand.
@Entity('cpq_generated_documents')
@Index('IDX_cpq_generated_documents_company', ['companyId'])
export class CPQGeneratedDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column({ type: 'uuid', nullable: true })
  templateId: string;

  @Column({ type: 'varchar' })
  title: string;

  // quote | proposal | contract | cover_letter | custom
  @Column({ type: 'varchar', default: 'quote' })
  documentType: string;

  // Optional link to the quote/proposal this document was generated for.
  @Column({ type: 'varchar', nullable: true })
  referenceId: string;

  @Column({ type: 'varchar', nullable: true })
  customerName: string;

  // Resolved document body (placeholders already substituted).
  @Column({ type: 'text', nullable: true })
  content: string;

  // draft | generated | sent | signed
  @Column({ type: 'varchar', default: 'generated' })
  status: string;

  @Column({ type: 'varchar', nullable: true })
  generatedBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
