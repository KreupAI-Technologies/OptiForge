import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('it_user_groups')
@Index(['companyId'])
export class UserGroup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  companyId: string;

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'integer', default: 0 })
  memberCount: number;

  @Column({ type: 'simple-array', nullable: true })
  permissions: string[];

  @Column({ type: 'jsonb', nullable: true })
  members: any;

  @Column({ length: 50, nullable: true })
  createdDate: string;

  @Column({ length: 50, default: 'Active' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
