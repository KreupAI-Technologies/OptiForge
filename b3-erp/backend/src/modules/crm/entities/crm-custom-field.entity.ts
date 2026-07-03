import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('crm_custom_fields')
export class CrmCustomField {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: true })
  companyId: string;

  @Column()
  name: string;

  @Column({ type: 'varchar', nullable: true })
  apiName: string;

  @Column({ type: 'varchar', nullable: true })
  label: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', default: 'text' })
  fieldType: string;

  @Column({ type: 'varchar', default: 'lead' })
  module: string;

  @Column({ type: 'varchar', default: 'custom' })
  category: string;

  @Column({ type: 'varchar', default: 'string' })
  dataType: string;

  @Column({ type: 'boolean', default: false })
  isRequired: boolean;

  @Column({ type: 'boolean', default: false })
  isUnique: boolean;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: true })
  isSearchable: boolean;

  @Column({ type: 'boolean', default: true })
  isEditable: boolean;

  @Column({ type: 'varchar', nullable: true })
  defaultValue: string;

  @Column({ type: 'text', nullable: true })
  helpText: string;

  // Complex validation + usage stored as JSON strings.
  @Column({ type: 'text', nullable: true })
  validation: string;

  @Column({ type: 'text', nullable: true })
  usage: string;

  @Column({ type: 'varchar', nullable: true })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
