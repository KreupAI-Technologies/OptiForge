import { Controller, Get, Post, Patch, Body, Param, Query, Headers } from '@nestjs/common';
import { InstallationChecklistService } from '../services/installation-checklist.service';
import { InstallationChecklistType } from '../entities/installation-checklist-item.entity';

/**
 * Per-check Installation Checklist subsystem. Backs the six
 * (modules)/installation/* checklist pages. Mirrors the handover checklist
 * controller (api/logistics-installation) transport style.
 *
 *   GET   /api/installation/checklists?projectId=&type=   -> seed-on-first-read list
 *   PATCH /api/installation/checklists/items/:id          -> persist one item
 *   POST  /api/installation/checklists/complete           -> mark complete
 */
@Controller('api/installation/checklists')
export class InstallationChecklistController {
    constructor(private readonly service: InstallationChecklistService) {}

    @Get()
    getChecklist(
        @Query('projectId') projectId: string,
        @Query('type') type: InstallationChecklistType,
        @Headers('x-company-id') companyId?: string,
    ) {
        return this.service.getChecklist(projectId, type, companyId);
    }

    @Patch('items/:id')
    updateItem(
        @Param('id') id: string,
        @Body() data: { status?: string; deviation?: number | null; notes?: string | null },
    ) {
        return this.service.updateItem(id, data);
    }

    @Post('complete')
    complete(
        @Body() data: { projectId: string; type: InstallationChecklistType },
        @Headers('x-company-id') companyId?: string,
    ) {
        return this.service.complete(data.projectId, data.type, companyId);
    }
}
