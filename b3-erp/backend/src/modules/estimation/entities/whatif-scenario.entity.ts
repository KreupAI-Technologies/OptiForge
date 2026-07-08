import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export interface WhatIfVariable {
  key: string;
  label: string;
  baseValue: number;
  adjustPct: number;
}

export interface WhatIfResults {
  baseValue: number;
  adjustedValue: number;
  deltaValue: number;
  deltaPct: number;
  perVariable: { key: string; contribution: number }[];
}

@Entity('estimation_whatif_scenarios')
export class EstimationWhatIfScenario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column({ type: 'varchar', nullable: true })
  estimateId: string;

  @Column()
  name: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  baseValue: number;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  variables: WhatIfVariable[];

  @Column({ type: 'jsonb', nullable: true })
  results: WhatIfResults;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
