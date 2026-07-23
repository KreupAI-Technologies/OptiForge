import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Query,
} from '@nestjs/common';
import { SupplierPortalService } from '../services/supplier-portal.service';
import { SupplierPortalMessage } from '../entities/supplier-portal-message.entity';
import { SupplierPortalDocument } from '../entities/supplier-portal-document.entity';
import { SupplierPortalInvoice } from '../entities/supplier-portal-invoice.entity';
import { SupplierPortalQuote } from '../entities/supplier-portal-quote.entity';
import { SupplierPortalCatalogItem } from '../entities/supplier-portal-catalog-item.entity';

// Supplier Portal endpoints:
//  - suppliers derived from real vendor data
//  - messages/documents backed by dedicated additive tables (list + create)
@Controller('procurement/supplier-portal')
export class SupplierPortalController {
  constructor(private readonly service: SupplierPortalService) {}

  @Get('suppliers')
  suppliers() {
    return this.service.getSuppliers();
  }

  @Get('messages')
  messages(
    @Headers('x-company-id') companyId: string,
    @Query('supplierId') supplierId?: string,
  ) {
    return this.service.getMessages(companyId, supplierId);
  }

  @Post('messages')
  createMessage(
    @Headers('x-company-id') companyId: string,
    @Body() data: Partial<SupplierPortalMessage>,
  ) {
    return this.service.createMessage(companyId, data);
  }

  @Get('documents')
  documents(
    @Headers('x-company-id') companyId: string,
    @Query('supplierId') supplierId?: string,
  ) {
    return this.service.getDocuments(companyId, supplierId);
  }

  @Post('documents')
  createDocument(
    @Headers('x-company-id') companyId: string,
    @Body() data: Partial<SupplierPortalDocument>,
  ) {
    return this.service.createDocument(companyId, data);
  }

  // ---- purchase orders for a supplier (real PO rows) ----
  @Get('purchase-orders')
  purchaseOrders(@Query('supplierId') supplierId: string) {
    return this.service.getSupplierPurchaseOrders(supplierId);
  }

  // ---- supplier invoices ----
  @Get('invoices')
  invoices(
    @Headers('x-company-id') companyId: string,
    @Query('supplierId') supplierId?: string,
  ) {
    return this.service.getInvoices(companyId, supplierId);
  }

  @Post('invoices')
  createInvoice(
    @Headers('x-company-id') companyId: string,
    @Body() data: Partial<SupplierPortalInvoice>,
  ) {
    return this.service.createInvoice(companyId, data);
  }

  // ---- supplier quotes ----
  @Get('quotes')
  quotes(
    @Headers('x-company-id') companyId: string,
    @Query('supplierId') supplierId?: string,
  ) {
    return this.service.getQuotes(companyId, supplierId);
  }

  @Post('quotes')
  createQuote(
    @Headers('x-company-id') companyId: string,
    @Body() data: Partial<SupplierPortalQuote>,
  ) {
    return this.service.createQuote(companyId, data);
  }

  // ---- supplier catalog (upsert by sku) ----
  @Get('catalog')
  catalog(
    @Headers('x-company-id') companyId: string,
    @Query('supplierId') supplierId?: string,
  ) {
    return this.service.getCatalogItems(companyId, supplierId);
  }

  @Post('catalog')
  upsertCatalogItem(
    @Headers('x-company-id') companyId: string,
    @Body() data: Partial<SupplierPortalCatalogItem>,
  ) {
    return this.service.upsertCatalogItem(companyId, data);
  }
}
