import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { CrmMastersService } from './crm-masters.service';

// Default company ID for development
const DEFAULT_COMPANY_ID = 'default-company-id';

@Controller('crm')
export class CrmMastersController {
    constructor(private readonly crmMastersService: CrmMastersService) { }

    // ===========================
    // CONTACTS
    // ===========================

    @Get('contacts')
    async findAllContacts(
        @Query('companyId') companyId?: string,
        @Query('search') search?: string,
        @Query('status') status?: string,
        @Query('department') department?: string,
        @Query('customerId') customerId?: string,
    ) {
        return this.crmMastersService.findAllContacts(
            companyId || DEFAULT_COMPANY_ID,
            { search, status, department, customerId }
        );
    }

    @Get('contacts/stats')
    async getContactStats(@Query('companyId') companyId?: string) {
        return this.crmMastersService.getContactStats(companyId || DEFAULT_COMPANY_ID);
    }

    @Get('contacts/:id')
    async findContactById(@Param('id') id: string) {
        return this.crmMastersService.findContactById(id);
    }

    @Post('contacts')
    @HttpCode(HttpStatus.CREATED)
    async createContact(@Body() data: any) {
        if (!data.companyId) data.companyId = DEFAULT_COMPANY_ID;
        return this.crmMastersService.createContact(data);
    }

    @Put('contacts/:id')
    async updateContact(@Param('id') id: string, @Body() data: any) {
        return this.crmMastersService.updateContact(id, data);
    }

    @Delete('contacts/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteContact(@Param('id') id: string) {
        return this.crmMastersService.deleteContact(id);
    }

    // ===========================
    // OPPORTUNITIES
    // ===========================

    @Get('opportunities')
    async findAllOpportunities(
        @Query('companyId') companyId?: string,
        @Query('search') search?: string,
        @Query('stage') stage?: string,
        @Query('ownerId') ownerId?: string,
        @Query('customerId') customerId?: string,
        @Query('campaignId') campaignId?: string,
    ) {
        return this.crmMastersService.findAllOpportunities(
            companyId || DEFAULT_COMPANY_ID,
            { search, stage, ownerId, customerId, campaignId }
        );
    }

    @Get('opportunities/stats')
    async getOpportunityStats(@Query('companyId') companyId?: string) {
        return this.crmMastersService.getOpportunityStats(companyId || DEFAULT_COMPANY_ID);
    }

    @Get('opportunities/forecast')
    async getOpportunityForecast(@Query('companyId') companyId?: string) {
        return this.crmMastersService.getOpportunityForecast(companyId || DEFAULT_COMPANY_ID);
    }

    @Get('opportunities/:id')
    async findOpportunityById(@Param('id') id: string) {
        return this.crmMastersService.findOpportunityById(id);
    }

    @Post('opportunities')
    @HttpCode(HttpStatus.CREATED)
    async createOpportunity(@Body() data: any) {
        if (!data.companyId) data.companyId = DEFAULT_COMPANY_ID;
        return this.crmMastersService.createOpportunity(data);
    }

    @Put('opportunities/:id')
    async updateOpportunity(@Param('id') id: string, @Body() data: any) {
        return this.crmMastersService.updateOpportunity(id, data);
    }

    @Delete('opportunities/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteOpportunity(@Param('id') id: string) {
        return this.crmMastersService.deleteOpportunity(id);
    }

    // ===========================
    // ACTIVITIES
    // ===========================

    @Get('activities')
    async findAllActivities(
        @Query('companyId') companyId?: string,
        @Query('search') search?: string,
        @Query('type') type?: string,
        @Query('status') status?: string,
        @Query('assignedToId') assignedToId?: string,
        @Query('leadId') leadId?: string,
        @Query('contactId') contactId?: string,
        @Query('opportunityId') opportunityId?: string,
    ) {
        return this.crmMastersService.findAllActivities(
            companyId || DEFAULT_COMPANY_ID,
            { search, type, status, assignedToId, leadId, contactId, opportunityId }
        );
    }

    @Get('activities/stats')
    async getActivityStats(@Query('companyId') companyId?: string) {
        return this.crmMastersService.getActivityStats(companyId || DEFAULT_COMPANY_ID);
    }

    @Get('activities/:id')
    async findActivityById(@Param('id') id: string) {
        return this.crmMastersService.findActivityById(id);
    }

    @Post('activities')
    @HttpCode(HttpStatus.CREATED)
    async createActivity(@Body() data: any) {
        if (!data.companyId) data.companyId = DEFAULT_COMPANY_ID;
        return this.crmMastersService.createActivity(data);
    }

    @Put('activities/:id')
    async updateActivity(@Param('id') id: string, @Body() data: any) {
        return this.crmMastersService.updateActivity(id, data);
    }

    @Post('activities/:id/complete')
    async completeActivity(@Param('id') id: string) {
        return this.crmMastersService.completeActivity(id);
    }

    @Delete('activities/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteActivity(@Param('id') id: string) {
        return this.crmMastersService.deleteActivity(id);
    }

    // ===========================
    // CAMPAIGNS
    // ===========================

    @Get('campaigns')
    async findAllCampaigns(
        @Query('companyId') companyId?: string,
        @Query('search') search?: string,
        @Query('type') type?: string,
        @Query('status') status?: string,
        @Query('assignedToId') assignedToId?: string,
    ) {
        return this.crmMastersService.findAllCampaigns(
            companyId || DEFAULT_COMPANY_ID,
            { search, type, status, assignedToId }
        );
    }

    @Get('campaigns/stats')
    async getCampaignStats(@Query('companyId') companyId?: string) {
        return this.crmMastersService.getCampaignStats(companyId || DEFAULT_COMPANY_ID);
    }

    @Get('campaigns/:id')
    async findCampaignById(@Param('id') id: string) {
        return this.crmMastersService.findCampaignById(id);
    }

    @Post('campaigns')
    @HttpCode(HttpStatus.CREATED)
    async createCampaign(@Body() data: any) {
        if (!data.companyId) data.companyId = DEFAULT_COMPANY_ID;
        return this.crmMastersService.createCampaign(data);
    }

    @Put('campaigns/:id')
    async updateCampaign(@Param('id') id: string, @Body() data: any) {
        return this.crmMastersService.updateCampaign(id, data);
    }

    @Delete('campaigns/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteCampaign(@Param('id') id: string) {
        return this.crmMastersService.deleteCampaign(id);
    }

    // ===========================
    // QUOTES
    // ===========================

    @Get('quotes')
    async findAllQuotes(
        @Query('companyId') companyId?: string,
        @Query('search') search?: string,
        @Query('status') status?: string,
        @Query('customerId') customerId?: string,
        @Query('opportunityId') opportunityId?: string,
    ) {
        return this.crmMastersService.findAllQuotes(
            companyId || DEFAULT_COMPANY_ID,
            { search, status, customerId, opportunityId }
        );
    }

    @Get('quotes/:id')
    async findQuoteById(@Param('id') id: string) {
        return this.crmMastersService.findQuoteById(id);
    }

    @Post('quotes')
    @HttpCode(HttpStatus.CREATED)
    async createQuote(@Body() data: any) {
        if (!data.companyId) data.companyId = DEFAULT_COMPANY_ID;
        return this.crmMastersService.createQuote(data);
    }

    @Put('quotes/:id')
    async updateQuote(@Param('id') id: string, @Body() data: any) {
        return this.crmMastersService.updateQuote(id, data);
    }

    @Post('quotes/:id/send')
    async sendQuote(@Param('id') id: string) {
        return this.crmMastersService.sendQuote(id);
    }

    @Post('quotes/:id/accept')
    async acceptQuote(@Param('id') id: string) {
        return this.crmMastersService.acceptQuote(id);
    }

    @Post('quotes/:id/reject')
    async rejectQuote(@Param('id') id: string) {
        return this.crmMastersService.rejectQuote(id);
    }

    @Delete('quotes/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteQuote(@Param('id') id: string) {
        return this.crmMastersService.deleteQuote(id);
    }

    // ===========================
    // CONTRACTS
    // ===========================

    @Get('contracts')
    async findAllContracts(
        @Query('companyId') companyId?: string,
        @Query('search') search?: string,
        @Query('status') status?: string,
        @Query('type') type?: string,
        @Query('customerId') customerId?: string,
    ) {
        return this.crmMastersService.findAllContracts(
            companyId || DEFAULT_COMPANY_ID,
            { search, status, type, customerId }
        );
    }

    @Get('contracts/:id')
    async findContractById(@Param('id') id: string) {
        return this.crmMastersService.findContractById(id);
    }

    @Post('contracts')
    @HttpCode(HttpStatus.CREATED)
    async createContract(@Body() data: any) {
        if (!data.companyId) data.companyId = DEFAULT_COMPANY_ID;
        return this.crmMastersService.createContract(data);
    }

    @Put('contracts/:id')
    async updateContract(@Param('id') id: string, @Body() data: any) {
        return this.crmMastersService.updateContract(id, data);
    }

    @Post('contracts/:id/activate')
    async activateContract(@Param('id') id: string) {
        return this.crmMastersService.activateContract(id);
    }

    @Delete('contracts/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteContract(@Param('id') id: string) {
        return this.crmMastersService.deleteContract(id);
    }

    // ===========================
    // SUPPORT TICKETS
    // ===========================

    @Get('tickets')
    async findAllTickets(
        @Query('companyId') companyId?: string,
        @Query('search') search?: string,
        @Query('status') status?: string,
        @Query('priority') priority?: string,
        @Query('type') type?: string,
        @Query('assignedToId') assignedToId?: string,
        @Query('customerId') customerId?: string,
    ) {
        return this.crmMastersService.findAllTickets(
            companyId || DEFAULT_COMPANY_ID,
            { search, status, priority, type, assignedToId, customerId }
        );
    }

    @Get('tickets/stats')
    async getTicketStats(@Query('companyId') companyId?: string) {
        return this.crmMastersService.getTicketStats(companyId || DEFAULT_COMPANY_ID);
    }

    @Get('tickets/:id')
    async findTicketById(@Param('id') id: string) {
        return this.crmMastersService.findTicketById(id);
    }

    @Post('tickets')
    @HttpCode(HttpStatus.CREATED)
    async createTicket(@Body() data: any) {
        if (!data.companyId) data.companyId = DEFAULT_COMPANY_ID;
        return this.crmMastersService.createTicket(data);
    }

    @Put('tickets/:id')
    async updateTicket(@Param('id') id: string, @Body() data: any) {
        return this.crmMastersService.updateTicket(id, data);
    }

    @Post('tickets/:id/resolve')
    async resolveTicket(@Param('id') id: string, @Body() data: { resolution: string }) {
        return this.crmMastersService.resolveTicket(id, data.resolution);
    }

    @Post('tickets/:id/close')
    async closeTicket(@Param('id') id: string) {
        return this.crmMastersService.closeTicket(id);
    }

    // ===========================
    // SLA
    // ===========================

    @Get('slas')
    async findAllSlas(@Query('companyId') companyId?: string) {
        return this.crmMastersService.findAllSlas(companyId || DEFAULT_COMPANY_ID);
    }

    @Get('slas/performance')
    async getSlaPerformance(@Query('companyId') companyId?: string) {
        return this.crmMastersService.getSlaPerformance(companyId || DEFAULT_COMPANY_ID);
    }

    @Get('slas/:id')
    async findSlaById(@Param('id') id: string) {
        return this.crmMastersService.findSlaById(id);
    }

    @Post('slas')
    @HttpCode(HttpStatus.CREATED)
    async createSla(@Body() data: any) {
        if (!data.companyId) data.companyId = DEFAULT_COMPANY_ID;
        return this.crmMastersService.createSla(data);
    }

    @Put('slas/:id')
    async updateSla(@Param('id') id: string, @Body() data: any) {
        return this.crmMastersService.updateSla(id, data);
    }

    @Delete('slas/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteSla(@Param('id') id: string) {
        return this.crmMastersService.deleteSla(id);
    }

    // ===========================
    // KNOWLEDGE ARTICLES
    // ===========================

    @Get('knowledge-articles')
    async findAllKnowledgeArticles(
        @Query('companyId') companyId?: string,
        @Query('search') search?: string,
        @Query('status') status?: string,
        @Query('category') category?: string,
        @Query('isPublic') isPublic?: string,
    ) {
        return this.crmMastersService.findAllKnowledgeArticles(
            companyId || DEFAULT_COMPANY_ID,
            { search, status, category, isPublic: isPublic === 'true' }
        );
    }

    @Get('knowledge-articles/:id')
    async findKnowledgeArticleById(@Param('id') id: string) {
        await this.crmMastersService.incrementArticleViewCount(id);
        return this.crmMastersService.findKnowledgeArticleById(id);
    }

    @Post('knowledge-articles')
    @HttpCode(HttpStatus.CREATED)
    async createKnowledgeArticle(@Body() data: any) {
        if (!data.companyId) data.companyId = DEFAULT_COMPANY_ID;
        return this.crmMastersService.createKnowledgeArticle(data);
    }

    @Put('knowledge-articles/:id')
    async updateKnowledgeArticle(@Param('id') id: string, @Body() data: any) {
        return this.crmMastersService.updateKnowledgeArticle(id, data);
    }

    @Post('knowledge-articles/:id/publish')
    async publishKnowledgeArticle(@Param('id') id: string) {
        return this.crmMastersService.publishKnowledgeArticle(id);
    }

    @Post('knowledge-articles/:id/helpful')
    async markArticleHelpful(@Param('id') id: string, @Body() data: { helpful: boolean }) {
        return this.crmMastersService.markArticleHelpful(id, data.helpful);
    }

    // ===========================
    // INTERACTIONS (Prisma-based)
    // ===========================

    @Get('interactions-v2')
    async findAllInteractions(
        @Query('companyId') companyId?: string,
        @Query('type') type?: string,
        @Query('leadId') leadId?: string,
        @Query('contactId') contactId?: string,
        @Query('customerId') customerId?: string,
        @Query('opportunityId') opportunityId?: string,
    ) {
        return this.crmMastersService.findAllInteractions(
            companyId || DEFAULT_COMPANY_ID,
            { type, leadId, contactId, customerId, opportunityId }
        );
    }

    @Get('interactions-v2/stats')
    async getInteractionStats(@Query('companyId') companyId?: string) {
        return this.crmMastersService.getInteractionStats(companyId || DEFAULT_COMPANY_ID);
    }

    @Post('interactions-v2')
    @HttpCode(HttpStatus.CREATED)
    async createInteraction(@Body() data: any) {
        if (!data.companyId) data.companyId = DEFAULT_COMPANY_ID;
        return this.crmMastersService.createInteraction(data);
    }

    @Put('interactions-v2/:id')
    async updateInteraction(@Param('id') id: string, @Body() data: any) {
        return this.crmMastersService.updateInteraction(id, data);
    }

    @Delete('interactions-v2/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteInteraction(@Param('id') id: string) {
        return this.crmMastersService.deleteInteraction(id);
    }

    // ===========================
    // SALES TERRITORIES
    // ===========================

    @Get('sales-territories')
    async findAllSalesTerritories(@Query('companyId') companyId?: string) {
        return this.crmMastersService.findAllSalesTerritories(companyId || DEFAULT_COMPANY_ID);
    }

    @Get('sales-territories/:id')
    async findSalesTerritoryById(@Param('id') id: string) {
        return this.crmMastersService.findSalesTerritoryById(id);
    }

    @Post('sales-territories')
    @HttpCode(HttpStatus.CREATED)
    async createSalesTerritory(@Body() data: any) {
        if (!data.companyId) data.companyId = DEFAULT_COMPANY_ID;
        return this.crmMastersService.createSalesTerritory(data);
    }

    @Put('sales-territories/:id')
    async updateSalesTerritory(@Param('id') id: string, @Body() data: any) {
        return this.crmMastersService.updateSalesTerritory(id, data);
    }

    @Delete('sales-territories/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteSalesTerritory(@Param('id') id: string) {
        return this.crmMastersService.deleteSalesTerritory(id);
    }

    // ===========================
    // PIPELINE STAGES
    // ===========================

    @Get('pipeline-stages')
    async findAllPipelineStages(
        @Query('companyId') companyId?: string,
        @Query('stageType') stageType?: string,
    ) {
        return this.crmMastersService.findAllPipelineStages(companyId || DEFAULT_COMPANY_ID, stageType);
    }

    @Post('pipeline-stages')
    @HttpCode(HttpStatus.CREATED)
    async createPipelineStage(@Body() data: any) {
        if (!data.companyId) data.companyId = DEFAULT_COMPANY_ID;
        return this.crmMastersService.createPipelineStage(data);
    }

    @Put('pipeline-stages/:id')
    async updatePipelineStage(@Param('id') id: string, @Body() data: any) {
        return this.crmMastersService.updatePipelineStage(id, data);
    }

    @Delete('pipeline-stages/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deletePipelineStage(@Param('id') id: string) {
        return this.crmMastersService.deletePipelineStage(id);
    }

    // ===========================
    // LEAD STATUSES
    // ===========================

    @Get('lead-statuses')
    async findAllLeadStatuses(@Query('companyId') companyId?: string) {
        return this.crmMastersService.findAllLeadStatuses(companyId || DEFAULT_COMPANY_ID);
    }

    @Post('lead-statuses')
    @HttpCode(HttpStatus.CREATED)
    async createLeadStatus(@Body() data: any) {
        if (!data.companyId) data.companyId = DEFAULT_COMPANY_ID;
        return this.crmMastersService.createLeadStatus(data);
    }

    @Put('lead-statuses/:id')
    async updateLeadStatus(@Param('id') id: string, @Body() data: any) {
        return this.crmMastersService.updateLeadStatus(id, data);
    }

    @Delete('lead-statuses/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteLeadStatus(@Param('id') id: string) {
        return this.crmMastersService.deleteLeadStatus(id);
    }

    // ===========================
    // LEAD SOURCES
    // ===========================

    @Get('lead-sources')
    async findAllLeadSources(@Query('companyId') companyId?: string) {
        return this.crmMastersService.findAllLeadSources(companyId || DEFAULT_COMPANY_ID);
    }

    @Post('lead-sources')
    @HttpCode(HttpStatus.CREATED)
    async createLeadSource(@Body() data: any) {
        if (!data.companyId) data.companyId = DEFAULT_COMPANY_ID;
        return this.crmMastersService.createLeadSource(data);
    }

    @Put('lead-sources/:id')
    async updateLeadSource(@Param('id') id: string, @Body() data: any) {
        return this.crmMastersService.updateLeadSource(id, data);
    }

    @Delete('lead-sources/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteLeadSource(@Param('id') id: string) {
        return this.crmMastersService.deleteLeadSource(id);
    }
}
