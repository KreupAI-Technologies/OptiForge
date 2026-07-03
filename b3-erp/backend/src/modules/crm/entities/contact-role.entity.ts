import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('crm_contact_roles')
export class ContactRole {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: true })
  companyId: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', default: 'buying' })
  category: string;

  @Column({ type: 'simple-array', nullable: true })
  permissions: string[];

  @Column({ type: 'int', default: 0 })
  contactCount: number;

  @Column({ type: 'int', default: 0 })
  influenceLevel: number;

  @Column({ type: 'boolean', default: false })
  isDecisionMaker: boolean;

  @Column({ type: 'varchar', default: 'active' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
