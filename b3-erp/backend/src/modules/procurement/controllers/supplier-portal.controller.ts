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
}
