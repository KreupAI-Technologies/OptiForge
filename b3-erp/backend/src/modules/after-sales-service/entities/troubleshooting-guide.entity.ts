import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('as_troubleshooting_guides')
export class TroubleshootingGuide {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 300 })
  title: string;

  @Column({ length: 100, default: 'General' })
  category: string;

  @Column({ length: 20, default: 'medium' })
  difficulty: string;

  @Column({ length: 100, nullable: true })
  estimatedTime: string;

  @Column({ type: 'text', nullable: true })
  symptom: string;

  @Column({ type: 'jsonb', nullable: true })
  steps: any[];

  @Column({ type: 'int', default: 0 })
  views: number;

  @Column({ type: 'int', default: 0 })
  helpful: number;

  @Column({ type: 'numeric', precision: 4, scale: 2, default: 0 })
  successRate: number;

  @Column({ length: 20, default: 'published' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
