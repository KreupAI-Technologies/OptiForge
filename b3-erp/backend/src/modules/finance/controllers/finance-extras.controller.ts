import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FinanceExtrasService } from '../services/finance-extras.service';

@ApiTags('Finance - Extras')
@Controller('finance')
export class FinanceExtrasController {
  constructor(private readonly service: FinanceExtrasService) {}

  // ---- Exchange rates ----
  @Get('exchange-rates')
  listExchangeRates(@Query('companyId') c?: string) { return this.service.listExchangeRates(c); }
  @Get('exchange-rates/:id')
  getExchangeRate(@Param('id') id: string) { return this.service.getExchangeRate(id); }
  @Post('exchange-rates')
  createExchangeRate(@Body() b: any) { return this.service.createExchangeRate(b); }
  @Put('exchange-rates/:id')
  updateExchangeRate(@Param('id') id: string, @Body() b: any) { return this.service.updateExchangeRate(id, b); }
  @Delete('exchange-rates/:id')
  deleteExchangeRate(@Param('id') id: string) { return this.service.deleteExchangeRate(id); }

  // ---- Recurring transactions ----
  @Get('recurring-transactions')
  listRecurring(@Query('companyId') c?: string) { return this.service.listRecurring(c); }
  @Get('recurring-transactions/:id')
  getRecurring(@Param('id') id: string) { return this.service.getRecurring(id); }
  @Post('recurring-transactions')
  createRecurring(@Body() b: any) { return this.service.createRecurring(b); }
  @Put('recurring-transactions/:id')
  updateRecurring(@Param('id') id: string, @Body() b: any) { return this.service.updateRecurring(id, b); }
  @Delete('recurring-transactions/:id')
  deleteRecurring(@Param('id') id: string) { return this.service.deleteRecurring(id); }

  // ---- Approval workflows ----
  @Get('approval-workflows')
  listWorkflows(@Query('companyId') c?: string) { return this.service.listWorkflows(c); }
  @Get('approval-workflows/:id')
  getWorkflow(@Param('id') id: string) { return this.service.getWorkflow(id); }
  @Post('approval-workflows')
  createWorkflow(@Body() b: any) { return this.service.createWorkflow(b); }
  @Put('approval-workflows/:id')
  updateWorkflow(@Param('id') id: string, @Body() b: any) { return this.service.updateWorkflow(id, b); }
  @Delete('approval-workflows/:id')
  deleteWorkflow(@Param('id') id: string) { return this.service.deleteWorkflow(id); }

  // ---- Alerts ----
  @Get('alerts')
  listAlerts(@Query('companyId') c?: string) { return this.service.listAlerts(c); }
  @Get('alerts/:id')
  getAlert(@Param('id') id: string) { return this.service.getAlert(id); }
  @Post('alerts')
  createAlert(@Body() b: any) { return this.service.createAlert(b); }
  @Put('alerts/:id')
  updateAlert(@Param('id') id: string, @Body() b: any) { return this.service.updateAlert(id, b); }
  @Delete('alerts/:id')
  deleteAlert(@Param('id') id: string) { return this.service.deleteAlert(id); }

  // ---- Documents ----
  @Get('documents')
  listDocuments(@Query('companyId') c?: string) { return this.service.listDocuments(c); }
  @Get('documents/:id')
  getDocument(@Param('id') id: string) { return this.service.getDocument(id); }
  @Post('documents')
  createDocument(@Body() b: any) { return this.service.createDocument(b); }
  @Put('documents/:id')
  updateDocument(@Param('id') id: string, @Body() b: any) { return this.service.updateDocument(id, b); }
  @Delete('documents/:id')
  deleteDocument(@Param('id') id: string) { return this.service.deleteDocument(id); }

  // ---- Audit trail ----
  @Get('audit-trail')
  listAudit(@Query('companyId') c?: string) { return this.service.listAudit(c); }
  @Post('audit-trail')
  createAudit(@Body() b: any) { return this.service.createAudit(b); }

  // ---- Credit limits ----
  @Get('credit-limits')
  listCreditLimits(@Query('companyId') c?: string) { return this.service.listCreditLimits(c); }
  @Get('credit-limits/:id')
  getCreditLimit(@Param('id') id: string) { return this.service.getCreditLimit(id); }
  @Post('credit-limits')
  createCreditLimit(@Body() b: any) { return this.service.createCreditLimit(b); }
  @Put('credit-limits/:id')
  updateCreditLimit(@Param('id') id: string, @Body() b: any) { return this.service.updateCreditLimit(id, b); }
  @Delete('credit-limits/:id')
  deleteCreditLimit(@Param('id') id: string) { return this.service.deleteCreditLimit(id); }

  // ---- Investments ----
  @Get('investments')
  listInvestments(@Query('companyId') c?: string) { return this.service.listInvestments(c); }
  @Get('investments/:id')
  getInvestment(@Param('id') id: string) { return this.service.getInvestment(id); }
  @Post('investments')
  createInvestment(@Body() b: any) { return this.service.createInvestment(b); }
  @Put('investments/:id')
  updateInvestment(@Param('id') id: string, @Body() b: any) { return this.service.updateInvestment(id, b); }
  @Delete('investments/:id')
  deleteInvestment(@Param('id') id: string) { return this.service.deleteInvestment(id); }

  // ---- Report templates ----
  @Get('report-templates')
  listReportTemplates(@Query('companyId') c?: string) { return this.service.listReportTemplates(c); }
  @Get('report-templates/:id')
  getReportTemplate(@Param('id') id: string) { return this.service.getReportTemplate(id); }
  @Post('report-templates')
  createReportTemplate(@Body() b: any) { return this.service.createReportTemplate(b); }
  @Put('report-templates/:id')
  updateReportTemplate(@Param('id') id: string, @Body() b: any) { return this.service.updateReportTemplate(id, b); }
  @Delete('report-templates/:id')
  deleteReportTemplate(@Param('id') id: string) { return this.service.deleteReportTemplate(id); }
}
