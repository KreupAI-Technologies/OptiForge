import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

/**
 * Attachment
 * Generic file-storage record. Each row is one uploaded file on local disk
 * (see AttachmentsService), linked to an owning domain record by the
 * (entityType, entityId) pair — e.g. ('project', <projectId>) for installation
 * photos or ('employee', <employeeId>) for HR documents.
 */
@Entity('attachments')
@Index('idx_attachments_entity', ['entityType', 'entityId'])
export class Attachment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Logical owner type, e.g. 'project', 'employee', 'installation-photo'.
  @Column({ type: 'varchar' })
  entityType: string;

  // Id of the owning record (kept as string to stay entity-agnostic).
  @Column({ type: 'varchar' })
  entityId: string;

  // Original client-supplied filename.
  @Column({ type: 'varchar' })
  fileName: string;

  @Column({ type: 'varchar' })
  mimeType: string;

  // File size in bytes.
  @Column({ type: 'int', default: 0 })
  size: number;

  // Path on disk (relative to the backend working dir), e.g. uploads/<uuid>.jpg
  @Column({ type: 'varchar' })
  storageKey: string;

  // Uploader id/name if known.
  @Column({ type: 'varchar', nullable: true })
  uploadedBy: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
