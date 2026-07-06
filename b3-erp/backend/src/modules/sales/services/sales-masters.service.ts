import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SalesMastersService {
    constructor(private prisma: PrismaService) { }

    private generateNumber(prefix: string, counter: number): string {
        const year = new Date().getFullYear();
        return `${prefix}-${year}-${String(counter).padStart(5, '0')}`;
    }

    // ============================================================================
    // SALES INVOICES
    // ============================================================================

    async findAllInvoices(companyId: string, filters?: {
        type?: string;
        status?: string;
        customerId?: string;
        vendorId?: string;
        fromDate?: string;
        toDate?: string;
        search?: string;
        page?: number;
        limit?: number;
    }) {
        const where: any = { companyId };

        if (filters?.type) where.invoiceType = filters.type;
        if (filters?.status) where.status = filters.status;
        if (filters?.customerId) where.customerId = filters.customerId;
        if (filters?.vendorId) where.vendorId = filters.vendorId;
        if (filters?.fromDate) where.invoiceDate = { ...where.invoiceDate, gte: new Date(filters.fromDate) };
        if (filters?.toDate) where.invoiceDate = { ...where.invoiceDate, lte: new Date(filters.toDate) };
        if (filters?.search) {
            where.OR = [
                { invoiceNumber: { contains: filters.search, mode: 'insensitive' } },
                { customerName: { contains: filters.search, mode: 'insensitive' } },
            ];
        }

        const page = filters?.page || 1;
        const limit = filters?.limit || 20;
        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            this.prisma.salesInvoice.findMany({
                where,
                include: { items: true, payments: true },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.salesInvoice.count({ where }),
        ]);

        return { data, total, page, limit };
    }

    async findInvoiceById(id: string) {
        const invoice = await this.prisma.salesInvoice.findUnique({
            where: { id },
            include: { items: true, payments: true },
        });
        if (!invoice) throw new NotFoundException('Invoice not found');
        return invoice;
    }

    async createInvoice(data: any) {
        const count = await this.prisma.salesInvoice.count({ where: { companyId: data.companyId } });
        const invoiceNumber = this.generateNumber('INV', count + 1);

        // Calculate line items
        const items = data.items?.map((item: any, index: number) => {
            const lineTotal = item.quantity * item.unitPrice;
            const discountAmount = lineTotal * (item.discountPercent || 0) / 100;
            const taxableAmount = lineTotal - discountAmount;
            const taxAmount = taxableAmount * (item.taxRate || 0) / 100;
            return {
                lineNumber: index + 1,
                ...item,
                discountAmount,
                taxAmount,
                lineTotal: taxableAmount + taxAmount,
            };
        }) || [];

        const subtotal = items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0);
        const totalDiscount = items.reduce((sum: number, item: any) => sum + item.discountAmount, 0);
        const totalTax = items.reduce((sum: number, item: any) => sum + item.taxAmount, 0);
        const totalAmount = subtotal - totalDiscount + totalTax + (data.shippingAmount || 0);

        return this.prisma.salesInvoice.create({
            data: {
                ...data,
                invoiceNumber,
                subtotal,
                totalDiscount,
                totalTax,
                totalAmount,
                amountDue: totalAmount - (data.amountPaid || 0),
                items: { create: items },
            },
            include: { items: true },
        });
    }

    async updateInvoice(id: string, data: any) {
        const existing = await this.findInvoiceById(id);
        if (existing.status !== 'draft') {
            throw new BadRequestException('Only draft invoices can be updated');
        }

        const { items, ...invoiceData } = data;

        if (items) {
            await this.prisma.salesInvoiceItem.deleteMany({ where: { invoiceId: id } });

            const newItems = items.map((item: any, index: number) => {
                const lineTotal = item.quantity * item.unitPrice;
                const discountAmount = lineTotal * (item.discountPercent || 0) / 100;
                const taxableAmount = lineTotal - discountAmount;
                const taxAmount = taxableAmount * (item.taxRate || 0) / 100;
                return {
                    invoiceId: id,
                    lineNumber: index + 1,
                    ...item,
                    discountAmount,
                    taxAmount,
                    lineTotal: taxableAmount + taxAmount,
                };
            });

            await this.prisma.salesInvoiceItem.createMany({ data: newItems });

            const subtotal = newItems.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0);
            const totalDiscount = newItems.reduce((sum: number, item: any) => sum + item.discountAmount, 0);
            const totalTax = newItems.reduce((sum: number, item: any) => sum + item.taxAmount, 0);
            const totalAmount = subtotal - totalDiscount + totalTax;

            invoiceData.subtotal = subtotal;
            invoiceData.totalDiscount = totalDiscount;
            invoiceData.totalTax = totalTax;
            invoiceData.totalAmount = totalAmount;
            invoiceData.amountDue = totalAmount - (existing.amountPaid || 0);
        }

        return this.prisma.salesInvoice.update({
            where: { id },
            data: invoiceData,
            include: { items: true },
        });
    }

    async submitInvoice(id: string, userId?: string) {
        const invoice = await this.findInvoiceById(id);
        if (invoice.status !== 'draft') {
            throw new BadRequestException('Only draft invoices can be submitted');
        }
        return this.prisma.salesInvoice.update({
            where: { id },
            data: {
                status: 'pending_approval',
                submittedAt: new Date(),
                submittedBy: userId,
            },
        });
    }

    async approveInvoice(id: string, userId?: string) {
        const invoice = await this.findInvoiceById(id);
        if (invoice.status !== 'pending_approval') {
            throw new BadRequestException('Only pending invoices can be approved');
        }
        return this.prisma.salesInvoice.update({
            where: { id },
            data: {
                status: 'approved',
                approvedAt: new Date(),
                approvedBy: userId,
            },
        });
    }

    async postInvoice(id: string, userId?: string) {
        const invoice = await this.findInvoiceById(id);
        if (invoice.status !== 'approved') {
            throw new BadRequestException('Only approved invoices can be posted');
        }
        return this.prisma.salesInvoice.update({
            where: { id },
            data: {
                status: 'posted',
                postedAt: new Date(),
                postedBy: userId,
            },
        });
    }

    async recordPayment(invoiceId: string, paymentData: any) {
        const invoice = await this.findInvoiceById(invoiceId);

        const count = await this.prisma.invoicePayment.count({ where: { companyId: paymentData.companyId } });
        const paymentNumber = this.generateNumber('PAY', count + 1);

        const payment = await this.prisma.invoicePayment.create({
            data: {
                ...paymentData,
                paymentNumber,
                invoiceId,
            },
        });

        const newAmountPaid = invoice.amountPaid + paymentData.amount;
        const newAmountDue = invoice.totalAmount - newAmountPaid;

        await this.prisma.salesInvoice.update({
            where: { id: invoiceId },
            data: {
                amountPaid: newAmountPaid,
                amountDue: newAmountDue,
                status: newAmountDue <= 0 ? 'paid' : 'partially_paid',
                paidAt: newAmountDue <= 0 ? new Date() : undefined,
            },
        });

        return payment;
    }

    async getInvoiceStats(companyId: string) {
        const invoices = await this.prisma.salesInvoice.findMany({
            where: { companyId, invoiceType: 'sales' },
        });

        const byStatus: Record<string, number> = {};
        invoices.forEach(inv => {
            byStatus[inv.status] = (byStatus[inv.status] || 0) + 1;
        });

        const totalAmount = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
        const paidAmount = invoices.reduce((sum, inv) => sum + inv.amountPaid, 0);
        const overdueInvoices = invoices.filter(inv => inv.status === 'overdue');

        return {
            totalInvoices: invoices.length,
            totalAmount,
            paidAmount,
            pendingAmount: totalAmount - paidAmount,
            overdueAmount: overdueInvoices.reduce((sum, inv) => sum + inv.amountDue, 0),
            byStatus,
        };
    }

    async deleteInvoice(id: string) {
        const invoice = await this.findInvoiceById(id);
        if (invoice.status !== 'draft') {
            throw new BadRequestException('Only draft invoices can be deleted');
        }
        await this.prisma.salesInvoice.delete({ where: { id } });
    }

    // ============================================================================
    // DELIVERY NOTES
    // ============================================================================

    async findAllDeliveryNotes(companyId: string, filters?: {
        status?: string;
        customerId?: string;
        orderId?: string;
        dateFrom?: string;
        dateTo?: string;
        search?: string;
    }) {
        const where: any = { companyId };

        if (filters?.status) where.status = filters.status;
        if (filters?.customerId) where.customerId = filters.customerId;
        if (filters?.orderId) where.orderId = filters.orderId;
        if (filters?.dateFrom) where.deliveryDate = { ...where.deliveryDate, gte: new Date(filters.dateFrom) };
        if (filters?.dateTo) where.deliveryDate = { ...where.deliveryDate, lte: new Date(filters.dateTo) };
        if (filters?.search) {
            where.OR = [
                { deliveryNoteNumber: { contains: filters.search, mode: 'insensitive' } },
                { customerName: { contains: filters.search, mode: 'insensitive' } },
            ];
        }

        const data = await this.prisma.deliveryNote.findMany({
            where,
            include: { items: true },
            orderBy: { createdAt: 'desc' },
        });

        return { data, total: data.length };
    }

    async findDeliveryNoteById(id: string) {
        const note = await this.prisma.deliveryNote.findUnique({
            where: { id },
            include: { items: true },
        });
        if (!note) throw new NotFoundException('Delivery note not found');
        return note;
    }

    async createDeliveryNote(data: any) {
        const count = await this.prisma.deliveryNote.count({ where: { companyId: data.companyId } });
        const deliveryNoteNumber = this.generateNumber('DN', count + 1);

        const items = data.items?.map((item: any, index: number) => ({
            lineNumber: index + 1,
            ...item,
        })) || [];

        return this.prisma.deliveryNote.create({
            data: {
                ...data,
                deliveryNoteNumber,
                totalItems: items.length,
                totalDeliveredQty: items.reduce((sum: number, item: any) => sum + item.deliveredQuantity, 0),
                items: { create: items },
            },
            include: { items: true },
        });
    }

    async updateDeliveryNote(id: string, data: any) {
        const { items, ...noteData } = data;

        if (items) {
            await this.prisma.deliveryNoteItem.deleteMany({ where: { deliveryNoteId: id } });

            const newItems = items.map((item: any, index: number) => ({
                deliveryNoteId: id,
                lineNumber: index + 1,
                ...item,
            }));

            await this.prisma.deliveryNoteItem.createMany({ data: newItems });

            noteData.totalItems = newItems.length;
            noteData.totalDeliveredQty = newItems.reduce((sum: number, item: any) => sum + item.deliveredQuantity, 0);
        }

        return this.prisma.deliveryNote.update({
            where: { id },
            data: noteData,
            include: { items: true },
        });
    }

    async issueDeliveryNote(id: string) {
        return this.updateDeliveryNote(id, { status: 'issued' });
    }

    async acknowledgeDeliveryNote(id: string, receivedBy: string, signatureUrl?: string) {
        return this.prisma.deliveryNote.update({
            where: { id },
            data: {
                status: 'acknowledged',
                receivedBy,
                receivedDate: new Date(),
                signatureUrl,
            },
        });
    }

    async deleteDeliveryNote(id: string) {
        const note = await this.findDeliveryNoteById(id);
        if (note.status !== 'draft') {
            throw new BadRequestException('Only draft delivery notes can be deleted');
        }
        await this.prisma.deliveryNote.delete({ where: { id } });
    }

    // ============================================================================
    // SHIPMENTS
    // ============================================================================

    async findAllShipments(companyId: string, filters?: {
        status?: string;
        customerId?: string;
        orderId?: string;
        carrier?: string;
        search?: string;
    }) {
        const where: any = { companyId };

        if (filters?.status) where.status = filters.status;
        if (filters?.customerId) where.customerId = filters.customerId;
        if (filters?.orderId) where.orderId = filters.orderId;
        if (filters?.carrier) where.carrier = filters.carrier;
        if (filters?.search) {
            where.OR = [
                { shipmentNumber: { contains: filters.search, mode: 'insensitive' } },
                { trackingNumber: { contains: filters.search, mode: 'insensitive' } },
            ];
        }

        return this.prisma.shipment.findMany({
            where,
            include: { trackingHistory: true, deliveryNotes: true },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findShipmentById(id: string) {
        const shipment = await this.prisma.shipment.findUnique({
            where: { id },
            include: { trackingHistory: true, deliveryNotes: true },
        });
        if (!shipment) throw new NotFoundException('Shipment not found');
        return shipment;
    }

    async createShipment(data: any) {
        const count = await this.prisma.shipment.count({ where: { companyId: data.companyId } });
        const shipmentNumber = this.generateNumber('SHP', count + 1);

        return this.prisma.shipment.create({
            data: {
                ...data,
                shipmentNumber,
            },
        });
    }

    async updateShipment(id: string, data: any) {
        return this.prisma.shipment.update({
            where: { id },
            data,
            include: { trackingHistory: true },
        });
    }

    async addTrackingEvent(shipmentId: string, data: {
        status: string;
        statusDescription?: string;
        location?: string;
        notes?: string;
        updatedBy?: string;
    }) {
        const tracking = await this.prisma.shipmentTracking.create({
            data: {
                shipmentId,
                ...data,
            },
        });

        await this.prisma.shipment.update({
            where: { id: shipmentId },
            data: { status: data.status },
        });

        return tracking;
    }

    async deleteShipment(id: string) {
        const shipment = await this.findShipmentById(id);
        if (shipment.status !== 'pending') {
            throw new BadRequestException('Only pending shipments can be deleted');
        }
        await this.prisma.shipment.delete({ where: { id } });
    }

    // ============================================================================
    // SALES RETURNS
    // ============================================================================

    async findAllReturns(companyId: string, filters?: {
        status?: string;
        customerId?: string;
        orderId?: string;
        returnType?: string;
        search?: string;
    }) {
        const where: any = { companyId };

        if (filters?.status) where.status = filters.status;
        if (filters?.customerId) where.customerId = filters.customerId;
        if (filters?.orderId) where.orderId = filters.orderId;
        if (filters?.returnType) where.returnType = filters.returnType;
        if (filters?.search) {
            where.OR = [
                { returnNumber: { contains: filters.search, mode: 'insensitive' } },
                { customerName: { contains: filters.search, mode: 'insensitive' } },
            ];
        }

        return this.prisma.salesReturn.findMany({
            where,
            include: { items: true },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findReturnById(id: string) {
        const salesReturn = await this.prisma.salesReturn.findUnique({
            where: { id },
            include: { items: true },
        });
        if (!salesReturn) throw new NotFoundException('Sales return not found');
        return salesReturn;
    }

    async createReturn(data: any) {
        const count = await this.prisma.salesReturn.count({ where: { companyId: data.companyId } });
        const returnNumber = this.generateNumber('RET', count + 1);
        const raNumber = this.generateNumber('RA', count + 1);

        const items = data.items?.map((item: any, index: number) => ({
            lineNumber: index + 1,
            ...item,
            lineTotal: item.returnQuantity * item.unitPrice,
            refundAmount: item.returnQuantity * item.unitPrice,
        })) || [];

        const subtotal = items.reduce((sum: number, item: any) => sum + item.lineTotal, 0);
        const totalRefundAmount = subtotal - (data.restockingFee || 0) + (data.shippingRefund || 0);

        return this.prisma.salesReturn.create({
            data: {
                ...data,
                returnNumber,
                raNumber,
                raExpiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                subtotal,
                totalRefundAmount,
                items: { create: items },
            },
            include: { items: true },
        });
    }

    async updateReturn(id: string, data: any) {
        const { items, ...returnData } = data;

        if (items) {
            await this.prisma.salesReturnItem.deleteMany({ where: { returnId: id } });

            const newItems = items.map((item: any, index: number) => ({
                returnId: id,
                lineNumber: index + 1,
                ...item,
                lineTotal: item.returnQuantity * item.unitPrice,
                refundAmount: item.returnQuantity * item.unitPrice,
            }));

            await this.prisma.salesReturnItem.createMany({ data: newItems });

            const subtotal = newItems.reduce((sum: number, item: any) => sum + item.lineTotal, 0);
            returnData.subtotal = subtotal;
            returnData.totalRefundAmount = subtotal - (returnData.restockingFee || 0) + (returnData.shippingRefund || 0);
        }

        return this.prisma.salesReturn.update({
            where: { id },
            data: returnData,
            include: { items: true },
        });
    }

    async approveReturn(id: string, userId?: string) {
        return this.prisma.salesReturn.update({
            where: { id },
            data: {
                status: 'approved',
                approvedAt: new Date(),
                approvedBy: userId,
            },
        });
    }

    async rejectReturn(id: string, reason: string, userId?: string) {
        return this.prisma.salesReturn.update({
            where: { id },
            data: {
                status: 'rejected',
                rejectedAt: new Date(),
                rejectionReason: reason,
            },
        });
    }

    async receiveReturn(id: string, userId?: string) {
        return this.prisma.salesReturn.update({
            where: { id },
            data: {
                status: 'received',
                receivedAt: new Date(),
                receivedBy: userId,
            },
        });
    }

    async completeReturn(id: string, refundData?: { refundMethod?: string; refundReference?: string }) {
        return this.prisma.salesReturn.update({
            where: { id },
            data: {
                status: 'completed',
                completedAt: new Date(),
                refundStatus: 'completed',
                refundedAt: new Date(),
                ...refundData,
            },
        });
    }

    async deleteReturn(id: string) {
        const salesReturn = await this.findReturnById(id);
        if (salesReturn.status !== 'pending') {
            throw new BadRequestException('Only pending returns can be deleted');
        }
        await this.prisma.salesReturn.delete({ where: { id } });
    }

    // ============================================================================
    // SALES PRICING
    // ============================================================================

    async findAllPricing(companyId: string, filters?: {
        pricingType?: string;
        itemId?: string;
        customerId?: string;
        isActive?: boolean;
    }) {
        const where: any = { companyId };

        if (filters?.pricingType) where.pricingType = filters.pricingType;
        if (filters?.itemId) where.itemId = filters.itemId;
        if (filters?.customerId) where.customerId = filters.customerId;
        if (filters?.isActive !== undefined) where.isActive = filters.isActive;

        return this.prisma.salesPricing.findMany({
            where,
            orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
        });
    }

    async createPricing(data: any) {
        const finalPrice = data.discountType === 'percentage'
            ? data.basePrice * (1 - data.discountValue / 100)
            : data.basePrice - (data.discountValue || 0);

        return this.prisma.salesPricing.create({
            data: {
                ...data,
                finalPrice,
            },
        });
    }

    async updatePricing(id: string, data: any) {
        if (data.basePrice || data.discountType || data.discountValue) {
            const existing = await this.prisma.salesPricing.findUnique({ where: { id } });
            const basePrice = data.basePrice || existing?.basePrice || 0;
            const discountType = data.discountType || existing?.discountType;
            const discountValue = data.discountValue ?? existing?.discountValue ?? 0;

            data.finalPrice = discountType === 'percentage'
                ? basePrice * (1 - discountValue / 100)
                : basePrice - discountValue;
        }

        return this.prisma.salesPricing.update({
            where: { id },
            data,
        });
    }

    async deletePricing(id: string) {
        await this.prisma.salesPricing.delete({ where: { id } });
    }

    // ============================================================================
    // SALES PROMOTIONS
    // ============================================================================

    async findAllPromotions(companyId: string, filters?: {
        isActive?: boolean;
        promotionType?: string;
    }) {
        const where: any = { companyId };

        if (filters?.isActive !== undefined) where.isActive = filters.isActive;
        if (filters?.promotionType) where.promotionType = filters.promotionType;

        return this.prisma.salesPromotion.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });
    }

    async findPromotionByCode(code: string, companyId: string) {
        return this.prisma.salesPromotion.findUnique({
            where: { promotionCode_companyId: { promotionCode: code, companyId } },
        });
    }

    async createPromotion(data: any) {
        return this.prisma.salesPromotion.create({ data });
    }

    async updatePromotion(id: string, data: any) {
        return this.prisma.salesPromotion.update({
            where: { id },
            data,
        });
    }

    async deletePromotion(id: string) {
        await this.prisma.salesPromotion.delete({ where: { id } });
    }

    // ============================================================================
    // SALES TARGETS
    // ============================================================================

    async findAllTargets(companyId: string, filters?: {
        targetType?: string;
        salesPersonId?: string;
        periodYear?: number;
        periodType?: string;
    }) {
        const where: any = { companyId };

        if (filters?.targetType) where.targetType = filters.targetType;
        if (filters?.salesPersonId) where.salesPersonId = filters.salesPersonId;
        if (filters?.periodYear) where.periodYear = filters.periodYear;
        if (filters?.periodType) where.periodType = filters.periodType;

        return this.prisma.salesTarget.findMany({
            where,
            orderBy: [{ periodYear: 'desc' }, { createdAt: 'desc' }],
        });
    }

    async createTarget(data: any) {
        return this.prisma.salesTarget.create({ data });
    }

    async updateTarget(id: string, data: any) {
        // Calculate achievements if actuals are updated
        const existing = await this.prisma.salesTarget.findUnique({ where: { id } });
        if (existing) {
            const revenueActual = data.revenueActual ?? existing.revenueActual;
            const ordersActual = data.ordersActual ?? existing.ordersActual;
            const newCustomersActual = data.newCustomersActual ?? existing.newCustomersActual;

            if (existing.revenueTarget > 0) {
                data.revenueAchievement = (revenueActual / existing.revenueTarget) * 100;
            }
            if (existing.ordersTarget > 0) {
                data.ordersAchievement = (ordersActual / existing.ordersTarget) * 100;
            }
            if (existing.newCustomersTarget > 0) {
                data.newCustomersAchievement = (newCustomersActual / existing.newCustomersTarget) * 100;
            }
        }

        return this.prisma.salesTarget.update({
            where: { id },
            data,
        });
    }

    async deleteTarget(id: string) {
        await this.prisma.salesTarget.delete({ where: { id } });
    }

    // ============================================================================
    // SALES ANALYTICS
    // ============================================================================

    async getAnalytics(companyId: string, dimension: string = 'monthly', dateRange?: {
        from?: string;
        to?: string;
    }) {
        const where: any = { companyId, dimension };

        if (dateRange?.from) where.dimensionDate = { ...where.dimensionDate, gte: new Date(dateRange.from) };
        if (dateRange?.to) where.dimensionDate = { ...where.dimensionDate, lte: new Date(dateRange.to) };

        return this.prisma.salesAnalytics.findMany({
            where,
            orderBy: { dimensionDate: 'desc' },
        });
    }

    async upsertAnalytics(data: any) {
        return this.prisma.salesAnalytics.upsert({
            where: {
                dimension_dimensionDate_companyId: {
                    dimension: data.dimension,
                    dimensionDate: new Date(data.dimensionDate),
                    companyId: data.companyId,
                },
            },
            update: data,
            create: data,
        });
    }

    // ============================================================================
    // SALES QUOTATIONS (Prisma)
    // ============================================================================

    async findAllQuotationsPrisma(companyId: string, filters?: {
        status?: string;
        customerId?: string;
        salesPersonId?: string;
        search?: string;
    }) {
        const where: any = { companyId };

        if (filters?.status) where.status = filters.status;
        if (filters?.customerId) where.customerId = filters.customerId;
        if (filters?.salesPersonId) where.salesPersonId = filters.salesPersonId;
        if (filters?.search) {
            where.OR = [
                { quotationNumber: { contains: filters.search, mode: 'insensitive' } },
                { customerName: { contains: filters.search, mode: 'insensitive' } },
            ];
        }

        return this.prisma.salesQuotation.findMany({
            where,
            include: { items: true },
            orderBy: { createdAt: 'desc' },
        });
    }

    async createQuotationPrisma(data: any) {
        const count = await this.prisma.salesQuotation.count({ where: { companyId: data.companyId } });
        const quotationNumber = this.generateNumber('QT', count + 1);

        const items = data.items?.map((item: any, index: number) => {
            const lineTotal = item.quantity * item.unitPrice;
            const discountAmount = lineTotal * (item.discountPercent || 0) / 100;
            const taxableAmount = lineTotal - discountAmount;
            const taxAmount = taxableAmount * (item.taxRate || 0) / 100;
            return {
                lineNumber: index + 1,
                ...item,
                discountAmount,
                taxAmount,
                lineTotal: taxableAmount + taxAmount,
            };
        }) || [];

        const subtotal = items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0);
        const discountAmount = items.reduce((sum: number, item: any) => sum + item.discountAmount, 0);
        const taxAmount = items.reduce((sum: number, item: any) => sum + item.taxAmount, 0);
        const totalAmount = subtotal - discountAmount + taxAmount;

        return this.prisma.salesQuotation.create({
            data: {
                ...data,
                quotationNumber,
                subtotal,
                discountAmount,
                taxAmount,
                totalAmount,
                items: { create: items },
            },
            include: { items: true },
        });
    }

    // ============================================================================
    // SALES ORDERS (Prisma)
    // ============================================================================

    async findAllOrdersPrisma(companyId: string, filters?: {
        status?: string;
        customerId?: string;
        salesPersonId?: string;
        orderType?: string;
        search?: string;
    }) {
        const where: any = { companyId };

        if (filters?.status) where.status = filters.status;
        if (filters?.customerId) where.customerId = filters.customerId;
        if (filters?.salesPersonId) where.salesPersonId = filters.salesPersonId;
        if (filters?.orderType) where.orderType = filters.orderType;
        if (filters?.search) {
            where.OR = [
                { orderNumber: { contains: filters.search, mode: 'insensitive' } },
                { customerName: { contains: filters.search, mode: 'insensitive' } },
            ];
        }

        return this.prisma.salesOrder.findMany({
            where,
            include: { items: true },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOrderByIdPrisma(id: string) {
        const order = await this.prisma.salesOrder.findUnique({
            where: { id },
            include: {
                items: { orderBy: { lineNumber: 'asc' } },
                invoices: true,
                deliveryNotes: true,
                shipments: true,
            },
        });
        if (!order) throw new NotFoundException(`Sales order ${id} not found`);
        return order;
    }

    async getOrderStatsPrisma(companyId: string) {
        const orders = await this.prisma.salesOrder.findMany({ where: { companyId } });
        const byStatus = (status: string) => orders.filter((o) => o.status === status).length;
        const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        const paidAmount = orders.reduce((sum, o) => sum + (o.paidAmount || 0), 0);
        return {
            totalOrders: orders.length,
            draftOrders: byStatus('draft'),
            pendingOrders: byStatus('pending'),
            confirmedOrders: byStatus('confirmed'),
            inProductionOrders: byStatus('in_production'),
            shippedOrders: byStatus('shipped'),
            deliveredOrders: byStatus('delivered'),
            cancelledOrders: byStatus('cancelled'),
            totalRevenue,
            averageOrderValue: orders.length ? totalRevenue / orders.length : 0,
            paidAmount,
            unpaidAmount: totalRevenue - paidAmount,
        };
    }

    async createOrderPrisma(data: any) {
        const count = await this.prisma.salesOrder.count({ where: { companyId: data.companyId } });
        const orderNumber = this.generateNumber('SO', count + 1);

        const items = data.items?.map((item: any, index: number) => {
            const lineTotal = item.quantity * item.unitPrice;
            const discountAmount = lineTotal * (item.discountPercent || 0) / 100;
            const taxableAmount = lineTotal - discountAmount;
            const taxAmount = taxableAmount * (item.taxRate || 0) / 100;
            return {
                lineNumber: index + 1,
                ...item,
                discountAmount,
                taxAmount,
                lineTotal: taxableAmount + taxAmount,
                pendingQuantity: item.quantity,
            };
        }) || [];

        const subtotal = items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0);
        const discountAmount = items.reduce((sum: number, item: any) => sum + item.discountAmount, 0);
        const taxAmount = items.reduce((sum: number, item: any) => sum + item.taxAmount, 0);
        const totalAmount = subtotal - discountAmount + taxAmount;

        return this.prisma.salesOrder.create({
            data: {
                ...data,
                orderNumber,
                subtotal,
                discountAmount,
                taxAmount,
                totalAmount,
                balanceAmount: totalAmount,
                items: { create: items },
            },
            include: { items: true },
        });
    }
}
