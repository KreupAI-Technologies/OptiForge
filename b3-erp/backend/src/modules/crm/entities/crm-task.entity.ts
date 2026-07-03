import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('crm_tasks')
export class CrmTask {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: true })
  companyId: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', default: 'todo' })
  status: string;

  @Column({ type: 'varchar', default: 'medium' })
  priority: string;

  @Column({ type: 'varchar', nullable: true })
  assignedToId: string;

  @Column({ type: 'varchar', nullable: true })
  assignedToName: string;

  @Column({ type: 'varchar', nullable: true })
  dueDate: string;

  @Column({ type: 'varchar', nullable: true })
  createdById: string;

  @Column({ type: 'varchar', nullable: true })
  createdByName: string;

  // relatedTo { type, id, name } stored as JSON string.
  @Column({ type: 'text', nullable: true })
  relatedTo: string;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ type: 'int', default: 0 })
  comments: number;

  @Column({ type: 'int', default: 0 })
  attachments: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
