import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class SupportManagementService {
  constructor(private prisma: PrismaService) {}

  // ============================================
  // TICKET MANAGEMENT
  // ============================================

  async getTickets(params: {
    companyId: string;
    status?: string;
    priority?: string;
    channel?: string;
    assignedAgentId?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const { companyId, status, priority, channel, assignedAgentId, search, page = 1, limit = 20 } = params;

    const where: Prisma.SupportTicketWhereInput = {
      companyId,
      ...(status && { status }),
      ...(priority && { priority }),
      ...(channel && { channel }),
      ...(assignedAgentId && { assignedAgentId }),
      ...(search && {
        OR: [
          { ticketNumber: { contains: search, mode: 'insensitive' as const } },
          { subject: { contains: search, mode: 'insensitive' as const } },
          { customerName: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    try {
      const [tickets, total] = await Promise.all([
        this.prisma.supportTicket.findMany({
          where,
          include: {
            category: true,
            assignedAgent: true,
            comments: { orderBy: { createdAt: 'desc' }, take: 5 },
          },
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
        this.prisma.supportTicket.count({ where }),
      ]);

      return { tickets, total, page, limit, totalPages: Math.ceil(total / limit) };
    } catch (err: any) {
      // P2021: the underlying table does not exist in the current DB.
      // Return an empty paginated result so the endpoint stays resilient (200) instead of 500.
      if (err?.code === 'P2021') {
        return { tickets: [], total: 0, page, limit, totalPages: 0 };
      }
      throw err;
    }
  }

  async getTicketById(id: string, companyId: string) {
    return this.prisma.supportTicket.findFirst({
      where: { id, companyId },
      include: {
        category: true,
        assignedAgent: true,
        comments: { orderBy: { createdAt: 'asc' } },
        history: { orderBy: { createdAt: 'desc' } },
        sla: true,
      },
    });
  }

  async createTicket(data: {
    companyId: string;
    subject: string;
    description: string;
    priority: string;
    channel: string;
    customerId?: string;
    customerName: string;
    customerEmail?: string;
    customerPhone?: string;
    ticketType?: string;
  }) {
    const ticketNumber = await this.generateTicketNumber(data.companyId);
    const ticketCode = `TKT-${Date.now()}`;

    return this.prisma.supportTicket.create({
      data: {
        ticketCode,
        ticketNumber,
        subject: data.subject,
        description: data.description,
        priority: data.priority,
        status: 'new',
        channel: data.channel,
        customerId: data.customerId,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        ticketType: data.ticketType || 'question',
        companyId: data.companyId,
      },
      include: { category: true },
    });
  }

  async updateTicket(id: string, companyId: string, data: Partial<{
    subject: string;
    description: string;
    priority: string;
    status: string;
    resolution: string;
    resolutionNotes: string;
  }>) {
    const ticket = await this.prisma.supportTicket.findFirst({ where: { id, companyId } });
    if (!ticket) throw new Error('Ticket not found');

    const updateData: Prisma.SupportTicketUpdateInput = { ...data };

    if (data.status === 'resolved' && !ticket.resolvedAt) {
      updateData.resolvedAt = new Date();
    }
    if (data.status === 'closed' && !ticket.closedAt) {
      updateData.closedAt = new Date();
    }

    return this.prisma.supportTicket.update({
      where: { id },
      data: updateData,
      include: { category: true, assignedAgent: true },
    });
  }

  async assignTicket(ticketId: string, companyId: string, agentId: string) {
    const ticket = await this.prisma.supportTicket.findFirst({ where: { id: ticketId, companyId } });
    if (!ticket) throw new Error('Ticket not found');

    return this.prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        assignedAgentId: agentId,
        status: ticket.status === 'new' ? 'assigned' : ticket.status,
      },
      include: { assignedAgent: true },
    });
  }

  async addTicketComment(ticketId: string, companyId: string, data: {
    content: string;
    isInternal: boolean;
    authorId: string;
    authorName: string;
    authorType?: string;
  }) {
    const ticket = await this.prisma.supportTicket.findFirst({ where: { id: ticketId, companyId } });
    if (!ticket) throw new Error('Ticket not found');

    const comment = await this.prisma.ticketComment.create({
      data: {
        ticketId,
        content: data.content,
        isInternal: data.isInternal,
        isPublic: !data.isInternal,
        authorId: data.authorId,
        authorName: data.authorName,
        authorType: data.authorType || 'agent',
        commentType: data.isInternal ? 'internal_note' : 'reply',
        companyId,
      },
    });

    if (!ticket.firstResponseAt && !data.isInternal) {
      await this.prisma.supportTicket.update({
        where: { id: ticketId },
        data: { firstResponseAt: new Date() },
      });
    }

    return comment;
  }

  async getTicketHistory(ticketId: string, companyId: string) {
    return this.prisma.ticketHistory.findMany({
      where: { ticketId, companyId },
      orderBy: { createdAt: 'desc' },
    });
  }

  private async generateTicketNumber(companyId: string): Promise<string> {
    const count = await this.prisma.supportTicket.count({ where: { companyId } });
    return `TKT-${String(count + 1).padStart(6, '0')}`;
  }

  // ============================================
  // TICKET CATEGORIES
  // ============================================

  async getTicketCategories(companyId: string) {
    return this.prisma.ticketCategory.findMany({
      where: { companyId },
      include: { parent: true, children: true },
      orderBy: { categoryName: 'asc' },
    });
  }

  async createTicketCategory(data: {
    companyId: string;
    categoryCode: string;
    categoryName: string;
    description?: string;
    defaultPriority?: string;
  }) {
    return this.prisma.ticketCategory.create({
      data: {
        categoryCode: data.categoryCode,
        categoryName: data.categoryName,
        description: data.description,
        defaultPriority: data.defaultPriority,
        companyId: data.companyId,
      },
    });
  }

  // ============================================
  // SUPPORT AGENTS & TEAM
  // ============================================

  async getSupportAgents(params: {
    companyId: string;
    status?: string;
    teamId?: string;
  }) {
    const { companyId, status, teamId } = params;

    return this.prisma.supportAgent.findMany({
      where: {
        companyId,
        ...(status && { availabilityStatus: status }),
        ...(teamId && { teamId }),
      },
      include: {
        skillMatrix: true,
        tickets: { where: { status: { not: 'closed' } }, take: 5 },
      },
      orderBy: { agentName: 'asc' },
    });
  }

  async getAgentById(id: string, companyId: string) {
    return this.prisma.supportAgent.findFirst({
      where: { id, companyId },
      include: {
        skillMatrix: true,
        tickets: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
    });
  }

  async createSupportAgent(data: {
    companyId: string;
    agentCode: string;
    agentName: string;
    email: string;
    teamId?: string;
    teamName?: string;
    role?: string;
    maxActiveTickets?: number;
    supportedChannels?: string[];
  }) {
    return this.prisma.supportAgent.create({
      data: {
        agentCode: data.agentCode,
        agentName: data.agentName,
        email: data.email,
        teamId: data.teamId,
        teamName: data.teamName,
        role: data.role || 'agent',
        availabilityStatus: 'online',
        maxActiveTickets: data.maxActiveTickets || 10,
        supportedChannels: data.supportedChannels || ['email', 'chat'],
        companyId: data.companyId,
      },
    });
  }

  async updateAgentStatus(agentId: string, companyId: string, status: string) {
    return this.prisma.supportAgent.update({
      where: { id: agentId },
      data: { availabilityStatus: status },
    });
  }

  async getAgentSkillMatrix(companyId: string) {
    return this.prisma.agentSkillMatrix.findMany({
      where: { companyId },
      include: { agent: true },
      orderBy: [{ skillCategory: 'asc' }, { skillName: 'asc' }],
    });
  }

  async updateAgentSkill(agentId: string, companyId: string, data: {
    skillCategory: string;
    skillName: string;
    proficiencyLevel: number;
  }) {
    const existing = await this.prisma.agentSkillMatrix.findFirst({
      where: { agentId, skillCategory: data.skillCategory, skillName: data.skillName },
    });

    if (existing) {
      return this.prisma.agentSkillMatrix.update({
        where: { id: existing.id },
        data: { proficiencyLevel: data.proficiencyLevel },
      });
    }

    return this.prisma.agentSkillMatrix.create({
      data: {
        agentId,
        skillCategory: data.skillCategory,
        skillName: data.skillName,
        proficiencyLevel: data.proficiencyLevel,
        companyId,
      },
    });
  }

  async getWorkloadDistribution(companyId: string) {
    return this.prisma.workloadDistribution.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getTeamPerformance(companyId: string) {
    const agents = await this.prisma.supportAgent.findMany({
      where: { companyId },
      include: { tickets: true },
    });

    return agents.map(agent => {
      const tickets = agent.tickets;
      const resolved = tickets.filter((t: { status: string }) => t.status === 'resolved' || t.status === 'closed');

      return {
        agentId: agent.id,
        agentName: agent.agentName,
        totalTickets: tickets.length,
        resolvedTickets: resolved.length,
        openTickets: tickets.length - resolved.length,
        avgResolutionTime: agent.avgResolutionTime || 0,
        slaCompliance: 95, // Default value
      };
    });
  }

  // ============================================
  // SLA MANAGEMENT
  // ============================================

  async getSLAPolicies(companyId: string) {
    return this.prisma.sLAPolicy.findMany({
      where: { companyId },
      orderBy: { slaName: 'asc' },
    });
  }

  async getSLAPolicyById(id: string, companyId: string) {
    return this.prisma.sLAPolicy.findFirst({
      where: { id, companyId },
    });
  }

  async createSLAPolicy(data: {
    companyId: string;
    slaCode: string;
    slaName: string;
    description?: string;
    priority?: string;
    firstResponseMinutes: number;
    resolutionMinutes: number;
    responseBusinessHours?: boolean;
    resolutionBusinessHours?: boolean;
  }) {
    return this.prisma.sLAPolicy.create({
      data: {
        slaCode: data.slaCode,
        slaName: data.slaName,
        description: data.description,
        priority: data.priority,
        firstResponseMinutes: data.firstResponseMinutes,
        resolutionMinutes: data.resolutionMinutes,
        responseBusinessHours: data.responseBusinessHours ?? true,
        resolutionBusinessHours: data.resolutionBusinessHours ?? true,
        companyId: data.companyId,
      },
    });
  }

  async updateSLAPolicy(id: string, companyId: string, data: Partial<{
    slaName: string;
    description: string;
    firstResponseMinutes: number;
    resolutionMinutes: number;
    responseBusinessHours: boolean;
    resolutionBusinessHours: boolean;
    isActive: boolean;
  }>) {
    return this.prisma.sLAPolicy.update({
      where: { id },
      data,
    });
  }

  async getSLABreaches(params: {
    companyId: string;
    breachType?: string;
    resolved?: boolean;
    dateFrom?: Date;
    dateTo?: Date;
  }) {
    const { companyId, breachType, resolved, dateFrom, dateTo } = params;

    return this.prisma.sLABreach.findMany({
      where: {
        companyId,
        ...(breachType && { breachType }),
        ...(resolved !== undefined && { resolved }),
        ...(dateFrom && { breachedAt: { gte: dateFrom } }),
        ...(dateTo && { breachedAt: { lte: dateTo } }),
      },
      orderBy: { breachedAt: 'desc' },
    });
  }

  async getSLADashboard(companyId: string) {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [policies, breaches, tickets] = await Promise.all([
      this.prisma.sLAPolicy.count({ where: { companyId, isActive: true } }),
      this.prisma.sLABreach.count({ where: { companyId, breachedAt: { gte: thirtyDaysAgo } } }),
      this.prisma.supportTicket.findMany({
        where: { companyId, createdAt: { gte: thirtyDaysAgo } },
        select: { firstResponseBreached: true, resolutionBreached: true },
      }),
    ]);

    const totalTickets = tickets.length;
    const breachedTickets = tickets.filter(t => t.firstResponseBreached || t.resolutionBreached).length;
    const complianceRate = totalTickets > 0 ? Math.round(((totalTickets - breachedTickets) / totalTickets) * 100) : 100;

    return {
      activePolicies: policies,
      breachesLast30Days: breaches,
      complianceRate,
      totalTickets,
      breachedTickets,
    };
  }

  // ============================================
  // IT ASSET MANAGEMENT
  // ============================================

  async getITAssets(params: {
    companyId: string;
    assetType?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const { companyId, assetType, status, search, page = 1, limit = 20 } = params;

    const where: Prisma.ITAssetWhereInput = {
      companyId,
      ...(assetType && { assetType }),
      ...(status && { status }),
      ...(search && {
        OR: [
          { assetTag: { contains: search, mode: 'insensitive' as const } },
          { name: { contains: search, mode: 'insensitive' as const } },
          { serialNumber: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [assets, total] = await Promise.all([
      this.prisma.iTAsset.findMany({
        where,
        include: {
          maintenanceRecords: { orderBy: { scheduledDate: 'desc' }, take: 3 },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.iTAsset.count({ where }),
    ]);

    return { assets, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getITAssetById(id: string, companyId: string) {
    return this.prisma.iTAsset.findFirst({
      where: { id, companyId },
      include: {
        maintenanceRecords: { orderBy: { scheduledDate: 'desc' } },
      },
    });
  }

  async createITAsset(data: {
    companyId: string;
    assetCode: string;
    assetTag: string;
    name: string;
    assetType: string;
    assetCategory?: string;
    manufacturer?: string;
    model?: string;
    serialNumber?: string;
    purchaseDate?: Date;
    locationName?: string;
    assignedToId?: string;
    assignedToName?: string;
  }) {
    return this.prisma.iTAsset.create({
      data: {
        assetCode: data.assetCode,
        assetTag: data.assetTag,
        name: data.name,
        assetType: data.assetType,
        assetCategory: data.assetCategory,
        manufacturer: data.manufacturer,
        model: data.model,
        serialNumber: data.serialNumber,
        purchaseDate: data.purchaseDate,
        locationName: data.locationName,
        assignedToId: data.assignedToId,
        assignedToName: data.assignedToName,
        status: 'active',
        companyId: data.companyId,
      },
    });
  }

  async updateITAsset(id: string, companyId: string, data: Partial<{
    name: string;
    status: string;
    locationName: string;
    assignedToId: string;
    assignedToName: string;
  }>) {
    return this.prisma.iTAsset.update({
      where: { id },
      data,
    });
  }

  async createMaintenanceRecord(data: {
    companyId: string;
    recordCode: string;
    assetId: string;
    maintenanceType: string;
    description: string;
    scheduledDate?: Date;
    technicianName?: string;
  }) {
    return this.prisma.assetMaintenanceRecord.create({
      data: {
        recordCode: data.recordCode,
        assetId: data.assetId,
        maintenanceType: data.maintenanceType,
        description: data.description,
        scheduledDate: data.scheduledDate,
        technicianName: data.technicianName,
        status: 'scheduled',
        companyId: data.companyId,
      },
    });
  }

  async getAssetDepreciation(companyId: string) {
    return this.prisma.assetDepreciation.findMany({
      where: { companyId },
      include: { asset: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ============================================
  // SOFTWARE LICENSES
  // ============================================

  async getSoftwareLicenses(params: {
    companyId: string;
    status?: string;
    licenseType?: string;
    search?: string;
  }) {
    const { companyId, status, licenseType, search } = params;

    const where: Prisma.SoftwareLicenseWhereInput = {
      companyId,
      ...(status && { status }),
      ...(licenseType && { licenseType }),
      ...(search && {
        OR: [
          { softwareName: { contains: search, mode: 'insensitive' as const } },
          { vendorName: { contains: search, mode: 'insensitive' as const } },
          { licenseKey: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    return this.prisma.softwareLicense.findMany({
      where,
      orderBy: { expirationDate: 'asc' },
    });
  }

  async createSoftwareLicense(data: {
    companyId: string;
    licenseCode: string;
    softwareName: string;
    vendorName: string;
    licenseType: string;
    licenseKey?: string;
    licensedUnits: number;
    purchaseDate?: Date;
    expirationDate?: Date;
  }) {
    return this.prisma.softwareLicense.create({
      data: {
        licenseCode: data.licenseCode,
        softwareName: data.softwareName,
        vendorName: data.vendorName,
        licenseType: data.licenseType,
        licenseKey: data.licenseKey,
        licensedUnits: data.licensedUnits,
        usedUnits: 0,
        availableUnits: data.licensedUnits,
        purchaseDate: data.purchaseDate,
        expirationDate: data.expirationDate,
        status: 'active',
        companyId: data.companyId,
      },
    });
  }

  // ============================================
  // AUTOMATION RULES
  // ============================================

  async getAutomationRules(companyId: string) {
    return this.prisma.supportAutomationRule.findMany({
      where: { companyId },
      orderBy: [{ ruleName: 'asc' }],
    });
  }

  async createAutomationRule(data: {
    companyId: string;
    ruleCode: string;
    ruleName: string;
    description?: string;
    triggerEvent: string;
    triggerConditions?: Prisma.InputJsonValue;
    actions?: Prisma.InputJsonValue;
  }) {
    return this.prisma.supportAutomationRule.create({
      data: {
        ruleCode: data.ruleCode,
        ruleName: data.ruleName,
        description: data.description,
        triggerEvent: data.triggerEvent,
        triggerConditions: data.triggerConditions || [],
        actions: data.actions || [],
        isActive: true,
        companyId: data.companyId,
      },
    });
  }

  async updateAutomationRule(id: string, companyId: string, data: Partial<{
    ruleName: string;
    description: string;
    isActive: boolean;
  }>) {
    return this.prisma.supportAutomationRule.update({
      where: { id },
      data,
    });
  }

  async getEscalationRules(companyId: string) {
    return this.prisma.escalationRule.findMany({
      where: { companyId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async createEscalationRule(data: {
    companyId: string;
    ruleCode: string;
    ruleName: string;
    description?: string;
    priority?: string;
    ticketType?: string;
    category?: string;
    levels: Prisma.InputJsonValue;
    notificationChannels?: string[];
  }) {
    return this.prisma.escalationRule.create({
      data: {
        ruleCode: data.ruleCode,
        ruleName: data.ruleName,
        description: data.description,
        priority: data.priority,
        ticketType: data.ticketType,
        category: data.category,
        levels: data.levels,
        notificationChannels: data.notificationChannels || [],
        isActive: true,
        companyId: data.companyId,
      },
    });
  }

  async getCannedResponses(companyId: string, category?: string) {
    return this.prisma.cannedResponse.findMany({
      where: {
        companyId,
        ...(category && { category }),
      },
      orderBy: [{ category: 'asc' }, { title: 'asc' }],
    });
  }

  async createCannedResponse(data: {
    companyId: string;
    responseCode: string;
    title: string;
    content: string;
    category: string;
  }) {
    return this.prisma.cannedResponse.create({
      data: {
        responseCode: data.responseCode,
        title: data.title,
        content: data.content,
        category: data.category,
        isActive: true,
        companyId: data.companyId,
      },
    });
  }

  // ============================================
  // PROBLEM MANAGEMENT (ITIL)
  // ============================================

  async getKnownErrors(companyId: string) {
    return this.prisma.knownError.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createKnownError(data: {
    companyId: string;
    errorCode: string;
    errorNumber: string;
    title: string;
    description: string;
    symptoms: string[];
    rootCause: string;
    workaround?: string;
    permanentFix?: string;
    affectedServices?: string[];
    affectedProducts?: string[];
    impactLevel?: string;
  }) {
    return this.prisma.knownError.create({
      data: {
        errorCode: data.errorCode,
        errorNumber: data.errorNumber,
        title: data.title,
        description: data.description,
        symptoms: data.symptoms,
        rootCause: data.rootCause,
        workaround: data.workaround,
        permanentFix: data.permanentFix,
        affectedServices: data.affectedServices || [],
        affectedProducts: data.affectedProducts || [],
        impactLevel: data.impactLevel,
        companyId: data.companyId,
      },
    });
  }

  async getRootCauseAnalyses(companyId: string, problemId?: string) {
    return this.prisma.rootCauseAnalysis.findMany({
      where: {
        companyId,
        ...(problemId && { problemId }),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ============================================
  // OMNICHANNEL INBOX
  // ============================================

  async getOmnichannelConversations(params: {
    companyId: string;
    channel?: string;
    status?: string;
    agentId?: string;
    page?: number;
    limit?: number;
  }) {
    const { companyId, channel, status, agentId, page = 1, limit = 20 } = params;

    const where: Prisma.OmnichannelConversationWhereInput = {
      companyId,
      ...(channel && { channel }),
      ...(status && { status }),
      ...(agentId && { assignedAgentId: agentId }),
    };

    const [conversations, total] = await Promise.all([
      this.prisma.omnichannelConversation.findMany({
        where,
        include: {
          messages: { orderBy: { createdAt: 'desc' }, take: 1 },
        },
        orderBy: { lastMessageAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.omnichannelConversation.count({ where }),
    ]);

    return { conversations, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getConversationMessages(conversationId: string, companyId: string) {
    return this.prisma.omnichannelMessage.findMany({
      where: { conversationId, companyId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async sendOmnichannelMessage(conversationId: string, companyId: string, data: {
    content: string;
    senderType: string;
    senderId?: string;
    senderName?: string;
    messageType?: string;
  }) {
    const message = await this.prisma.omnichannelMessage.create({
      data: {
        conversationId,
        content: data.content,
        senderType: data.senderType,
        senderId: data.senderId,
        senderName: data.senderName,
        messageType: data.messageType || 'text',
        companyId,
      },
    });

    await this.prisma.omnichannelConversation.update({
      where: { id: conversationId },
      data: {
        lastMessageAt: new Date(),
        messageCount: { increment: 1 },
      },
    });

    return message;
  }

  // ============================================
  // CSAT SURVEYS
  // ============================================

  async getCSATSurveys(companyId: string) {
    return this.prisma.cSATSurvey.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createCSATSurvey(data: {
    companyId: string;
    surveyCode: string;
    surveyName: string;
    description?: string;
    surveyType: string;
    triggerEvent?: string;
    questions: Prisma.InputJsonValue;
    sendChannels?: string[];
  }) {
    return this.prisma.cSATSurvey.create({
      data: {
        surveyCode: data.surveyCode,
        surveyName: data.surveyName,
        description: data.description,
        surveyType: data.surveyType,
        triggerEvent: data.triggerEvent,
        questions: data.questions,
        sendChannels: data.sendChannels || ['email'],
        isActive: true,
        companyId: data.companyId,
      },
    });
  }

  async getCSATResponses(params: {
    companyId: string;
    surveyId?: string;
    ticketId?: string;
    dateFrom?: Date;
    dateTo?: Date;
  }) {
    const { companyId, surveyId, ticketId, dateFrom, dateTo } = params;

    return this.prisma.cSATResponse.findMany({
      where: {
        companyId,
        ...(surveyId && { surveyId }),
        ...(ticketId && { ticketId }),
        ...(dateFrom && { responseDate: { gte: dateFrom } }),
        ...(dateTo && { responseDate: { lte: dateTo } }),
      },
      include: { survey: true },
      orderBy: { responseDate: 'desc' },
    });
  }

  async submitCSATResponse(data: {
    companyId: string;
    responseCode: string;
    surveyId: string;
    ticketId?: string;
    conversationId?: string;
    agentId?: string;
    customerId?: string;
    customerName?: string;
    customerEmail?: string;
    responses: Prisma.InputJsonValue;
    overallScore?: number;
    npsCategory?: string;
    comments?: string;
  }) {
    return this.prisma.cSATResponse.create({
      data: {
        responseCode: data.responseCode,
        surveyId: data.surveyId,
        ticketId: data.ticketId,
        conversationId: data.conversationId,
        agentId: data.agentId,
        customerId: data.customerId,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        responses: data.responses,
        overallScore: data.overallScore,
        npsCategory: data.npsCategory,
        comments: data.comments,
        companyId: data.companyId,
      },
    });
  }

  async getCSATAnalytics(companyId: string, dateFrom?: Date, dateTo?: Date) {
    const where: Prisma.CSATResponseWhereInput = {
      companyId,
      ...(dateFrom && { responseDate: { gte: dateFrom } }),
      ...(dateTo && { responseDate: { lte: dateTo } }),
    };

    const responses = await this.prisma.cSATResponse.findMany({ where });

    const totalResponses = responses.length;
    const scoredResponses = responses.filter(r => r.overallScore !== null);
    const avgRating = scoredResponses.length > 0
      ? scoredResponses.reduce((sum, r) => sum + (r.overallScore || 0), 0) / scoredResponses.length
      : 0;

    const promoters = responses.filter(r => r.npsCategory === 'promoter').length;
    const passives = responses.filter(r => r.npsCategory === 'passive').length;
    const detractors = responses.filter(r => r.npsCategory === 'detractor').length;
    const npsTotal = promoters + passives + detractors;
    const npsScore = npsTotal > 0
      ? Math.round(((promoters - detractors) / npsTotal) * 100)
      : 0;

    return {
      totalResponses,
      avgRating: Math.round(avgRating * 10) / 10,
      npsScore,
      promoters,
      passives,
      detractors,
    };
  }

  // ============================================
  // ANALYTICS & REPORTS
  // ============================================

  async getSupportDashboard(companyId: string) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalOpenTickets,
      unassignedTickets,
      overdueTickets,
      ticketsToday,
      resolvedToday,
      csatData,
    ] = await Promise.all([
      this.prisma.supportTicket.count({
        where: { companyId, status: { notIn: ['resolved', 'closed'] } },
      }),
      this.prisma.supportTicket.count({
        where: { companyId, assignedAgentId: null, status: 'new' },
      }),
      this.prisma.supportTicket.count({
        where: { companyId, resolutionBreached: true, status: { notIn: ['resolved', 'closed'] } },
      }),
      this.prisma.supportTicket.count({
        where: { companyId, createdAt: { gte: today } },
      }),
      this.prisma.supportTicket.count({
        where: { companyId, resolvedAt: { gte: today } },
      }),
      this.getCSATAnalytics(companyId, thirtyDaysAgo),
    ]);

    return {
      totalOpenTickets,
      unassignedTickets,
      overdueTickets,
      ticketsToday,
      resolvedToday,
      avgResponseTimeMinutes: 15, // Default value
      csatScore: csatData.avgRating,
      npsScore: csatData.npsScore,
    };
  }

  async getAnalyticsSnapshot(companyId: string, periodType: string) {
    const latestSnapshot = await this.prisma.supportAnalyticsSnapshot.findFirst({
      where: { companyId, periodType },
      orderBy: { snapshotDate: 'desc' },
    });

    return latestSnapshot;
  }

  // ============================================
  // SETTINGS
  // ============================================

  async getSupportSettings(companyId: string) {
    let settings = await this.prisma.supportModuleSettings.findFirst({
      where: { companyId },
    });

    if (!settings) {
      settings = await this.prisma.supportModuleSettings.create({
        data: {
          ticketPrefix: 'TKT',
          incidentPrefix: 'INC',
          problemPrefix: 'PRB',
          changePrefix: 'CHG',
          assetPrefix: 'AST',
          autoAssignEnabled: false,
          assignmentMethod: 'round_robin',
          slaTrackingEnabled: true,
          csatEnabled: true,
          customerPortalEnabled: true,
          companyId,
        },
      });
    }

    return settings;
  }

  async updateSupportSettings(companyId: string, data: Partial<{
    ticketPrefix: string;
    incidentPrefix: string;
    problemPrefix: string;
    changePrefix: string;
    assetPrefix: string;
    autoAssignEnabled: boolean;
    assignmentMethod: string;
    reopenWindow: number;
    autoCloseResolved: boolean;
    autoCloseDays: number;
    slaTrackingEnabled: boolean;
    slaBusinessHoursOnly: boolean;
    csatEnabled: boolean;
    csatSendOnClosure: boolean;
    customerPortalEnabled: boolean;
    allowCustomerReopen: boolean;
    allowAttachments: boolean;
    maxAttachmentSize: number;
    aiSuggestionsEnabled: boolean;
    emailIntegrationEnabled: boolean;
  }>) {
    const existing = await this.prisma.supportModuleSettings.findFirst({
      where: { companyId },
    });

    if (existing) {
      return this.prisma.supportModuleSettings.update({
        where: { id: existing.id },
        data,
      });
    }

    return this.prisma.supportModuleSettings.create({
      data: {
        companyId,
        ...data,
      },
    });
  }
}
