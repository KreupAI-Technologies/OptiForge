import {
    Controller,
    Get,
    Post,
    Put,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    Headers,
} from '@nestjs/common';
import { SalesMastersService } from '../services/sales-masters.service';

@Controller('sales-masters')
export class SalesMastersController {
    constructor(private readonly salesMastersService: SalesMastersService) { }

    // ============================================================================
    // SALES INVOICES
    // ============================================================================

    @Get('invoices')
    async findAllInvoices(
        @Headers('x-company-id') companyId: string,
        @Query('type') type?: string,
        @Query('status') status?: string,
        @Query('customerId') customerId?: string,
        @Query('vendorId') vendorId?: string,
        @Query('fromDate') fromDate?: string,
        @Query('toDate') toDate?: string,
        @Query('search') search?: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.salesMastersService.findAllInvoices(companyId, {
            type,
            status,
            customerId,
            vendorId,
            fromDate,
            toDate,
            search,
            page: page ? parseInt(page) : undefined,
            limit: limit ? parseInt(limit) : undefined,
        });
    }

    @Get('invoices/stats')
    async getInvoiceStats(@Headers('x-company-id') companyId: string) {
        return this.salesMastersService.getInvoiceStats(companyId);
    }

    @Get('invoices/:id')
    async findInvoiceById(@Param('id') id: string) {
        return this.salesMastersService.findInvoiceById(id);
    }

    @Post('invoices')
    async createInvoice(
        @Headers('x-company-id') companyId: string,
        @Body() data: any,
    ) {
        return this.salesMastersService.createInvoice({ ...data, companyId });
    }

    @Put('invoices/:id')
    async updateInvoice(@Param('id') id: string, @Body() data: any) {
        return this.salesMastersService.updateInvoice(id, data);
    }

    @Patch('invoices/:id/submit')
    async submitInvoice(
        @Param('id') id: string,
        @Headers('x-user-id') userId?: string,
    ) {
        return this.salesMastersService.submitInvoice(id, userId);
    }

    @Patch('invoices/:id/approve')
    async approveInvoice(
        @Param('id') id: string,
        @Headers('x-user-id') userId?: string,
    ) {
        return this.salesMastersService.approveInvoice(id, userId);
    }

    @Patch('invoices/:id/post')
    async postInvoice(
        @Param('id') id: string,
        @Headers('x-user-id') userId?: string,
    ) {
        return this.salesMastersService.postInvoice(id, userId);
    }

    @Post('invoices/:id/payments')
    async recordPayment(
        @Param('id') invoiceId: string,
        @Headers('x-company-id') companyId: string,
        @Body() paymentData: any,
    ) {
        return this.salesMastersService.recordPayment(invoiceId, { ...paymentData, companyId });
    }

    @Delete('invoices/:id')
    async deleteInvoice(@Param('id') id: string) {
        return this.salesMastersService.deleteInvoice(id);
    }

    // ============================================================================
    // DELIVERY NOTES
    // ============================================================================

    @Get('delivery-notes')
    async findAllDeliveryNotes(
        @Headers('x-company-id') companyId: string,
        @Query('status') status?: string,
        @Query('customerId') customerId?: string,
        @Query('orderId') orderId?: string,
        @Query('dateFrom') dateFrom?: string,
        @Query('dateTo') dateTo?: string,
        @Query('search') search?: string,
    ) {
        return this.salesMastersService.findAllDeliveryNotes(companyId, {
            status,
            customerId,
            orderId,
            dateFrom,
            dateTo,
            search,
        });
    }

    @Get('delivery-notes/:id')
    async findDeliveryNoteById(@Param('id') id: string) {
        return this.salesMastersService.findDeliveryNoteById(id);
    }

    @Post('delivery-notes')
    async createDeliveryNote(
        @Headers('x-company-id') companyId: string,
        @Body() data: any,
    ) {
        return this.salesMastersService.createDeliveryNote({ ...data, companyId });
    }

    @Put('delivery-notes/:id')
    async updateDeliveryNote(@Param('id') id: string, @Body() data: any) {
        return this.salesMastersService.updateDeliveryNote(id, data);
    }

    @Patch('delivery-notes/:id/issue')
    async issueDeliveryNote(@Param('id') id: string) {
        return this.salesMastersService.issueDeliveryNote(id);
    }

    @Patch('delivery-notes/:id/acknowledge')
    async acknowledgeDeliveryNote(
        @Param('id') id: string,
        @Body() data: { receivedBy: string; signatureUrl?: string },
    ) {
        return this.salesMastersService.acknowledgeDeliveryNote(id, data.receivedBy, data.signatureUrl);
    }

    @Delete('delivery-notes/:id')
    async deleteDeliveryNote(@Param('id') id: string) {
        return this.salesMastersService.deleteDeliveryNote(id);
    }

    // ============================================================================
    // SHIPMENTS
    // ============================================================================

    @Get('shipments')
    async findAllShipments(
        @Headers('x-company-id') companyId: string,
        @Query('status') status?: string,
        @Query('customerId') customerId?: string,
        @Query('orderId') orderId?: string,
        @Query('carrier') carrier?: string,
        @Query('search') search?: string,
    ) {
        return this.salesMastersService.findAllShipments(companyId, {
            status,
            customerId,
            orderId,
            carrier,
            search,
        });
    }

    @Get('shipments/:id')
    async findShipmentById(@Param('id') id: string) {
        return this.salesMastersService.findShipmentById(id);
    }

    @Post('shipments')
    async createShipment(
        @Headers('x-company-id') companyId: string,
        @Body() data: any,
    ) {
        return this.salesMastersService.createShipment({ ...data, companyId });
    }

    @Put('shipments/:id')
    async updateShipment(@Param('id') id: string, @Body() data: any) {
        return this.salesMastersService.updateShipment(id, data);
    }

    @Post('shipments/:id/tracking')
    async addTrackingEvent(
        @Param('id') shipmentId: string,
        @Body() data: {
            status: string;
            statusDescription?: string;
            location?: string;
            notes?: string;
            updatedBy?: string;
        },
    ) {
        return this.salesMastersService.addTrackingEvent(shipmentId, data);
    }

    @Delete('shipments/:id')
    async deleteShipment(@Param('id') id: string) {
        return this.salesMastersService.deleteShipment(id);
    }

    // ============================================================================
    // SALES RETURNS
    // ============================================================================

    @Get('returns')
    async findAllReturns(
        @Headers('x-company-id') companyId: string,
        @Query('status') status?: string,
        @Query('customerId') customerId?: string,
        @Query('orderId') orderId?: string,
        @Query('returnType') returnType?: string,
        @Query('search') search?: string,
    ) {
        return this.salesMastersService.findAllReturns(companyId, {
            status,
            customerId,
            orderId,
            returnType,
            search,
        });
    }

    @Get('returns/:id')
    async findReturnById(@Param('id') id: string) {
        return this.salesMastersService.findReturnById(id);
    }

    @Post('returns')
    async createReturn(
        @Headers('x-company-id') companyId: string,
        @Body() data: any,
    ) {
        return this.salesMastersService.createReturn({ ...data, companyId });
    }

    @Put('returns/:id')
    async updateReturn(@Param('id') id: string, @Body() data: any) {
        return this.salesMastersService.updateReturn(id, data);
    }

    @Patch('returns/:id/approve')
    async approveReturn(
        @Param('id') id: string,
        @Headers('x-user-id') userId?: string,
    ) {
        return this.salesMastersService.approveReturn(id, userId);
    }

    @Patch('returns/:id/reject')
    async rejectReturn(
        @Param('id') id: string,
        @Body() data: { reason: string },
        @Headers('x-user-id') userId?: string,
    ) {
        return this.salesMastersService.rejectReturn(id, data.reason, userId);
    }

    @Patch('returns/:id/receive')
    async receiveReturn(
        @Param('id') id: string,
        @Headers('x-user-id') userId?: string,
    ) {
        return this.salesMastersService.receiveReturn(id, userId);
    }

    @Patch('returns/:id/complete')
    async completeReturn(
        @Param('id') id: string,
        @Body() refundData?: { refundMethod?: string; refundReference?: string },
    ) {
        return this.salesMastersService.completeReturn(id, refundData);
    }

    @Delete('returns/:id')
    async deleteReturn(@Param('id') id: string) {
        return this.salesMastersService.deleteReturn(id);
    }

    // ============================================================================
    // SALES PRICING
    // ============================================================================

    @Get('pricing')
    async findAllPricing(
        @Headers('x-company-id') companyId: string,
        @Query('pricingType') pricingType?: string,
        @Query('itemId') itemId?: string,
        @Query('customerId') customerId?: string,
        @Query('isActive') isActive?: string,
    ) {
        return this.salesMastersService.findAllPricing(companyId, {
            pricingType,
            itemId,
            customerId,
            isActive: isActive ? isActive === 'true' : undefined,
        });
    }

    @Post('pricing')
    async createPricing(
        @Headers('x-company-id') companyId: string,
        @Body() data: any,
    ) {
        return this.salesMastersService.createPricing({ ...data, companyId });
    }

    @Put('pricing/:id')
    async updatePricing(@Param('id') id: string, @Body() data: any) {
        return this.salesMastersService.updatePricing(id, data);
    }

    @Delete('pricing/:id')
    async deletePricing(@Param('id') id: string) {
        return this.salesMastersService.deletePricing(id);
    }

    // ============================================================================
    // SALES PROMOTIONS
    // ============================================================================

    @Get('promotions')
    async findAllPromotions(
        @Headers('x-company-id') companyId: string,
        @Query('isActive') isActive?: string,
        @Query('promotionType') promotionType?: string,
    ) {
        return this.salesMastersService.findAllPromotions(companyId, {
            isActive: isActive ? isActive === 'true' : undefined,
            promotionType,
        });
    }

    @Get('promotions/code/:code')
    async findPromotionByCode(
        @Param('code') code: string,
        @Headers('x-company-id') companyId: string,
    ) {
        return this.salesMastersService.findPromotionByCode(code, companyId);
    }

    @Post('promotions')
    async createPromotion(
        @Headers('x-company-id') companyId: string,
        @Body() data: any,
    ) {
        return this.salesMastersService.createPromotion({ ...data, companyId });
    }

    @Put('promotions/:id')
    async updatePromotion(@Param('id') id: string, @Body() data: any) {
        return this.salesMastersService.updatePromotion(id, data);
    }

    @Delete('promotions/:id')
    async deletePromotion(@Param('id') id: string) {
        return this.salesMastersService.deletePromotion(id);
    }

    // ============================================================================
    // SALES TARGETS
    // ============================================================================

    @Get('targets')
    async findAllTargets(
        @Headers('x-company-id') companyId: string,
        @Query('targetType') targetType?: string,
        @Query('salesPersonId') salesPersonId?: string,
        @Query('periodYear') periodYear?: string,
        @Query('periodType') periodType?: string,
    ) {
        return this.salesMastersService.findAllTargets(companyId, {
            targetType,
            salesPersonId,
            periodYear: periodYear ? parseInt(periodYear) : undefined,
            periodType,
        });
    }

    @Post('targets')
    async createTarget(
        @Headers('x-company-id') companyId: string,
        @Body() data: any,
    ) {
        return this.salesMastersService.createTarget({ ...data, companyId });
    }

    @Put('targets/:id')
    async updateTarget(@Param('id') id: string, @Body() data: any) {
        return this.salesMastersService.updateTarget(id, data);
    }

    @Delete('targets/:id')
    async deleteTarget(@Param('id') id: string) {
        return this.salesMastersService.deleteTarget(id);
    }

    // ============================================================================
    // SALES ANALYTICS
    // ============================================================================

    @Get('analytics')
    async getAnalytics(
        @Headers('x-company-id') companyId: string,
        @Query('dimension') dimension?: string,
        @Query('from') from?: string,
        @Query('to') to?: string,
    ) {
        return this.salesMastersService.getAnalytics(companyId, dimension, { from, to });
    }

    @Post('analytics')
    async upsertAnalytics(
        @Headers('x-company-id') companyId: string,
        @Body() data: any,
    ) {
        return this.salesMastersService.upsertAnalytics({ ...data, companyId });
    }

    // ============================================================================
    // QUOTATIONS (Prisma endpoints)
    // ============================================================================

    @Get('quotations-v2')
    async findAllQuotationsPrisma(
        @Headers('x-company-id') companyId: string,
        @Query('status') status?: string,
        @Query('customerId') customerId?: string,
        @Query('salesPersonId') salesPersonId?: string,
        @Query('search') search?: string,
    ) {
        return this.salesMastersService.findAllQuotationsPrisma(companyId, {
            status,
            customerId,
            salesPersonId,
            search,
        });
    }

    @Post('quotations-v2')
    async createQuotationPrisma(
        @Headers('x-company-id') companyId: string,
        @Body() data: any,
    ) {
        return this.salesMastersService.createQuotationPrisma({ ...data, companyId });
    }

    // ============================================================================
    // ORDERS (Prisma endpoints)
    // ============================================================================

    @Get('orders-v2')
    async findAllOrdersPrisma(
        @Headers('x-company-id') companyId: string,
        @Query('status') status?: string,
        @Query('customerId') customerId?: string,
        @Query('salesPersonId') salesPersonId?: string,
        @Query('orderType') orderType?: string,
        @Query('search') search?: string,
    ) {
        return this.salesMastersService.findAllOrdersPrisma(companyId, {
            status,
            customerId,
            salesPersonId,
            orderType,
            search,
        });
    }

    @Get('orders-v2/statistics')
    async getOrderStatsPrisma(@Headers('x-company-id') companyId: string) {
        return this.salesMastersService.getOrderStatsPrisma(companyId);
    }

    @Get('orders-v2/:id')
    async findOrderByIdPrisma(@Param('id') id: string) {
        return this.salesMastersService.findOrderByIdPrisma(id);
    }

    @Post('orders-v2')
    async createOrderPrisma(
        @Headers('x-company-id') companyId: string,
        @Body() data: any,
    ) {
        return this.salesMastersService.createOrderPrisma({ ...data, companyId });
    }
}
