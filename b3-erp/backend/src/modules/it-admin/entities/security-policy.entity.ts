import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('it_security_policies')
@Index(['companyId'])
export class SecurityPolicy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  companyId: string;

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 50, default: 'security' })
  type: string;

  @Column({ type: 'boolean', default: true })
  enabled: boolean;

  @Column({ type: 'simple-array', nullable: true })
  appliedRoles: string[];

  @Column({ length: 50, default: 'medium' })
  severity: string;

  @Column({ type: 'jsonb', nullable: true })
  config: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
