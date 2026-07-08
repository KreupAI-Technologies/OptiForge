import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DispatchRecord, DispatchStatus } from '../entities/dispatch-record.entity';
import { SiteReadiness, ReadinessStatus } from '../entities/site-readiness.entity';
import { InstallationTask, InstallationStatus } from '../entities/installation-task.entity';
import { PackagingCrate, CrateStatus } from '../entities/packaging-crate.entity';
import { DailyInstallReport } from '../entities/daily-install-report.entity';
import { InstallationTeamAssignment } from '../entities/installation-team-assignment.entity';
import { HandoverChecklistStep, HandoverStepStatus } from '../entities/handover-checklist-step.entity';
import { ToolDeployment } from '../entities/tool-deployment.entity';

/**
 * The 8 standard client-handover checklist steps (workflow items 8.13–8.20).
 * Seeded lazily on first read of a project's checklist.
 */
export const STANDARD_HANDOVER_STEPS: { stepNo: number; title: string }[] = [
    { stepNo: 1, title: 'Work Photos Uploaded' },
    { stepNo: 2, title: 'Client Daily Reviews Completed' },
    { stepNo: 3, title: 'Final Approval Obtained' },
    { stepNo: 4, title: 'Site Cleaning Complete' },
    { stepNo: 5, title: 'Tools Returned' },
    { stepNo: 6, title: 'Handover Ceremony Done' },
    { stepNo: 7, title: 'Client Signature Captured' },
    { stepNo: 8, title: 'Project Closed' },
];

@Injectable()
export class LogisticsInstallationService {
    constructor(
        @InjectRepository(DispatchRecord)
        private dispatchRepository: Repository<DispatchRecord>,
        @InjectRepository(SiteReadiness)
        private readinessRepository: Repository<SiteReadiness>,
        @InjectRepository(InstallationTask)
        private installationRepository: Repository<InstallationTask>,
        @InjectRepository(PackagingCrate)
        private crateRepository: Repository<PackagingCrate>,
        @InjectRepository(DailyInstallReport)
        private dailyReportRepository: Repository<DailyInstallReport>,
        @InjectRepository(InstallationTeamAssignment)
        private teamRepository: Repository<InstallationTeamAssignment>,
        @InjectRepository(HandoverChecklistStep)
        private handoverRepository: Repository<HandoverChecklistStep>,
        @InjectRepository(ToolDeployment)
        private toolRepository: Repository<ToolDeployment>,
    ) { }

    // --- Site Readiness ---

    async getReadiness(projectId: string): Promise<SiteReadiness[]> {
        return this.readinessRepository.find({ where: { projectId } });
    }

    async updateReadiness(id: string, status: ReadinessStatus, verifiedBy: string): Promise<SiteReadiness> {
        const check = await this.readinessRepository.findOne({ where: { id } });
        if (!check) throw new NotFoundException('Readiness check not found');
        check.status = status;
        check.verifiedBy = verifiedBy;
        return this.readinessRepository.save(check);
    }

    // --- Dispatch Logic ---

    async checkReadinessForDispatch(projectId: string): Promise<boolean> {
        const checks = await this.readinessRepository.find({ where: { projectId } });
        return checks.every(c => c.status === ReadinessStatus.READY);
    }

    async createDispatch(data: Partial<DispatchRecord>): Promise<DispatchRecord> {
        if (!data.projectId) throw new BadRequestException('Project ID is required');
        const ready = await this.checkReadinessForDispatch(data.projectId);
        if (!ready) {
            throw new BadRequestException('HARD GATE: Site is not READY for dispatch. Please complete all readiness checks.');
        }

        const record = this.dispatchRepository.create(data);
        const saved = await this.dispatchRepository.save(record);

        // Transition project crates to In Transit
        await this.crateRepository.update({ projectId: data.projectId }, { status: CrateStatus.DISPATCHED });

        return saved;
    }

    // --- Field Installation ---

    async getInstallerTasks(projectId: string): Promise<InstallationTask[]> {
        return this.installationRepository.find({ where: { projectId }, order: { createdAt: 'ASC' } });
    }

    async updateInstallationProgress(id: string, progress: number, status: InstallationStatus): Promise<InstallationTask> {
        const task = await this.installationRepository.findOne({ where: { id } });
        if (!task) throw new NotFoundException('Task not found');
        task.progress = progress;
        task.status = status;
        return this.installationRepository.save(task);
    }

    // --- Daily Progress & Cleaning ---

    async createDailyReport(data: Partial<DailyInstallReport>): Promise<DailyInstallReport> {
        const report = this.dailyReportRepository.create(data);
        const saved = await this.dailyReportRepository.save(report);

        if (data.isClientNotified) {
            await this.notifyClientOfProgress(saved.id);
        }

        return saved;
    }

    async getDailyReports(projectId: string): Promise<DailyInstallReport[]> {
        return this.dailyReportRepository.find({
            where: { projectId },
            order: { reportDate: 'DESC' },
        });
    }

    async notifyClientOfProgress(reportId: string): Promise<void> {
        const report = await this.dailyReportRepository.findOne({
            where: { id: reportId },
            relations: ['project']
        });
        if (!report) throw new NotFoundException('Report not found');

        // Simulate notification (e.g., sending an email/portal update)
        console.log(`[SIMULATION] Sending daily digest to client ${report.project?.clientContactEmail} for project ${report.project?.name}`);

        report.isClientNotified = true;
        await this.dailyReportRepository.save(report);
    }

    // --- Team Assignment ---

    async getTeam(projectId: string): Promise<InstallationTeamAssignment[]> {
        return this.teamRepository.find({
            where: { projectId, isActive: true },
            order: { createdAt: 'ASC' },
        });
    }

    /**
     * Replace the active installation crew for a project with the supplied
     * members. Existing active members are soft-deactivated so the assignment
     * is idempotent and the latest call is authoritative.
     */
    async assignTeam(
        projectId: string,
        members: Array<{
            installerId?: string;
            installerName: string;
            role?: string;
            skills?: string[];
        }>,
        assignedBy?: string,
    ): Promise<InstallationTeamAssignment[]> {
        if (!Array.isArray(members) || members.length === 0) {
            throw new BadRequestException('At least one team member is required');
        }

        // Deactivate the current crew before recording the new assignment.
        await this.teamRepository.update(
            { projectId, isActive: true },
            { isActive: false },
        );

        const rows = members.map((m) =>
            this.teamRepository.create({
                projectId,
                installerId: m.installerId ?? undefined,
                installerName: m.installerName,
                role: m.role || 'member',
                skills: m.skills ?? undefined,
                assignedBy: assignedBy ?? undefined,
                isActive: true,
            }),
        );

        return this.teamRepository.save(rows);
    }

    // --- Handover Checklist ---

    /** Read the 8-step handover checklist for a project, seeding it on first access. */
    async getHandoverChecklist(projectId: string): Promise<HandoverChecklistStep[]> {
        const existing = await this.handoverRepository.find({
            where: { projectId },
            order: { stepNo: 'ASC' },
        });
        if (existing.length > 0) return existing;

        const seeded = STANDARD_HANDOVER_STEPS.map((s) =>
            this.handoverRepository.create({
                projectId,
                stepNo: s.stepNo,
                title: s.title,
                status: HandoverStepStatus.PENDING,
            }),
        );
        return this.handoverRepository.save(seeded);
    }

    /** Update a single handover-checklist step's status and/or notes. */
    async updateHandoverStep(
        id: string,
        data: { status?: HandoverStepStatus; notes?: string },
    ): Promise<HandoverChecklistStep> {
        const step = await this.handoverRepository.findOne({ where: { id } });
        if (!step) throw new NotFoundException('Handover checklist step not found');

        if (data.status !== undefined) {
            step.status = data.status;
            step.completedAt =
                data.status === HandoverStepStatus.COMPLETED ? new Date() : (null as any);
        }
        if (data.notes !== undefined) {
            step.notes = data.notes;
        }
        return this.handoverRepository.save(step);
    }

    // --- Read-only aggregate summaries (no new tables) ---

    /**
     * Progress summary aggregated over the project's installation tasks and
     * daily reports. Read-only — computed live from existing records.
     */
    async getProgressSummary(projectId: string) {
        const [tasks, reports] = await Promise.all([
            this.installationRepository.find({ where: { projectId } }),
            this.dailyReportRepository.find({
                where: { projectId },
                order: { reportDate: 'DESC' },
            }),
        ]);

        const totalTasks = tasks.length;
        const doneTasks = tasks.filter((t) => t.status === InstallationStatus.DONE).length;
        const inProgressTasks = tasks.filter((t) => t.status === InstallationStatus.IN_PROGRESS).length;
        const blockedTasks = tasks.filter((t) => t.status === InstallationStatus.BLOCKED).length;
        const todoTasks = tasks.filter((t) => t.status === InstallationStatus.TODO).length;

        // Overall progress: prefer the latest reported figure, else the mean of task progress.
        const latestReport = reports[0];
        const taskProgressAvg =
            totalTasks > 0
                ? tasks.reduce((sum, t) => sum + Number(t.progress || 0), 0) / totalTasks
                : 0;
        const overallProgress =
            latestReport && latestReport.overallProgress != null
                ? Number(latestReport.overallProgress)
                : Math.round(taskProgressAvg * 100) / 100;

        const photosUploaded = reports.reduce(
            (sum, r) => sum + (Array.isArray(r.progressPhotos) ? r.progressPhotos.length : 0),
            0,
        );
        const issuesLogged = reports.filter((r) => !!r.issuesEncountered).length;
        const siteCleaned = reports.some((r) => r.isSiteCleaned);

        const status =
            overallProgress >= 100
                ? 'complete'
                : overallProgress > 0
                    ? 'in_progress'
                    : 'review_pending';

        return {
            projectId,
            status,
            overallProgress,
            tasks: {
                total: totalTasks,
                done: doneTasks,
                inProgress: inProgressTasks,
                blocked: blockedTasks,
                todo: todoTasks,
            },
            dailyReviews: reports.length,
            photosUploaded,
            issuesLogged,
            siteCleaned,
            latestReportDate: latestReport?.reportDate ?? null,
            latestReportedBy: (latestReport as any)?.reportedBy ?? null,
            manpowerCount: latestReport?.manpowerCount ?? 0,
        };
    }

    /**
     * Management dashboard summary aggregated over tools, crew, readiness,
     * dispatch and daily reports. Read-only — computed live.
     */
    async getManagementSummary(projectId: string) {
        const [tools, team, readiness, crates, reports] = await Promise.all([
            this.toolRepository.find({ where: { projectId } }),
            this.teamRepository.find({ where: { projectId, isActive: true } }),
            this.readinessRepository.find({ where: { projectId } }),
            this.crateRepository.find({ where: { projectId } }),
            this.dailyReportRepository.find({
                where: { projectId },
                order: { reportDate: 'DESC' },
            }),
        ]);

        const dispatched = crates.some((c) => c.status === CrateStatus.DISPATCHED);
        const onSite = reports.length > 0;
        const teamAssigned = team.length > 0;
        const readinessReady =
            readiness.length > 0 && readiness.every((r) => r.status === ReadinessStatus.READY);

        const status = onSite
            ? 'on_site'
            : dispatched
                ? 'dispatched'
                : teamAssigned
                    ? 'team_assigned'
                    : tools.length > 0
                        ? 'tools_ready'
                        : 'planning';

        const teamLead = team.find((t) => (t.role || '').toLowerCase() === 'lead');

        return {
            projectId,
            status,
            tools: {
                total: tools.length,
                prepared: tools.length > 0,
                packed: crates.length > 0,
                dispatched,
            },
            crates: {
                total: crates.length,
                dispatched: crates.filter((c) => c.status === CrateStatus.DISPATCHED).length,
            },
            team: {
                assigned: teamAssigned,
                members: team.length,
                teamLead: teamLead?.installerName ?? team[0]?.installerName ?? null,
                notified: reports.some((r) => r.isClientNotified),
            },
            readiness: {
                total: readiness.length,
                ready: readiness.filter((r) => r.status === ReadinessStatus.READY).length,
                allReady: readinessReady,
            },
            scheduledDate: reports[reports.length - 1]?.reportDate ?? null,
        };
    }
}
