import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('it_custom_fields')
@Index(['companyId'])
export class CustomFieldDef {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  companyId: string;

  @Column({ length: 150 })
  name: string;

  @Column({ length: 200 })
  label: string;

  @Column({ length: 100, nullable: true })
  module: string;

  @Column({ length: 50, default: 'text' })
  fieldType: string; // text | number | date | boolean | dropdown | textarea | url | email

  @Column({ default: false })
  required: boolean;

  @Column({ length: 255, nullable: true })
  defaultValue: string;

  @Column({ type: 'simple-array', nullable: true })
  options: string[];

  @Column({ length: 255, nullable: true })
  validation: string;

  @Column({ type: 'text', nullable: true })
  helpText: string;

  @Column({ length: 50, nullable: true })
  createdAtLabel: string;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
