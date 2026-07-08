import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    Index,
} from 'typeorm';

/**
 * A free-text comment attached to a workflow approval.
 * Backs the approvals document-view "comments" panel.
 */
@Entity('workflow_approval_comments')
@Index(['approvalId'])
export class ApprovalComment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    @Index()
    approvalId: string;

    @Column({ type: 'varchar', nullable: true })
    authorId: string;

    @Column({ type: 'varchar', nullable: true })
    authorName: string;

    @Column({ type: 'text' })
    body: string;

    @Column({ type: 'jsonb', nullable: true })
    metadata: Record<string, any>;

    @CreateDateColumn()
    createdAt: Date;
}
