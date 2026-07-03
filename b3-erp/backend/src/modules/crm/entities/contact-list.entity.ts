import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('crm_contact_lists')
export class ContactList {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: true })
  companyId: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', default: 'static' })
  type: string;

  @Column({ type: 'int', default: 0 })
  contactCount: number;

  @Column({ type: 'json', nullable: true })
  criteria: Record<string, any>;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ type: 'varchar', nullable: true })
  owner: string;

  @Column({ type: 'varchar', default: 'active' })
  status: string;

  @Column({ type: 'boolean', default: false })
  isShared: boolean;

  @Column({ type: 'varchar', nullable: true })
  lastUsed: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
