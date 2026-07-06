import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CrmMastersService {
    constructor(private prisma: PrismaService) { }

    // ===========================
    // GENERIC HELPER METHODS
    // ===========================

    private async findByIdOrThrow<T>(model: any, id: string, modelName: string): Promise<T> {
        const record = await model.findUnique({ where: { id } });
        if (!record) {
            throw new NotFoundException(`${modelName} with id ${id} not found`);
        }
        return record;
    }

    private generateNumber(prefix: string, counter: number): string {
        const year = new Date().getFullYear();
        return `${prefix}-${year}-${String(counter).padStart(5, '0')}`;
    }

    // ===========================
    // CONTACTS
    // ===========================

    async findAllContacts(companyId: string, filters?: {
        search?: string;
        status?: string;
        department?: string;
        customerId?: string;
    }) {
        const where: any = { companyId, isActive: true };

        if (filters?.status) where.status = filters.status;
        if (filters?.department) where.department = filters.department;
        if (filters?.customerId) where.customerId = filters.customerId;
        if (filters?.search) {
            where.OR = [
                { firstName: { contains: filters.search, mode: 'insensitive' } },
                { lastName: { contains: filters.search, mode: 'insensitive' } },
                { email: { contains: filters.search, mode: 'insensitive' } },
                { customerName: { contains: filters.search, mode: 'insensitive' } },
            ];
        }

        return this.prisma.crmContact.findMany({
            where,
            include: {
                activities: { take: 5, orderBy: { createdAt: 'desc' } },
                opportunities: { take: 5, orderBy: { createdAt: 'desc' } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findContactById(id: string) {
        return this.findByIdOrThrow(this.prisma.crmContact, id, 'Contact');
    }

    async createContact(data: any) {
        return this.prisma.crmContact.create({ data });
    }

    async updateContact(id: string, data: any) {
        await this.findByIdOrThrow(this.prisma.crmContact, id, 'Contact');
        return this.prisma.crmContact.update({ where: { id }, data });
    }

    async deleteContact(id: string) {
        await this.findByIdOrThrow(this.prisma.crmContact, id, 'Contact');
        return this.prisma.crmContact.update({
            where: { id },
            data: { isActive: false },
        });
    }

    async getContactStats(companyId: string) {
        const contacts = await this.prisma.crmContact.findMany({
            where: { companyId, isActive: true },
        });

        const byStatus: Record<string, number> = {};
        const byDepartment: Record<string, number> = {};
        let totalValue = 0;

        contacts.forEach(contact => {
            byStatus[contact.status] = (byStatus[contact.status] || 0) + 1;
            if (contact.department) {
                byDepartment[contact.department] = (byDepartment[contact.department] || 0) + 1;
            }
            totalValue += contact.value || 0;
        });

        return {
            total: contacts.length,
            byStatus,
            byDepartment,
            totalValue,
            vipCount: byStatus['vip'] || 0,
            activeCount: byStatus['active'] || 0,
        };
    }

    // ===========================
    // OPPORTUNITIES
    // ===========================

    async findAllOpportunities(companyId: string, filters?: {
        search?: string;
        stage?: string;
        ownerId?: string;
        customerId?: string;
        campaignId?: string;
    }) {
        const where: any = { companyId, isActive: true };

        if (filters?.stage) where.stage = filters.stage;
        if (filters?.ownerId) where.ownerId = filters.ownerId;
        if (filters?.customerId) where.customerId = filters.customerId;
        if (filters?.campaignId) where.campaignId = filters.campaignId;
        if (filters?.search) {
            where.OR = [
                { name: { contains: filters.search, mode: 'insensitive' } },
                { customerName: { contains: filters.search, mode: 'insensitive' } },
                { opportunityNumber: { contains: filters.search, mode: 'insensitive' } },
            ];
        }

        return this.prisma.crmOpportunity.findMany({
            where,
            include: {
                contact: true,
                campaign: true,
                activities: { take: 3, orderBy: { createdAt: 'desc' } },
                quotes: { take: 3, orderBy: { createdAt: 'desc' } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOpportunityById(id: string) {
        return this.prisma.crmOpportunity.findUnique({
            where: { id },
            include: {
                contact: true,
                campaign: true,
                activities: { orderBy: { createdAt: 'desc' } },
                quotes: { orderBy: { createdAt: 'desc' } },
                contracts: { orderBy: { createdAt: 'desc' } },
            },
        });
    }

    async createOpportunity(data: any) {
        const count = await this.prisma.crmOpportunity.count({ where: { companyId: data.companyId } });
        const opportunityNumber = this.generateNumber('OPP', count + 1);

        return this.prisma.crmOpportunity.create({
            data: {
                ...data,
                opportunityNumber,
            },
        });
    }

    async updateOpportunity(id: string, data: any) {
        await this.findByIdOrThrow(this.prisma.crmOpportunity, id, 'Opportunity');
        return this.prisma.crmOpportunity.update({ where: { id }, data });
    }

    async deleteOpportunity(id: string) {
        await this.findByIdOrThrow(this.prisma.crmOpportunity, id, 'Opportunity');
        return this.prisma.crmOpportunity.update({
            where: { id },
            data: { isActive: false },
        });
    }

    async getOpportunityStats(companyId: string) {
        const opportunities = await this.prisma.crmOpportunity.findMany({
            where: { companyId, isActive: true },
        });

        const byStage: Record<string, number> = {};
        const byOwner: Record<string, number> = {};
        let totalPipeline = 0;
        let wonValue = 0;

        opportunities.forEach(opp => {
            byStage[opp.stage] = (byStage[opp.stage] || 0) + 1;
            if (opp.ownerName) {
                byOwner[opp.ownerName] = (byOwner[opp.ownerName] || 0) + 1;
            }
            if (!['closed_won', 'closed_lost'].includes(opp.stage)) {
                totalPipeline += opp.amount || 0;
            }
            if (opp.stage === 'closed_won') {
                wonValue += opp.amount || 0;
            }
        });

        return {
            total: opportunities.length,
            openCount: opportunities.filter(o => !['closed_won', 'closed_lost'].includes(o.stage)).length,
            wonCount: byStage['closed_won'] || 0,
            lostCount: byStage['closed_lost'] || 0,
            byStage,
            byOwner,
            totalPipeline,
            wonValue,
        };
    }

    async getOpportunityForecast(companyId: string) {
        const opportunities = await this.prisma.crmOpportunity.findMany({
            where: {
                companyId,
                isActive: true,
                stage: { notIn: ['closed_won', 'closed_lost'] },
            },
        });

        const forecast = opportunities.reduce((sum, opp) => {
            return sum + (opp.amount * (opp.probability / 100));
        }, 0);

        return {
            totalOpportunities: opportunities.length,
            totalPipeline: opportunities.reduce((sum, o) => sum + o.amount, 0),
            weightedForecast: forecast,
        };
    }

    // ===========================
    // ACTIVITIES
    // ===========================

    async findAllActivities(companyId: string, filters?: {
        search?: string;
        type?: string;
        status?: string;
        assignedToId?: string;
        leadId?: string;
        contactId?: string;
        opportunityId?: string;
    }) {
        const where: any = { companyId, isActive: true };

        if (filters?.type) where.type = filters.type;
        if (filters?.status) where.status = filters.status;
        if (filters?.assignedToId) where.assignedToId = filters.assignedToId;
        if (filters?.leadId) where.leadId = filters.leadId;
        if (filters?.contactId) where.contactId = filters.contactId;
        if (filters?.opportunityId) where.opportunityId = filters.opportunityId;
        if (filters?.search) {
            where.OR = [
                { subject: { contains: filters.search, mode: 'insensitive' } },
                { description: { contains: filters.search, mode: 'insensitive' } },
            ];
        }

        return this.prisma.crmActivity.findMany({
            where,
            include: {
                contact: true,
                opportunity: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findActivityById(id: string) {
        return this.findByIdOrThrow(this.prisma.crmActivity, id, 'Activity');
    }

    async createActivity(data: any) {
        return this.prisma.crmActivity.create({ data });
    }

    async updateActivity(id: string, data: any) {
        await this.findByIdOrThrow(this.prisma.crmActivity, id, 'Activity');
        return this.prisma.crmActivity.update({ where: { id }, data });
    }

    async deleteActivity(id: string) {
        await this.findByIdOrThrow(this.prisma.crmActivity, id, 'Activity');
        return this.prisma.crmActivity.update({
            where: { id },
            data: { isActive: false },
        });
    }

    async completeActivity(id: string) {
        await this.findByIdOrThrow(this.prisma.crmActivity, id, 'Activity');
        return this.prisma.crmActivity.update({
            where: { id },
            data: {
                status: 'completed',
                completedDate: new Date(),
            },
        });
    }

    async getActivityStats(companyId: string) {
        const activities = await this.prisma.crmActivity.findMany({
            where: { companyId, isActive: true },
        });

        const byType: Record<string, number> = {};
        const byStatus: Record<string, number> = {};

        activities.forEach(activity => {
            byType[activity.type] = (byType[activity.type] || 0) + 1;
            byStatus[activity.status] = (byStatus[activity.status] || 0) + 1;
        });

        const overdue = activities.filter(a =>
            a.dueDate && new Date(a.dueDate) < new Date() && a.status !== 'completed'
        ).length;

        return {
            total: activities.length,
            byType,
            byStatus,
            pendingCount: byStatus['pending'] || 0,
            completedCount: byStatus['completed'] || 0,
            overdueCount: overdue,
        };
    }

    // ===========================
    // CAMPAIGNS
    // ===========================

    async findAllCampaigns(companyId: string, filters?: {
        search?: string;
        type?: string;
        status?: string;
        assignedToId?: string;
    }) {
        const where: any = { companyId, isActive: true };

        if (filters?.type) where.type = filters.type;
        if (filters?.status) where.status = filters.status;
        if (filters?.assignedToId) where.assignedToId = filters.assignedToId;
        if (filters?.search) {
            where.OR = [
                { name: { contains: filters.search, mode: 'insensitive' } },
                { campaignNumber: { contains: filters.search, mode: 'insensitive' } },
                { description: { contains: filters.search, mode: 'insensitive' } },
            ];
        }

        return this.prisma.crmCampaign.findMany({
            where,
            include: {
                opportunities: { take: 5 },
                parentCampaign: true,
                childCampaigns: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findCampaignById(id: string) {
        return this.prisma.crmCampaign.findUnique({
            where: { id },
            include: {
                opportunities: true,
                parentCampaign: true,
                childCampaigns: true,
            },
        });
    }

    async createCampaign(data: any) {
        const count = await this.prisma.crmCampaign.count({ where: { companyId: data.companyId } });
        const campaignNumber = this.generateNumber('CMP', count + 1);

        return this.prisma.crmCampaign.create({
            data: {
                ...data,
                campaignNumber,
            },
        });
    }

    async updateCampaign(id: string, data: any) {
        await this.findByIdOrThrow(this.prisma.crmCampaign, id, 'Campaign');
        return this.prisma.crmCampaign.update({ where: { id }, data });
    }

    async deleteCampaign(id: string) {
        await this.findByIdOrThrow(this.prisma.crmCampaign, id, 'Campaign');
        return this.prisma.crmCampaign.update({
            where: { id },
            data: { isActive: false },
        });
    }

    async getCampaignStats(companyId: string) {
        const campaigns = await this.prisma.crmCampaign.findMany({
            where: { companyId, isActive: true },
        });

        let totalBudget = 0;
        let totalSpent = 0;
        let totalRevenue = 0;
        let totalLeads = 0;
        let totalConversions = 0;

        const byType: Record<string, number> = {};
        const byStatus: Record<string, number> = {};

        campaigns.forEach(campaign => {
            totalBudget += campaign.budget || 0;
            totalSpent += campaign.actualCost || 0;
            totalRevenue += campaign.actualRevenue || 0;
            totalLeads += campaign.totalLeads || 0;
            totalConversions += campaign.convertedLeads || 0;

            byType[campaign.type] = (byType[campaign.type] || 0) + 1;
            byStatus[campaign.status] = (byStatus[campaign.status] || 0) + 1;
        });

        const overallROI = totalSpent > 0 ? ((totalRevenue - totalSpent) / totalSpent) * 100 : 0;

        return {
            total: campaigns.length,
            activeCount: byStatus['Active'] || 0,
            byType,
            byStatus,
            totalBudget,
            totalSpent,
            totalRevenue,
            overallROI,
            totalLeads,
            totalConversions,
        };
    }

    // ===========================
    // QUOTES
    // ===========================

    async findAllQuotes(companyId: string, filters?: {
        search?: string;
        status?: string;
        customerId?: string;
        opportunityId?: string;
    }) {
        const where: any = { companyId, isActive: true };

        if (filters?.status) where.status = filters.status;
        if (filters?.customerId) where.customerId = filters.customerId;
        if (filters?.opportunityId) where.opportunityId = filters.opportunityId;
        if (filters?.search) {
            where.OR = [
                { title: { contains: filters.search, mode: 'insensitive' } },
                { quoteNumber: { contains: filters.search, mode: 'insensitive' } },
                { customerName: { contains: filters.search, mode: 'insensitive' } },
            ];
        }

        try {
            return await this.prisma.crmQuote.findMany({
                where,
                include: {
                    opportunity: true,
                    contracts: { take: 3 },
                },
                orderBy: { createdAt: 'desc' },
            });
        } catch (err: any) {
            // P2021: the underlying table does not exist in the current DB.
            // Return an empty list so the endpoint stays resilient (200) instead of 500.
            if (err?.code === 'P2021') {
                return [];
            }
            throw err;
        }
    }

    async findQuoteById(id: string) {
        return this.prisma.crmQuote.findUnique({
            where: { id },
            include: {
                opportunity: true,
                contracts: true,
            },
        });
    }

    async createQuote(data: any) {
        const count = await this.prisma.crmQuote.count({ where: { companyId: data.companyId } });
        const quoteNumber = this.generateNumber('QT', count + 1);

        return this.prisma.crmQuote.create({
            data: {
                ...data,
                quoteNumber,
            },
        });
    }

    async updateQuote(id: string, data: any) {
        await this.findByIdOrThrow(this.prisma.crmQuote, id, 'Quote');
        return this.prisma.crmQuote.update({ where: { id }, data });
    }

    async deleteQuote(id: string) {
        await this.findByIdOrThrow(this.prisma.crmQuote, id, 'Quote');
        return this.prisma.crmQuote.update({
            where: { id },
            data: { isActive: false },
        });
    }

    async sendQuote(id: string) {
        await this.findByIdOrThrow(this.prisma.crmQuote, id, 'Quote');
        return this.prisma.crmQuote.update({
            where: { id },
            data: {
                status: 'sent',
                sentDate: new Date(),
            },
        });
    }

    async acceptQuote(id: string) {
        await this.findByIdOrThrow(this.prisma.crmQuote, id, 'Quote');
        return this.prisma.crmQuote.update({
            where: { id },
            data: {
                status: 'accepted',
                acceptedDate: new Date(),
            },
        });
    }

    async rejectQuote(id: string) {
        await this.findByIdOrThrow(this.prisma.crmQuote, id, 'Quote');
        return this.prisma.crmQuote.update({
            where: { id },
            data: {
                status: 'rejected',
                rejectedDate: new Date(),
            },
        });
    }

    // ===========================
    // CONTRACTS
    // ===========================

    async findAllContracts(companyId: string, filters?: {
        search?: string;
        status?: string;
        type?: string;
        customerId?: string;
    }) {
        const where: any = { companyId, isActive: true };

        if (filters?.status) where.status = filters.status;
        if (filters?.type) where.type = filters.type;
        if (filters?.customerId) where.customerId = filters.customerId;
        if (filters?.search) {
            where.OR = [
                { title: { contains: filters.search, mode: 'insensitive' } },
                { contractNumber: { contains: filters.search, mode: 'insensitive' } },
                { customerName: { contains: filters.search, mode: 'insensitive' } },
            ];
        }

        return this.prisma.crmContract.findMany({
            where,
            include: {
                opportunity: true,
                quote: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findContractById(id: string) {
        return this.prisma.crmContract.findUnique({
            where: { id },
            include: {
                opportunity: true,
                quote: true,
            },
        });
    }

    async createContract(data: any) {
        const count = await this.prisma.crmContract.count({ where: { companyId: data.companyId } });
        const contractNumber = this.generateNumber('CNT', count + 1);

        return this.prisma.crmContract.create({
            data: {
                ...data,
                contractNumber,
            },
        });
    }

    async updateContract(id: string, data: any) {
        await this.findByIdOrThrow(this.prisma.crmContract, id, 'Contract');
        return this.prisma.crmContract.update({ where: { id }, data });
    }

    async deleteContract(id: string) {
        await this.findByIdOrThrow(this.prisma.crmContract, id, 'Contract');
        return this.prisma.crmContract.update({
            where: { id },
            data: { isActive: false },
        });
    }

    async activateContract(id: string) {
        await this.findByIdOrThrow(this.prisma.crmContract, id, 'Contract');
        return this.prisma.crmContract.update({
            where: { id },
            data: {
                status: 'active',
                signedDate: new Date(),
            },
        });
    }

    // ===========================
    // SUPPORT TICKETS
    // ===========================

    async findAllTickets(companyId: string, filters?: {
        search?: string;
        status?: string;
        priority?: string;
        type?: string;
        assignedToId?: string;
        customerId?: string;
    }) {
        const where: any = { companyId, isActive: true };

        if (filters?.status) where.status = filters.status;
        if (filters?.priority) where.priority = filters.priority;
        if (filters?.type) where.type = filters.type;
        if (filters?.assignedToId) where.assignedToId = filters.assignedToId;
        if (filters?.customerId) where.customerId = filters.customerId;
        if (filters?.search) {
            where.OR = [
                { subject: { contains: filters.search, mode: 'insensitive' } },
                { ticketNumber: { contains: filters.search, mode: 'insensitive' } },
                { description: { contains: filters.search, mode: 'insensitive' } },
            ];
        }

        return this.prisma.crmSupportTicket.findMany({
            where,
            include: {
                sla: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findTicketById(id: string) {
        return this.prisma.crmSupportTicket.findUnique({
            where: { id },
            include: {
                sla: true,
            },
        });
    }

    async createTicket(data: any) {
        const count = await this.prisma.crmSupportTicket.count({ where: { companyId: data.companyId } });
        const ticketNumber = this.generateNumber('TKT', count + 1);

        return this.prisma.crmSupportTicket.create({
            data: {
                ...data,
                ticketNumber,
            },
        });
    }

    async updateTicket(id: string, data: any) {
        await this.findByIdOrThrow(this.prisma.crmSupportTicket, id, 'Ticket');
        return this.prisma.crmSupportTicket.update({ where: { id }, data });
    }

    async resolveTicket(id: string, resolution: string) {
        await this.findByIdOrThrow(this.prisma.crmSupportTicket, id, 'Ticket');
        return this.prisma.crmSupportTicket.update({
            where: { id },
            data: {
                status: 'resolved',
                resolution,
                resolvedAt: new Date(),
            },
        });
    }

    async closeTicket(id: string) {
        await this.findByIdOrThrow(this.prisma.crmSupportTicket, id, 'Ticket');
        return this.prisma.crmSupportTicket.update({
            where: { id },
            data: {
                status: 'closed',
                closedAt: new Date(),
            },
        });
    }

    async getTicketStats(companyId: string) {
        const tickets = await this.prisma.crmSupportTicket.findMany({
            where: { companyId, isActive: true },
        });

        const byStatus: Record<string, number> = {};
        const byPriority: Record<string, number> = {};
        const byType: Record<string, number> = {};

        tickets.forEach(ticket => {
            byStatus[ticket.status] = (byStatus[ticket.status] || 0) + 1;
            byPriority[ticket.priority] = (byPriority[ticket.priority] || 0) + 1;
            if (ticket.type) {
                byType[ticket.type] = (byType[ticket.type] || 0) + 1;
            }
        });

        return {
            total: tickets.length,
            byStatus,
            byPriority,
            byType,
            openCount: byStatus['open'] || 0,
            resolvedCount: byStatus['resolved'] || 0,
            criticalCount: byPriority['critical'] || 0,
        };
    }

    // ===========================
    // SLA
    // ===========================

    async findAllSlas(companyId: string) {
        return this.prisma.crmSla.findMany({
            where: { companyId, isActive: true },
            orderBy: { name: 'asc' },
        });
    }

    async findSlaById(id: string) {
        return this.findByIdOrThrow(this.prisma.crmSla, id, 'SLA');
    }

    // SLA performance aggregation: groups support tickets by SLA policy and
    // computes first-response / resolution compliance against each policy's
    // configured thresholds. Real data-driven metrics for the CRM SLA page.
    async getSlaPerformance(companyId: string) {
        const [slas, tickets] = await Promise.all([
            this.prisma.crmSla.findMany({ where: { companyId }, orderBy: { name: 'asc' } }),
            this.prisma.crmSupportTicket.findMany({
                where: { companyId, isActive: true, slaId: { not: null } },
            }),
        ]);

        const HOUR = 1000 * 60 * 60;
        return slas.map((sla) => {
            const scoped = tickets.filter((t) => t.slaId === sla.id);
            const respLimitMs = (sla.responseTimeHours || 0) * HOUR;
            const resLimitMs = (sla.resolutionTimeHours || 0) * HOUR;

            let metFirstResponse = 0;
            let breachedFirstResponse = 0;
            let metResolution = 0;
            let breachedResolution = 0;
            let sumFirstResponseMin = 0;
            let firstResponseCount = 0;
            let sumResolutionHrs = 0;
            let resolutionCount = 0;

            for (const t of scoped) {
                const created = t.createdAt ? new Date(t.createdAt).getTime() : 0;
                if (t.firstResponseAt && created) {
                    const dt = new Date(t.firstResponseAt).getTime() - created;
                    sumFirstResponseMin += dt / (1000 * 60);
                    firstResponseCount++;
                    if (respLimitMs === 0 || dt <= respLimitMs) metFirstResponse++;
                    else breachedFirstResponse++;
                }
                if (t.resolvedAt && created) {
                    const dt = new Date(t.resolvedAt).getTime() - created;
                    sumResolutionHrs += dt / HOUR;
                    resolutionCount++;
                    if (resLimitMs === 0 || dt <= resLimitMs) metResolution++;
                    else breachedResolution++;
                }
            }

            const frTotal = metFirstResponse + breachedFirstResponse;
            const resTotal = metResolution + breachedResolution;
            const firstResponseCompliance = frTotal ? (metFirstResponse / frTotal) * 100 : 0;
            const resolutionCompliance = resTotal ? (metResolution / resTotal) * 100 : 0;

            return {
                policyId: sla.id,
                policyName: sla.name,
                period: 'All Time',
                totalTickets: scoped.length,
                metFirstResponse,
                metResolution,
                breachedFirstResponse,
                breachedResolution,
                avgFirstResponseTime: firstResponseCount
                    ? Math.round(sumFirstResponseMin / firstResponseCount)
                    : 0,
                avgResolutionTime: resolutionCount
                    ? Math.round((sumResolutionHrs / resolutionCount) * 10) / 10
                    : 0,
                firstResponseCompliance: Math.round(firstResponseCompliance * 10) / 10,
                resolutionCompliance: Math.round(resolutionCompliance * 10) / 10,
                trend:
                    firstResponseCompliance >= 90
                        ? 'improving'
                        : firstResponseCompliance >= 80
                            ? 'stable'
                            : 'declining',
            };
        });
    }

    async createSla(data: any) {
        return this.prisma.crmSla.create({ data });
    }

    async updateSla(id: string, data: any) {
        await this.findByIdOrThrow(this.prisma.crmSla, id, 'SLA');
        return this.prisma.crmSla.update({ where: { id }, data });
    }

    async deleteSla(id: string) {
        await this.findByIdOrThrow(this.prisma.crmSla, id, 'SLA');
        return this.prisma.crmSla.update({
            where: { id },
            data: { isActive: false },
        });
    }

    // ===========================
    // KNOWLEDGE ARTICLES
    // ===========================

    async findAllKnowledgeArticles(companyId: string, filters?: {
        search?: string;
        status?: string;
        category?: string;
        isPublic?: boolean;
    }) {
        const where: any = { companyId, isActive: true };

        if (filters?.status) where.status = filters.status;
        if (filters?.category) where.category = filters.category;
        if (filters?.isPublic !== undefined) where.isPublic = filters.isPublic;
        if (filters?.search) {
            where.OR = [
                { title: { contains: filters.search, mode: 'insensitive' } },
                { content: { contains: filters.search, mode: 'insensitive' } },
                { summary: { contains: filters.search, mode: 'insensitive' } },
            ];
        }

        return this.prisma.crmKnowledgeArticle.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });
    }

    async findKnowledgeArticleById(id: string) {
        return this.findByIdOrThrow(this.prisma.crmKnowledgeArticle, id, 'KnowledgeArticle');
    }

    async createKnowledgeArticle(data: any) {
        const count = await this.prisma.crmKnowledgeArticle.count({ where: { companyId: data.companyId } });
        const articleNumber = this.generateNumber('KB', count + 1);

        return this.prisma.crmKnowledgeArticle.create({
            data: {
                ...data,
                articleNumber,
            },
        });
    }

    async updateKnowledgeArticle(id: string, data: any) {
        await this.findByIdOrThrow(this.prisma.crmKnowledgeArticle, id, 'KnowledgeArticle');
        return this.prisma.crmKnowledgeArticle.update({ where: { id }, data });
    }

    async publishKnowledgeArticle(id: string) {
        await this.findByIdOrThrow(this.prisma.crmKnowledgeArticle, id, 'KnowledgeArticle');
        return this.prisma.crmKnowledgeArticle.update({
            where: { id },
            data: {
                status: 'published',
                publishedDate: new Date(),
            },
        });
    }

    async incrementArticleViewCount(id: string) {
        return this.prisma.crmKnowledgeArticle.update({
            where: { id },
            data: {
                viewCount: { increment: 1 },
            },
        });
    }

    async markArticleHelpful(id: string, helpful: boolean) {
        if (helpful) {
            return this.prisma.crmKnowledgeArticle.update({
                where: { id },
                data: { helpfulCount: { increment: 1 } },
            });
        } else {
            return this.prisma.crmKnowledgeArticle.update({
                where: { id },
                data: { notHelpfulCount: { increment: 1 } },
            });
        }
    }

    // ===========================
    // INTERACTIONS
    // ===========================

    async findAllInteractions(companyId: string, filters?: {
        type?: string;
        leadId?: string;
        contactId?: string;
        customerId?: string;
        opportunityId?: string;
    }) {
        const where: any = { companyId, isActive: true };

        if (filters?.type) where.type = filters.type;
        if (filters?.leadId) where.leadId = filters.leadId;
        if (filters?.contactId) where.contactId = filters.contactId;
        if (filters?.customerId) where.customerId = filters.customerId;
        if (filters?.opportunityId) where.opportunityId = filters.opportunityId;

        return this.prisma.crmInteraction.findMany({
            where,
            orderBy: { dateTime: 'desc' },
        });
    }

    async createInteraction(data: any) {
        return this.prisma.crmInteraction.create({ data });
    }

    async updateInteraction(id: string, data: any) {
        await this.findByIdOrThrow(this.prisma.crmInteraction, id, 'Interaction');
        return this.prisma.crmInteraction.update({ where: { id }, data });
    }

    async deleteInteraction(id: string) {
        await this.findByIdOrThrow(this.prisma.crmInteraction, id, 'Interaction');
        return this.prisma.crmInteraction.update({
            where: { id },
            data: { isActive: false },
        });
    }

    async getInteractionStats(companyId: string) {
        const interactions = await this.prisma.crmInteraction.findMany({
            where: { companyId, isActive: true },
        });

        const byType: Record<string, number> = {};
        const byOutcome: Record<string, number> = {};

        interactions.forEach(interaction => {
            byType[interaction.type] = (byType[interaction.type] || 0) + 1;
            if (interaction.outcome) {
                byOutcome[interaction.outcome] = (byOutcome[interaction.outcome] || 0) + 1;
            }
        });

        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const thisWeek = interactions.filter(i => new Date(i.dateTime) >= oneWeekAgo).length;

        return {
            total: interactions.length,
            thisWeek,
            byType,
            byOutcome,
        };
    }

    // ===========================
    // SALES TERRITORIES
    // ===========================

    async findAllSalesTerritories(companyId: string) {
        return this.prisma.crmSalesTerritory.findMany({
            where: { companyId, isActive: true },
            include: {
                parentTerritory: true,
                childTerritories: true,
            },
            orderBy: { priority: 'desc' },
        });
    }

    async findSalesTerritoryById(id: string) {
        return this.prisma.crmSalesTerritory.findUnique({
            where: { id },
            include: {
                parentTerritory: true,
                childTerritories: true,
            },
        });
    }

    async createSalesTerritory(data: any) {
        return this.prisma.crmSalesTerritory.create({ data });
    }

    async updateSalesTerritory(id: string, data: any) {
        await this.findByIdOrThrow(this.prisma.crmSalesTerritory, id, 'SalesTerritory');
        return this.prisma.crmSalesTerritory.update({ where: { id }, data });
    }

    async deleteSalesTerritory(id: string) {
        await this.findByIdOrThrow(this.prisma.crmSalesTerritory, id, 'SalesTerritory');
        return this.prisma.crmSalesTerritory.update({
            where: { id },
            data: { isActive: false },
        });
    }

    // ===========================
    // PIPELINE STAGES
    // ===========================

    async findAllPipelineStages(companyId: string, stageType?: string) {
        const where: any = { companyId, isActive: true };
        if (stageType) where.stageType = stageType;

        return this.prisma.crmPipelineStage.findMany({
            where,
            orderBy: { sortOrder: 'asc' },
        });
    }

    async createPipelineStage(data: any) {
        return this.prisma.crmPipelineStage.create({ data });
    }

    async updatePipelineStage(id: string, data: any) {
        await this.findByIdOrThrow(this.prisma.crmPipelineStage, id, 'PipelineStage');
        return this.prisma.crmPipelineStage.update({ where: { id }, data });
    }

    async deletePipelineStage(id: string) {
        await this.findByIdOrThrow(this.prisma.crmPipelineStage, id, 'PipelineStage');
        return this.prisma.crmPipelineStage.update({
            where: { id },
            data: { isActive: false },
        });
    }

    // ===========================
    // LEAD STATUSES
    // ===========================

    async findAllLeadStatuses(companyId: string) {
        return this.prisma.crmLeadStatus.findMany({
            where: { companyId, isActive: true },
            orderBy: { sortOrder: 'asc' },
        });
    }

    async createLeadStatus(data: any) {
        return this.prisma.crmLeadStatus.create({ data });
    }

    async updateLeadStatus(id: string, data: any) {
        await this.findByIdOrThrow(this.prisma.crmLeadStatus, id, 'LeadStatus');
        return this.prisma.crmLeadStatus.update({ where: { id }, data });
    }

    async deleteLeadStatus(id: string) {
        await this.findByIdOrThrow(this.prisma.crmLeadStatus, id, 'LeadStatus');
        return this.prisma.crmLeadStatus.update({
            where: { id },
            data: { isActive: false },
        });
    }

    // ===========================
    // LEAD SOURCES
    // ===========================

    async findAllLeadSources(companyId: string) {
        return this.prisma.crmLeadSource.findMany({
            where: { companyId, isActive: true },
            orderBy: { name: 'asc' },
        });
    }

    async createLeadSource(data: any) {
        return this.prisma.crmLeadSource.create({ data });
    }

    async updateLeadSource(id: string, data: any) {
        await this.findByIdOrThrow(this.prisma.crmLeadSource, id, 'LeadSource');
        return this.prisma.crmLeadSource.update({ where: { id }, data });
    }

    async deleteLeadSource(id: string) {
        await this.findByIdOrThrow(this.prisma.crmLeadSource, id, 'LeadSource');
        return this.prisma.crmLeadSource.update({
            where: { id },
            data: { isActive: false },
        });
    }
}
