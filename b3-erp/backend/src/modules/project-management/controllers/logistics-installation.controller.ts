import { Controller, Get, Post, Patch, Body, Param } from '@nestjs/common';
import { LogisticsInstallationService } from '../services/logistics-installation.service';
import { HandoverStepStatus } from '../entities/handover-checklist-step.entity';

@Controller('api/logistics-installation')
export class LogisticsInstallationController {
    constructor(private readonly service: LogisticsInstallationService) { }

    @Get('readiness/:projectId')
    getReadiness(@Param('projectId') projectId: string) {
        return this.service.getReadiness(projectId);
    }

    @Patch('readiness/:id')
    updateReadiness(@Param('id') id: string, @Body() data: { status: any; verifiedBy: string }) {
        return this.service.updateReadiness(id, data.status, data.verifiedBy);
    }

    @Post('dispatch')
    createDispatch(@Body() data: any) {
        return this.service.createDispatch(data);
    }

    @Get('tasks/:projectId')
    getTasks(@Param('projectId') projectId: string) {
        return this.service.getInstallerTasks(projectId);
    }

    @Patch('task/:id')
    updateTask(@Param('id') id: string, @Body() data: { progress: number; status: any }) {
        return this.service.updateInstallationProgress(id, data.progress, data.status);
    }

    @Post('daily-report')
    createDailyReport(@Body() data: any) {
        return this.service.createDailyReport(data);
    }

    @Get('daily-reports/:projectId')
    getDailyReports(@Param('projectId') projectId: string) {
        return this.service.getDailyReports(projectId);
    }

    @Post('notify-client/:reportId')
    notifyClient(@Param('reportId') reportId: string) {
        return this.service.notifyClientOfProgress(reportId);
    }

    // --- Team Assignment ---

    @Get('team/:projectId')
    getTeam(@Param('projectId') projectId: string) {
        return this.service.getTeam(projectId);
    }

    @Post('assign-team/:projectId')
    assignTeam(
        @Param('projectId') projectId: string,
        @Body()
        data: {
            members: Array<{
                installerId?: string;
                installerName: string;
                role?: string;
                skills?: string[];
            }>;
            assignedBy?: string;
        },
    ) {
        return this.service.assignTeam(projectId, data.members, data.assignedBy);
    }

    // --- Handover Checklist ---

    @Get('handover-checklist/:projectId')
    getHandoverChecklist(@Param('projectId') projectId: string) {
        return this.service.getHandoverChecklist(projectId);
    }

    @Patch('handover-checklist/step/:id')
    updateHandoverStep(
        @Param('id') id: string,
        @Body() data: { status?: HandoverStepStatus; notes?: string },
    ) {
        return this.service.updateHandoverStep(id, data);
    }

    // --- Read-only aggregate summaries ---

    @Get('progress-summary/:projectId')
    getProgressSummary(@Param('projectId') projectId: string) {
        return this.service.getProgressSummary(projectId);
    }

    @Get('management-summary/:projectId')
    getManagementSummary(@Param('projectId') projectId: string) {
        return this.service.getManagementSummary(projectId);
    }
}
