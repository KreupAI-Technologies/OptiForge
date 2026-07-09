import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Project } from '../../project/entities/project.entity';

export enum HandoverStepStatus {
    PENDING = 'pending',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
}

/**
 * A single step in the 8-step client-handover checklist (steps 8.13–8.20).
 * Rows are seeded lazily (on first read of a project's checklist) from
 * STANDARD_HANDOVER_STEPS in the service, so no data migration is needed.
 * Backs the (modules)/installation/handover page.
 */
@Entity('handover_checklist_steps')
export class HandoverChecklistStep {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'project_id' })
    projectId: string;

    @ManyToOne(() => Project)
    @JoinColumn({ name: 'project_id' })
    project: Project;

    @Column({ name: 'step_no' })
    stepNo: number; // 1..8

    @Column()
    title: string;

    @Column({
        type: 'enum',
        enum: HandoverStepStatus,
        default: HandoverStepStatus.PENDING,
    })
    status: HandoverStepStatus;

    @Column({ type: 'text', nullable: true })
    notes: string;

    @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
    completedAt: Date;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
