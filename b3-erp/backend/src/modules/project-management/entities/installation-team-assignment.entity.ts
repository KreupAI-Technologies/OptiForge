import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Project } from '../../project/entities/project.entity';

/**
 * A member of the installation crew assigned to a project/installation job.
 * One row per installer per project. Backs the (modules)/installation/team-assignment
 * page (dedicated POST assign-team/:projectId endpoint) — additive, project-scoped
 * persistence that does not overload the daily-install-report flow.
 */
@Entity('installation_team_assignments')
export class InstallationTeamAssignment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'project_id' })
    projectId: string;

    @ManyToOne(() => Project)
    @JoinColumn({ name: 'project_id' })
    project: Project;

    @Column({ name: 'installer_id', type: 'varchar', nullable: true })
    installerId: string;

    @Column({ name: 'installer_name' })
    installerName: string;

    @Column({ type: 'varchar', default: 'member' })
    role: string; // lead | technician | helper | member

    @Column({ type: 'jsonb', nullable: true })
    skills: string[];

    @Column({ name: 'assigned_by', type: 'varchar', nullable: true })
    assignedBy: string;

    @Column({ name: 'is_active', default: true })
    isActive: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
