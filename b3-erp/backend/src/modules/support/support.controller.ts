import {
    Controller,
    Get,
    Post,
    Put,
    Patch,
    Param,
    Body,
    Query,
    HttpCode,
    HttpStatus,
    DefaultValuePipe,
    ParseIntPipe,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiQuery,
    ApiBearerAuth,
} from '@nestjs/swagger';
import { SupportManagementService } from './services/support-management.service';
import { KnowledgeBaseService } from './services/knowledge-base.service';
import { SLATrackingService } from './services/sla-tracking.service';
import { CSATService } from './services/csat.service';

@ApiTags('Support')
@ApiBearerAuth()
@Controller('support')
export class SupportController {
    constructor(
        private readonly supportService: SupportManagementService,
        private readonly knowledgeBaseService: KnowledgeBaseService,
        private readonly slaTrackingService: SLATrackingService,
        private readonly csatService: CSATService,
    ) { }

    // ─── Tickets ──────────────────────────────────────────────────────────────

    @Get('tickets')
    @ApiOperation({ summary: 'List support tickets with pagination and filters' })
    @ApiQuery({ name: 'companyId', required: true })
    @ApiQuery({ name: 'status', required: false })
    @ApiQuery({ name: 'priority', required: false })
    @ApiQuery({ name: 'channel', required: false })
    @ApiQuery({ name: 'search', required: false })
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    getTickets(
        @Query('companyId') companyId: string,
        @Query('status') status?: string,
        @Query('priority') priority?: string,
        @Query('channel') channel?: string,
        @Query('search') search?: string,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
        @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number = 20,
    ) {
        return this.supportService.getTickets({ companyId, status, priority, channel, search, page, limit });
    }

    @Get('tickets/:id')
    @ApiOperation({ summary: 'Get ticket details by ID' })
    @ApiParam({ name: 'id', description: 'Ticket UUID' })
    getTicket(@Param('id') id: string, @Query('companyId') companyId: string) {
        return this.supportService.getTicketById(id, companyId);
    }

    @Post('tickets')
    @ApiOperation({ summary: 'Create a new support ticket' })
    @ApiResponse({ status: 201, description: 'Ticket created' })
    createTicket(@Body() body: any) {
        return this.supportService.createTicket(body);
    }

    @Put('tickets/:id')
    @ApiOperation({ summary: 'Update a support ticket' })
    @ApiParam({ name: 'id', description: 'Ticket UUID' })
    updateTicket(@Param('id') id: string, @Body() body: any) {
        const { companyId, ...data } = body;
        return this.supportService.updateTicket(id, companyId, data);
    }

    @Patch('tickets/:id/assign')
    @ApiOperation({ summary: 'Assign ticket to an agent' })
    @ApiParam({ name: 'id', description: 'Ticket UUID' })
    assignTicket(
        @Param('id') id: string,
        @Body() body: { companyId: string; agentId: string },
    ) {
        return this.supportService.assignTicket(id, body.companyId, body.agentId);
    }

    @Post('tickets/:id/comments')
    @ApiOperation({ summary: 'Add a comment or reply to a ticket' })
    @ApiParam({ name: 'id', description: 'Ticket UUID' })
    addComment(
        @Param('id') ticketId: string,
        @Query('companyId') companyId: string,
        @Body() body: any,
    ) {
        return this.supportService.addTicketComment(ticketId, companyId, body);
    }

    @Get('tickets/:id/history')
    @ApiOperation({ summary: 'Get ticket change history' })
    @ApiParam({ name: 'id', description: 'Ticket UUID' })
    getTicketHistory(@Param('id') ticketId: string, @Query('companyId') companyId: string) {
        return this.supportService.getTicketHistory(ticketId, companyId);
    }

    // ─── Categories ───────────────────────────────────────────────────────────

    @Get('categories')
    @ApiOperation({ summary: 'List ticket categories' })
    getCategories(@Query('companyId') companyId: string) {
        return this.supportService.getTicketCategories(companyId);
    }

    @Post('categories')
    @ApiOperation({ summary: 'Create a ticket category' })
    createCategory(@Body() body: any) {
        return this.supportService.createTicketCategory(body);
    }

    // ─── Agents ───────────────────────────────────────────────────────────────

    @Get('agents')
    @ApiOperation({ summary: 'List support agents' })
    @ApiQuery({ name: 'companyId', required: true })
    @ApiQuery({ name: 'status', required: false })
    @ApiQuery({ name: 'teamId', required: false })
    getAgents(
        @Query('companyId') companyId: string,
        @Query('status') status?: string,
        @Query('teamId') teamId?: string,
    ) {
        return this.supportService.getSupportAgents({ companyId, status, teamId });
    }

    @Get('agents/:id')
    @ApiOperation({ summary: 'Get agent details' })
    @ApiParam({ name: 'id', description: 'Agent UUID' })
    getAgent(@Param('id') id: string, @Query('companyId') companyId: string) {
        return this.supportService.getAgentById(id, companyId);
    }

    @Post('agents')
    @ApiOperation({ summary: 'Create a support agent' })
    createAgent(@Body() body: any) {
        return this.supportService.createSupportAgent(body);
    }

    @Patch('agents/:id/status')
    @ApiOperation({ summary: 'Update agent availability status' })
    @ApiParam({ name: 'id', description: 'Agent UUID' })
    updateAgentStatus(
        @Param('id') id: string,
        @Body() body: { companyId: string; status: string },
    ) {
        return this.supportService.updateAgentStatus(id, body.companyId, body.status);
    }

    @Get('agents/performance')
    @ApiOperation({ summary: 'Get team performance statistics' })
    getTeamPerformance(@Query('companyId') companyId: string) {
        return this.supportService.getTeamPerformance(companyId);
    }

    // ─── SLA Management ───────────────────────────────────────────────────────

    @Get('sla/policies')
    @ApiOperation({ summary: 'List SLA policies' })
    getSLAPolicies(@Query('companyId') companyId: string) {
        return this.supportService.getSLAPolicies(companyId);
    }

    @Get('sla/policies/:id')
    @ApiOperation({ summary: 'Get SLA policy by ID' })
    getSLAPolicy(@Param('id') id: string, @Query('companyId') companyId: string) {
        return this.supportService.getSLAPolicyById(id, companyId);
    }

    @Post('sla/policies')
    @ApiOperation({ summary: 'Create an SLA policy' })
    createSLAPolicy(@Body() body: any) {
        return this.supportService.createSLAPolicy(body);
    }

    @Put('sla/policies/:id')
    @ApiOperation({ summary: 'Update an SLA policy' })
    updateSLAPolicy(@Param('id') id: string, @Body() body: any) {
        const { companyId, ...data } = body;
        return this.supportService.updateSLAPolicy(id, companyId, data);
    }

    @Get('sla/breaches')
    @ApiOperation({ summary: 'List SLA breaches' })
    getSLABreaches(
        @Query('companyId') companyId: string,
        @Query('breachType') breachType?: string,
        @Query('resolved') resolved?: boolean,
    ) {
        return this.supportService.getSLABreaches({ companyId, breachType, resolved });
    }

    @Get('sla/dashboard')
    @ApiOperation({ summary: 'SLA compliance dashboard metrics' })
    getSLADashboard(@Query('companyId') companyId: string) {
        return this.supportService.getSLADashboard(companyId);
    }

    // ─── IT Assets ────────────────────────────────────────────────────────────

    @Get('assets')
    @ApiOperation({ summary: 'List IT assets' })
    @ApiQuery({ name: 'companyId', required: true })
    @ApiQuery({ name: 'assetType', required: false })
    @ApiQuery({ name: 'status', required: false })
    @ApiQuery({ name: 'search', required: false })
    getAssets(
        @Query('companyId') companyId: string,
        @Query('assetType') assetType?: string,
        @Query('status') status?: string,
        @Query('search') search?: string,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
        @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number = 20,
    ) {
        return this.supportService.getITAssets({ companyId, assetType, status, search, page, limit });
    }

    @Get('assets/:id')
    @ApiOperation({ summary: 'Get IT asset details' })
    getAsset(@Param('id') id: string, @Query('companyId') companyId: string) {
        return this.supportService.getITAssetById(id, companyId);
    }

    @Post('assets')
    @ApiOperation({ summary: 'Register a new IT asset' })
    createAsset(@Body() body: any) {
        return this.supportService.createITAsset(body);
    }

    @Put('assets/:id')
    @ApiOperation({ summary: 'Update IT asset details' })
    updateAsset(@Param('id') id: string, @Body() body: any) {
        const { companyId, ...data } = body;
        return this.supportService.updateITAsset(id, companyId, data);
    }

    @Post('assets/maintenance')
    @ApiOperation({ summary: 'Create a maintenance record for an IT asset' })
    createMaintenanceRecord(@Body() body: any) {
        return this.supportService.createMaintenanceRecord(body);
    }

    // ─── Software Licenses ────────────────────────────────────────────────────

    @Get('licenses')
    @ApiOperation({ summary: 'List software licenses' })
    getLicenses(
        @Query('companyId') companyId: string,
        @Query('status') status?: string,
        @Query('licenseType') licenseType?: string,
        @Query('search') search?: string,
    ) {
        return this.supportService.getSoftwareLicenses({ companyId, status, licenseType, search });
    }

    @Post('licenses')
    @ApiOperation({ summary: 'Register a new software license' })
    createLicense(@Body() body: any) {
        return this.supportService.createSoftwareLicense(body);
    }

    // ─── Automation ───────────────────────────────────────────────────────────
    // NOTE: automation/rules list+get+create are served by the TypeORM-backed
    // SupportAutomationRuleController (@Controller('support/automation/rules')).
    // The old Prisma-based handlers here were removed (the Prisma model has no
    // backing table and 500'd).

    @Get('automation/escalation-rules')
    @ApiOperation({ summary: 'List escalation rules' })
    getEscalationRules(@Query('companyId') companyId: string) {
        return this.supportService.getEscalationRules(companyId);
    }

    @Post('automation/escalation-rules')
    @ApiOperation({ summary: 'Create an escalation rule' })
    createEscalationRule(@Body() body: any) {
        return this.supportService.createEscalationRule(body);
    }

    // ─── Canned Responses ─────────────────────────────────────────────────────

    @Get('canned-responses')
    @ApiOperation({ summary: 'List canned responses' })
    getCannedResponses(
        @Query('companyId') companyId: string,
        @Query('category') category?: string,
    ) {
        return this.supportService.getCannedResponses(companyId, category);
    }

    @Post('canned-responses')
    @ApiOperation({ summary: 'Create a canned response' })
    createCannedResponse(@Body() body: any) {
        return this.supportService.createCannedResponse(body);
    }

    // ─── Known Errors / ITIL ──────────────────────────────────────────────────

    @Get('known-errors')
    @ApiOperation({ summary: 'List known errors (ITIL)' })
    getKnownErrors(@Query('companyId') companyId: string) {
        return this.supportService.getKnownErrors(companyId);
    }

    @Post('known-errors')
    @ApiOperation({ summary: 'Create a known error record' })
    createKnownError(@Body() body: any) {
        return this.supportService.createKnownError(body);
    }
}
