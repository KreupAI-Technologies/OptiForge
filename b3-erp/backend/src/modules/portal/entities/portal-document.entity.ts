import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('portal_documents')
@Index(['companyId'])
export class PortalDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  companyId: string;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 50, default: 'file' })
  docType: string; // folder | file

  @Column({ type: 'varchar', length: 100, nullable: true })
  customerId: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  parentId: string | null;

  @Column({ length: 50, nullable: true })
  category: string; // Invoices | Contracts | Project Specs

  @Column({ type: 'bigint', default: 0 })
  sizeBytes: number;

  @Column({ type: 'int', default: 0 })
  itemCount: number;

  @Column({ type: 'text', nullable: true })
  downloadUrl: string;

  @Column({ type: 'jsonb', nullable: true })
  meta: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
