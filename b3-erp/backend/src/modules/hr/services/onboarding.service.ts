import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class OnboardingService {
    private readonly logger = new Logger(OnboardingService.name);

    constructor(private readonly prisma: PrismaService) {}

    // ============================================================================
    // Onboarding Process
    // ============================================================================

    async createOnboardingProcess(data: {
        candidateName: string;
        candidateEmail: string;
        candidatePhone?: string;
        positionId?: string;
        departmentId?: string;
        reportingManagerId?: string;
        expectedJoiningDate: Date;
        companyId: string;
    }) {
        const count = await this.prisma.onboardingProcess.count({
            where: { companyId: data.companyId },
        });
        const onboardingNumber = `ONB-${String(count + 1).padStart(5, '0')}`;

        return this.prisma.onboardingProcess.create({
            data: {
                onboardingNumber,
                employeeId: '',
                ...data,
            },
        });
    }

    async getOnboardingProcesses(companyId: string, options?: {
        status?: string;
        currentStage?: string;
        page?: number;
        limit?: number;
    }) {
        const where: Prisma.OnboardingProcessWhereInput = {
            companyId,
            isActive: true,
        };

        if (options?.status) where.status = options.status;
        if (options?.currentStage) where.currentStage = options.currentStage;

        const page = options?.page || 1;
        const limit = options?.limit || 20;

        const [data, total] = await Promise.all([
            this.prisma.onboardingProcess.findMany({
                where,
                include: {
                    offers: { take: 1, orderBy: { createdAt: 'desc' } },
                    documents: { where: { isActive: true } },
                    verifications: { where: { isActive: true } },
                    medicals: { take: 1, orderBy: { createdAt: 'desc' } },
                },
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.onboardingProcess.count({ where }),
        ]);

        return { data, total, page, limit };
    }

    async getOnboardingProcessById(id: string) {
        const process = await this.prisma.onboardingProcess.findUnique({
            where: { id },
            include: {
                offers: true,
                documents: { where: { isActive: true } },
                verifications: { where: { isActive: true } },
                medicals: { where: { isActive: true } },
                orientations: { where: { isActive: true }, orderBy: { scheduledDate: 'asc' } },
                checklistItems: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
            },
        });
        if (!process) {
            throw new NotFoundException(`Onboarding process ${id} not found`);
        }
        return process;
    }

    async updateOnboardingProcess(id: string, data: Partial<{
        employeeId: string;
        actualJoiningDate: Date;
        status: string;
        currentStage: string;
        offerAccepted: boolean;
        documentsCollected: boolean;
        bgvCompleted: boolean;
        medicalCompleted: boolean;
        firstDayCompleted: boolean;
        idCardGenerated: boolean;
        systemAccessGranted: boolean;
        welcomeKitProvided: boolean;
        hrInductionDone: boolean;
        deptInductionDone: boolean;
        trainingScheduled: boolean;
        policiesAcknowledged: boolean;
        notes: string;
    }>) {
        // Calculate completion percentage
        const completionFields = [
            'offerAccepted', 'documentsCollected', 'bgvCompleted', 'medicalCompleted',
            'firstDayCompleted', 'idCardGenerated', 'systemAccessGranted', 'welcomeKitProvided',
            'hrInductionDone', 'deptInductionDone', 'trainingScheduled', 'policiesAcknowledged',
        ];

        const current = await this.prisma.onboardingProcess.findUnique({ where: { id } });
        if (!current) throw new NotFoundException(`Onboarding process ${id} not found`);

        const merged = { ...current, ...data };
        const completed = completionFields.filter(f => merged[f as keyof typeof merged] === true).length;
        const completionPercentage = Math.round((completed / completionFields.length) * 100);

        return this.prisma.onboardingProcess.update({
            where: { id },
            data: {
                ...data,
                completionPercentage,
            },
        });
    }

    // ============================================================================
    // Offer Management
    // ============================================================================

    async createOffer(data: {
        onboardingId?: string;
        candidateName: string;
        candidateEmail: string;
        candidatePhone?: string;
        positionTitle: string;
        departmentId?: string;
        offeredSalary?: number;
        salaryStructure?: Prisma.InputJsonValue;
        joiningBonus?: number;
        benefits?: Prisma.InputJsonValue;
        joiningDate: Date;
        offerExpiryDate: Date;
        createdBy?: string;
        companyId: string;
    }) {
        const count = await this.prisma.offerManagement.count({
            where: { companyId: data.companyId },
        });
        const offerNumber = `OFR-${String(count + 1).padStart(5, '0')}`;

        return this.prisma.offerManagement.create({
            data: {
                offerNumber,
                ...data,
                offeredSalary: data.offeredSalary ? new Prisma.Decimal(data.offeredSalary) : undefined,
                joiningBonus: data.joiningBonus ? new Prisma.Decimal(data.joiningBonus) : undefined,
            },
        });
    }

    async getOffers(companyId: string, options?: {
        status?: string;
        page?: number;
        limit?: number;
    }) {
        const where: Prisma.OfferManagementWhereInput = {
            companyId,
            isActive: true,
        };

        if (options?.status) where.status = options.status;

        const page = options?.page || 1;
        const limit = options?.limit || 20;

        const [data, total] = await Promise.all([
            this.prisma.offerManagement.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.offerManagement.count({ where }),
        ]);

        return { data, total, page, limit };
    }

    async getOfferById(id: string) {
        return this.prisma.offerManagement.findUnique({ where: { id } });
    }

    async updateOfferStatus(id: string, status: string, data?: {
        rejectionReason?: string;
        signedOfferUrl?: string;
    }) {
        const updateData: Prisma.OfferManagementUpdateInput = { status };

        if (status === 'sent') updateData.sentAt = new Date();
        if (status === 'accepted') updateData.acceptedAt = new Date();
        if (status === 'rejected') {
            updateData.rejectedAt = new Date();
            if (data?.rejectionReason) updateData.rejectionReason = data.rejectionReason;
        }
        if (data?.signedOfferUrl) updateData.signedOfferUrl = data.signedOfferUrl;

        return this.prisma.offerManagement.update({
            where: { id },
            data: updateData,
        });
    }

    // ============================================================================
    // Document Collection
    // ============================================================================

    async addDocument(data: {
        onboardingId: string;
        documentType: string;
        documentName: string;
        description?: string;
        isMandatory?: boolean;
        companyId: string;
    }) {
        return this.prisma.documentCollection.create({ data });
    }

    async getDocuments(onboardingId: string) {
        return this.prisma.documentCollection.findMany({
            where: { onboardingId, isActive: true },
            orderBy: { createdAt: 'asc' },
        });
    }

    async updateDocumentStatus(id: string, status: string, data?: {
        documentUrl?: string;
        verifiedBy?: string;
        rejectionReason?: string;
    }) {
        const updateData: Prisma.DocumentCollectionUpdateInput = { status };

        if (status === 'submitted') updateData.submittedAt = new Date();
        if (status === 'verified') {
            updateData.verifiedAt = new Date();
            if (data?.verifiedBy) updateData.verifiedBy = data.verifiedBy;
        }
        if (status === 'rejected' && data?.rejectionReason) {
            updateData.rejectionReason = data.rejectionReason;
        }
        if (data?.documentUrl) updateData.documentUrl = data.documentUrl;

        return this.prisma.documentCollection.update({
            where: { id },
            data: updateData,
        });
    }

    // ============================================================================
    // Background Verification
    // ============================================================================

    async initiateVerification(data: {
        onboardingId: string;
        verificationType: string;
        verificationName: string;
        vendorName?: string;
        vendorReferenceNo?: string;
        companyId: string;
    }) {
        return this.prisma.backgroundVerification.create({
            data: {
                ...data,
                status: 'in_progress',
                initiatedAt: new Date(),
            },
        });
    }

    async updateVerificationStatus(id: string, status: string, data?: {
        result?: string;
        findings?: Prisma.InputJsonValue;
        reportUrl?: string;
        remarks?: string;
    }) {
        const updateData: Prisma.BackgroundVerificationUpdateInput = { status };

        if (status === 'completed' || status === 'failed') {
            updateData.completedAt = new Date();
        }
        if (data?.result) updateData.result = data.result;
        if (data?.findings) updateData.findings = data.findings;
        if (data?.reportUrl) updateData.reportUrl = data.reportUrl;
        if (data?.remarks) updateData.remarks = data.remarks;

        return this.prisma.backgroundVerification.update({
            where: { id },
            data: updateData,
        });
    }

    // ============================================================================
    // Medical Checkup
    // ============================================================================

    async scheduleMedicalCheckup(data: {
        onboardingId: string;
        checkupType?: string;
        scheduledDate: Date;
        hospitalName?: string;
        companyId: string;
    }) {
        return this.prisma.medicalCheckup.create({ data });
    }

    async updateMedicalCheckup(id: string, data: {
        completedDate?: Date;
        doctorName?: string;
        status?: string;
        result?: string;
        conditions?: string;
        reportUrl?: string;
        validUntil?: Date;
    }) {
        return this.prisma.medicalCheckup.update({
            where: { id },
            data,
        });
    }

    // ============================================================================
    // First Day Setup
    // ============================================================================

    async createFirstDaySetup(data: {
        employeeId: string;
        setupDate: Date;
        deskLocation?: string;
        buddyEmployeeId?: string;
        companyId: string;
    }) {
        return this.prisma.firstDaySetup.create({ data });
    }

    async updateFirstDaySetup(id: string, data: Partial<{
        workstationReady: boolean;
        laptopAssigned: boolean;
        assetTag: string;
        deskLocation: string;
        parkingAssigned: boolean;
        parkingSlot: string;
        accessCardIssued: boolean;
        accessCardNumber: string;
        buddyAssigned: boolean;
        introductionsDone: boolean;
        hrMeetingDone: boolean;
        managerMeetingDone: boolean;
        status: string;
    }>) {
        const updateData = { ...data } as Prisma.FirstDaySetupUpdateInput;
        if (data.status === 'completed') {
            updateData.completedAt = new Date();
        }
        return this.prisma.firstDaySetup.update({
            where: { id },
            data: updateData,
        });
    }

    // ============================================================================
    // ID Card Request
    // ============================================================================

    async createIDCardRequest(data: {
        employeeId: string;
        employeeName: string;
        employeeCode: string;
        departmentId?: string;
        designationId?: string;
        photoUrl?: string;
        cardType?: string;
        requestReason?: string;
        companyId: string;
    }) {
        const count = await this.prisma.iDCardRequest.count({
            where: { companyId: data.companyId },
        });
        const requestNumber = `IDC-${String(count + 1).padStart(5, '0')}`;

        return this.prisma.iDCardRequest.create({
            data: {
                requestNumber,
                ...data,
            },
        });
    }

    async updateIDCardRequest(id: string, data: Partial<{
        status: string;
        approvedBy: string;
        cardNumber: string;
        validFrom: Date;
        validUntil: Date;
    }>) {
        const updateData = { ...data } as Prisma.IDCardRequestUpdateInput;

        if (data.status === 'approved') updateData.approvedAt = new Date();
        if (data.status === 'printed') updateData.printedAt = new Date();
        if (data.status === 'delivered') updateData.deliveredAt = new Date();

        return this.prisma.iDCardRequest.update({
            where: { id },
            data: updateData,
        });
    }

    // ============================================================================
    // System Access Request
    // ============================================================================

    async createSystemAccessRequest(data: {
        employeeId: string;
        employeeName: string;
        requestType?: string;
        systems: Prisma.InputJsonValue;
        accessLevel?: string;
        justification?: string;
        requestedBy?: string;
        companyId: string;
    }) {
        const count = await this.prisma.systemAccessRequest.count({
            where: { companyId: data.companyId },
        });
        const requestNumber = `SAR-${String(count + 1).padStart(5, '0')}`;

        return this.prisma.systemAccessRequest.create({
            data: {
                requestNumber,
                ...data,
            },
        });
    }

    async updateSystemAccessRequest(id: string, data: Partial<{
        status: string;
        approvedBy: string;
        provisionedBy: string;
        emailCreated: boolean;
        adAccountCreated: boolean;
        vpnAccessGranted: boolean;
        erpAccessGranted: boolean;
        accountCredentials: Prisma.InputJsonValue;
    }>) {
        const updateData = { ...data } as Prisma.SystemAccessRequestUpdateInput;

        if (data.status === 'approved') updateData.approvedAt = new Date();
        if (data.status === 'provisioned' || data.status === 'completed') {
            updateData.provisionedAt = new Date();
        }

        return this.prisma.systemAccessRequest.update({
            where: { id },
            data: updateData,
        });
    }

    // ============================================================================
    // Welcome Kit
    // ============================================================================

    async createWelcomeKit(data: {
        employeeId: string;
        employeeName: string;
        kitType?: string;
        items: Prisma.InputJsonValue;
        deliveryAddress?: string;
        companyId: string;
    }) {
        const count = await this.prisma.welcomeKit.count({
            where: { companyId: data.companyId },
        });
        const kitNumber = `WK-${String(count + 1).padStart(5, '0')}`;

        return this.prisma.welcomeKit.create({
            data: {
                kitNumber,
                ...data,
            },
        });
    }

    async updateWelcomeKit(id: string, data: Partial<{
        status: string;
        preparedBy: string;
        trackingNumber: string;
        acknowledgementUrl: string;
    }>) {
        const updateData = { ...data } as Prisma.WelcomeKitUpdateInput;

        if (data.status === 'ready') updateData.preparedAt = new Date();
        if (data.status === 'dispatched') updateData.dispatchedAt = new Date();
        if (data.status === 'delivered') updateData.deliveredAt = new Date();

        return this.prisma.welcomeKit.update({
            where: { id },
            data: updateData,
        });
    }

    // ============================================================================
    // Orientation Schedule
    // ============================================================================

    async scheduleOrientation(data: {
        onboardingId?: string;
        employeeId: string;
        orientationType: string;
        title: string;
        description?: string;
        scheduledDate: Date;
        scheduledTime?: string;
        duration?: number;
        location?: string;
        conductedBy?: string;
        conductorName?: string;
        materialsUrl?: string;
        companyId: string;
    }) {
        return this.prisma.orientationSchedule.create({ data });
    }

    async getOrientationSchedule(employeeId: string) {
        return this.prisma.orientationSchedule.findMany({
            where: { employeeId, isActive: true },
            orderBy: { scheduledDate: 'asc' },
        });
    }

    async updateOrientation(id: string, data: Partial<{
        status: string;
        attendanceMarked: boolean;
        feedback: string;
        feedbackRating: number;
        certificateUrl: string;
    }>) {
        const updateData = { ...data } as Prisma.OrientationScheduleUpdateInput;

        if (data.status === 'completed') updateData.completedAt = new Date();

        return this.prisma.orientationSchedule.update({
            where: { id },
            data: updateData,
        });
    }

    // ============================================================================
    // Onboarding Checklist
    // ============================================================================

    async addChecklistItem(data: {
        onboardingId: string;
        category: string;
        itemName: string;
        description?: string;
        isMandatory?: boolean;
        assignedTo?: string;
        assignedToName?: string;
        dueDate?: Date;
        sortOrder?: number;
        companyId: string;
    }) {
        return this.prisma.onboardingChecklistItem.create({ data });
    }

    async getChecklist(onboardingId: string) {
        return this.prisma.onboardingChecklistItem.findMany({
            where: { onboardingId, isActive: true },
            orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
        });
    }

    async updateChecklistItem(id: string, data: Partial<{
        status: string;
        completedBy: string;
        evidence: string;
        remarks: string;
    }>) {
        const updateData = { ...data } as Prisma.OnboardingChecklistItemUpdateInput;

        if (data.status === 'completed') updateData.completedAt = new Date();

        return this.prisma.onboardingChecklistItem.update({
            where: { id },
            data: updateData,
        });
    }

    // ============================================================================
    // Dashboard Statistics
    // ============================================================================

    async getOnboardingDashboard(companyId: string) {
        const [
            totalOnboarding,
            byStatus,
            byStage,
            pendingDocuments,
            pendingBGV,
            upcomingJoinings,
        ] = await Promise.all([
            this.prisma.onboardingProcess.count({
                where: { companyId, isActive: true },
            }),
            this.prisma.onboardingProcess.groupBy({
                by: ['status'],
                where: { companyId, isActive: true },
                _count: { id: true },
            }),
            this.prisma.onboardingProcess.groupBy({
                by: ['currentStage'],
                where: { companyId, isActive: true, status: 'in_progress' },
                _count: { id: true },
            }),
            this.prisma.documentCollection.count({
                where: {
                    companyId,
                    isActive: true,
                    status: 'pending',
                    isMandatory: true,
                },
            }),
            this.prisma.backgroundVerification.count({
                where: {
                    companyId,
                    isActive: true,
                    status: { in: ['pending', 'in_progress'] },
                },
            }),
            this.prisma.onboardingProcess.findMany({
                where: {
                    companyId,
                    isActive: true,
                    status: { in: ['pending', 'in_progress'] },
                    expectedJoiningDate: {
                        gte: new Date(),
                        lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                    },
                },
                orderBy: { expectedJoiningDate: 'asc' },
                take: 10,
            }),
        ]);

        return {
            totalOnboarding,
            byStatus: byStatus.reduce((acc, item) => {
                acc[item.status] = item._count.id;
                return acc;
            }, {} as Record<string, number>),
            byStage: byStage.reduce((acc, item) => {
                acc[item.currentStage] = item._count.id;
                return acc;
            }, {} as Record<string, number>),
            pendingDocuments,
            pendingBGV,
            upcomingJoinings,
        };
    }
}
