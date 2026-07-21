import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Project } from '../../project/entities/project.entity';

export enum HandoverStatus {
    PENDING = 'pending',
    SIGNED = 'signed',
    ARCHIVED = 'archived',
}

@Entity('handover_certificates')
export class HandoverCertificate {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'project_id' })
    projectId: string;

    @ManyToOne(() => Project)
    @JoinColumn({ name: 'project_id' })
    project: Project;

    @Column({ name: 'client_signatory', type: 'varchar', nullable: true })
    clientSignatory: string;

    @Column({ name: 'signatory_title', type: 'varchar', nullable: true })
    signatoryTitle: string;

    @Column({ name: 'signed_at', type: 'timestamp', nullable: true })
    signedAt: Date;

    @Column({
        type: 'enum',
        enum: HandoverStatus,
        default: HandoverStatus.PENDING,
    })
    status: HandoverStatus;

    @Column({ name: 'certificate_url', type: 'varchar', nullable: true })
    certificateUrl: string;

    @Column({ name: 'closure_rating', type: 'int', nullable: true })
    closureRating: number;

    @Column({ name: 'closure_feedback', type: 'text', nullable: true })
    closureFeedback: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
