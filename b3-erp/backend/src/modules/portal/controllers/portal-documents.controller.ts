import { Controller, Get, Headers, Query } from '@nestjs/common';
import { PortalDocumentService } from '../services/portal-document.service';

@Controller('portal/documents')
export class PortalDocumentsController {
  constructor(private readonly service: PortalDocumentService) {}

  @Get()
  findAll(
    @Headers('x-company-id') companyId: string,
    @Query('companyId') companyIdQuery?: string,
    @Query('customerId') customerId?: string,
  ) {
    return this.service.findDocuments(companyId || companyIdQuery, customerId);
  }
}
