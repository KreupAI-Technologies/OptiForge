import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  Quote,
  QuoteItem,
  QuoteStatus,
  QuoteTemplate,
  QuoteVersion,
} from '../entities/quote.entity';
import { QuoteService } from '../services/quote.service';

@Controller('cpq/quotes')
export class QuoteController {
  constructor(private readonly quoteService: QuoteService) {}

  // Quotes
  @Post()
  create(
    @Headers('x-company-id') companyId: string,
    @Body() body: { quote: Partial<Quote>; items?: Partial<QuoteItem>[] },
  ): Promise<Quote> {
    return this.quoteService.create(companyId, body.quote, body.items);
  }

  @Get()
  findAll(
    @Headers('x-company-id') companyId: string,
    @Query('status') status?: QuoteStatus,
    @Query('customerId') customerId?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Query('assignedTo') assignedTo?: string,
  ): Promise<Quote[]> {
    return this.quoteService.findAll(companyId, {
      status,
      customerId,
      fromDate,
      toDate,
      assignedTo,
    });
  }

  @Get(':id')
  findOne(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
  ): Promise<Quote> {
    return this.quoteService.findOne(companyId, id);
  }

  @Get(':id/items')
  findItems(@Param('id') quoteId: string): Promise<QuoteItem[]> {
    return this.quoteService.findItems(quoteId);
  }

  @Patch(':id')
  update(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
    @Body() data: Partial<Quote>,
  ): Promise<Quote> {
    return this.quoteService.update(companyId, id, data);
  }

  @Patch(':id/items')
  updateItems(
    @Param('id') quoteId: string,
    @Body() items: Partial<QuoteItem>[],
  ): Promise<QuoteItem[]> {
    return this.quoteService.updateItems(quoteId, items);
  }

  @Delete(':id')
  delete(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
  ): Promise<void> {
    return this.quoteService.delete(companyId, id);
  }

  // Status Workflow
  @Post(':id/submit')
  submitForApproval(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
  ): Promise<Quote> {
    return this.quoteService.submitForApproval(companyId, id);
  }

  @Post(':id/approve')
  approve(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
    @Body() body: { approvedBy: string; notes?: string },
  ): Promise<Quote> {
    return this.quoteService.approve(companyId, id, body.approvedBy, body.notes);
  }

  @Post(':id/reject')
  reject(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
    @Body() body: { notes?: string },
  ): Promise<Quote> {
    return this.quoteService.reject(companyId, id, body.notes);
  }

  @Post(':id/send')
  sendToCustomer(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
    @Body() body: { sentBy: string },
  ): Promise<Quote> {
    return this.quoteService.sendToCustomer(companyId, id, body.sentBy);
  }

  @Post(':id/customer-response')
  recordCustomerResponse(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
    @Body() body: { accepted: boolean; feedback?: string },
  ): Promise<Quote> {
    return this.quoteService.recordCustomerResponse(
      companyId,
      id,
      body.accepted,
      body.feedback,
    );
  }

  @Post(':id/convert')
  convertToOrder(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
    @Body() body: { orderId: string },
  ): Promise<Quote> {
    return this.quoteService.convertToOrder(companyId, id, body.orderId);
  }

  // Versioning
  @Post(':id/version')
  createVersion(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
    @Body() body: { createdBy: string; changeDescription?: string },
  ): Promise<Quote> {
    return this.quoteService.createVersion(
      companyId,
      id,
      body.createdBy,
      body.changeDescription,
    );
  }

  @Get(':id/versions')
  findVersions(
    @Headers('x-company-id') companyId: string,
    @Param('id') quoteId: string,
  ): Promise<QuoteVersion[]> {
    return this.quoteService.findVersions(companyId, quoteId);
  }

  @Get('versions/compare')
  compareVersions(
    @Headers('x-company-id') companyId: string,
    @Query('versionId1') versionId1: string,
    @Query('versionId2') versionId2: string,
  ): Promise<{
    version1: QuoteVersion;
    version2: QuoteVersion;
    totalDifference: number;
    percentageChange: number;
    itemChanges: { type: 'added' | 'removed' | 'modified'; item: unknown }[];
  }> {
    return this.quoteService.compareVersions(companyId, versionId1, versionId2);
  }

  // Quote Comparison
  @Post('compare')
  compareQuotes(
    @Headers('x-company-id') companyId: string,
    @Body() body: { quoteIds: string[] },
  ): Promise<{
    quotes: Quote[];
    comparison: { field: string; values: { quoteId: string; value: unknown }[] }[];
  }> {
    return this.quoteService.compareQuotes(companyId, body.quoteIds);
  }

  // Templates
  @Post('templates')
  createTemplate(
    @Headers('x-company-id') companyId: string,
    @Body() data: Partial<QuoteTemplate>,
  ): Promise<QuoteTemplate> {
    return this.quoteService.createTemplate(companyId, data);
  }

  @Get('templates')
  findAllTemplates(
    @Headers('x-company-id') companyId: string,
    @Query('category') category?: string,
    @Query('isActive') isActive?: string,
  ): Promise<QuoteTemplate[]> {
    return this.quoteService.findAllTemplates(companyId, {
      category,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
    });
  }

  @Get('templates/:id')
  findTemplateById(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
  ): Promise<QuoteTemplate> {
    return this.quoteService.findTemplateById(companyId, id);
  }

  @Post('templates/:id/create-quote')
  createFromTemplate(
    @Headers('x-company-id') companyId: string,
    @Param('id') templateId: string,
    @Body() data: Partial<Quote>,
  ): Promise<Quote> {
    return this.quoteService.createFromTemplate(companyId, templateId, data);
  }

  @Patch('templates/:id')
  updateTemplate(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
    @Body() data: Partial<QuoteTemplate>,
  ): Promise<QuoteTemplate> {
    return this.quoteService.updateTemplate(companyId, id, data);
  }

  @Delete('templates/:id')
  deleteTemplate(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
  ): Promise<void> {
    return this.quoteService.deleteTemplate(companyId, id);
  }

  @Patch('templates/:id/toggle-favorite')
  toggleTemplateFavorite(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
  ): Promise<QuoteTemplate> {
    return this.quoteService.toggleTemplateFavorite(companyId, id);
  }
}
