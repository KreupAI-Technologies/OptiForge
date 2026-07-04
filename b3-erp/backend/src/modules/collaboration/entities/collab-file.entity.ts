import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('collab_files')
@Index(['companyId'])
export class CollabFile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  companyId: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  folderId: string | null;

  @Column({ length: 50, default: 'file' })
  fileType: string;

  @Column({ type: 'bigint', default: 0 })
  sizeBytes: number;

  @Column({ length: 200, nullable: true })
  owner: string;

  @Column({ type: 'boolean', default: false })
  isStarred: boolean;

  @Column({ type: 'boolean', default: false })
  isShared: boolean;

  @Column({ type: 'jsonb', nullable: true })
  meta: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
