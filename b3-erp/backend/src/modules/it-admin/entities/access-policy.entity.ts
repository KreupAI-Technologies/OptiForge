import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('it_access_policies')
@Index(['companyId'])
export class AccessPolicyDef {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  companyId: string;

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 50, default: 'security' })
  type: string; // security | access | data | notification | compliance

  @Column({ default: true })
  enabled: boolean;

  @Column({ type: 'simple-array', nullable: true })
  appliedRoles: string[];

  @Column({ length: 50, default: 'medium' })
  severity: string; // critical | high | medium | low

  @Column({ type: 'jsonb', nullable: true })
  config: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
