import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('collab_folders')
@Index(['companyId'])
export class CollabFolder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  companyId: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  parentId: string | null;

  @Column({ type: 'int', default: 0 })
  itemCount: number;

  @Column({ type: 'bigint', default: 0 })
  sizeBytes: number;

  @Column({ length: 200, nullable: true })
  owner: string;

  @Column({ type: 'jsonb', nullable: true })
  meta: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
