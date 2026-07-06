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
import { FinanceOperationsService } from '../services/finance-operations.service';

@ApiTags('Finance - Operations')
@Controller('finance')
export class FinanceOperationsController {
  constructor(private readonly service: FinanceOperationsService) {}

  // ---- Standard costs ----
  @Get('standard-costs')
  listStandardCosts() { return this.service.listStandardCosts(); }
  @Get('standard-costs/:id')
  getStandardCost(@Param('id') id: string) { return this.service.getStandardCost(id); }
  @Post('standard-costs')
  createStandardCost(@Body() b: any) { return this.service.createStandardCost(b); }
  @Put('standard-costs/:id')
  updateStandardCost(@Param('id') id: string, @Body() b: any) { return this.service.updateStandardCost(id, b); }
  @Delete('standard-costs/:id')
  deleteStandardCost(@Param('id') id: string) { return this.service.deleteStandardCost(id); }

  // ---- Variance analysis ----
  @Get('variance-analysis')
  listVariances() { return this.service.listVariances(); }
  @Get('variance-analysis/:id')
  getVariance(@Param('id') id: string) { return this.service.getVariance(id); }
  @Post('variance-analysis')
  createVariance(@Body() b: any) { return this.service.createVariance(b); }
  @Put('variance-analysis/:id')
  updateVariance(@Param('id') id: string, @Body() b: any) { return this.service.updateVariance(id, b); }
  @Delete('variance-analysis/:id')
  deleteVariance(@Param('id') id: string) { return this.service.deleteVariance(id); }

  // ---- WIP accounting ----
  @Get('wip-accounting')
  listWip() { return this.service.listWip(); }
  @Get('wip-accounting/:id')
  getWip(@Param('id') id: string) { return this.service.getWip(id); }
  @Post('wip-accounting')
  createWip(@Body() b: any) { return this.service.createWip(b); }
  @Put('wip-accounting/:id')
  updateWip(@Param('id') id: string, @Body() b: any) { return this.service.updateWip(id, b); }
  @Delete('wip-accounting/:id')
  deleteWip(@Param('id') id: string) { return this.service.deleteWip(id); }

  // ---- Profit centers ----
  @Get('profit-centers')
  listProfitCenters() { return this.service.listProfitCenters(); }

  // ---- Anticipated receipts ----
  @Get('anticipated-receipts')
  listAnticipatedReceipts() { return this.service.listAnticipatedReceipts(); }
  @Get('anticipated-receipts/:id')
  getAnticipatedReceipt(@Param('id') id: string) { return this.service.getAnticipatedReceipt(id); }
  @Post('anticipated-receipts')
  createAnticipatedReceipt(@Body() b: any) { return this.service.createAnticipatedReceipt(b); }
  @Put('anticipated-receipts/:id')
  updateAnticipatedReceipt(@Param('id') id: string, @Body() b: any) { return this.service.updateAnticipatedReceipt(id, b); }
  @Delete('anticipated-receipts/:id')
  deleteAnticipatedReceipt(@Param('id') id: string) { return this.service.deleteAnticipatedReceipt(id); }

  // ---- Anticipated payments ----
  @Get('anticipated-payments')
  listAnticipatedPayments() { return this.service.listAnticipatedPayments(); }
  @Get('anticipated-payments/:id')
  getAnticipatedPayment(@Param('id') id: string) { return this.service.getAnticipatedPayment(id); }
  @Post('anticipated-payments')
  createAnticipatedPayment(@Body() b: any) { return this.service.createAnticipatedPayment(b); }
  @Put('anticipated-payments/:id')
  updateAnticipatedPayment(@Param('id') id: string, @Body() b: any) { return this.service.updateAnticipatedPayment(id, b); }
  @Delete('anticipated-payments/:id')
  deleteAnticipatedPayment(@Param('id') id: string) { return this.service.deleteAnticipatedPayment(id); }

  // ---- Financial years ----
  @Get('financial-years')
  listFinancialYears() { return this.service.listFinancialYears(); }
  @Get('financial-years/:id')
  getFinancialYear(@Param('id') id: string) { return this.service.getFinancialYear(id); }
  @Post('financial-years')
  createFinancialYear(@Body() b: any) { return this.service.createFinancialYear(b); }
  @Put('financial-years/:id')
  updateFinancialYear(@Param('id') id: string, @Body() b: any) { return this.service.updateFinancialYear(id, b); }
  @Delete('financial-years/:id')
  deleteFinancialYear(@Param('id') id: string) { return this.service.deleteFinancialYear(id); }

  // ---- Financial periods ----
  @Get('financial-periods')
  listFinancialPeriods(@Query('financialYearId') fy?: string) { return this.service.listFinancialPeriods(fy); }
  @Get('financial-periods/:id')
  getFinancialPeriod(@Param('id') id: string) { return this.service.getFinancialPeriod(id); }
  @Post('financial-periods')
  createFinancialPeriod(@Body() b: any) { return this.service.createFinancialPeriod(b); }
  @Put('financial-periods/:id')
  updateFinancialPeriod(@Param('id') id: string, @Body() b: any) { return this.service.updateFinancialPeriod(id, b); }
  @Delete('financial-periods/:id')
  deleteFinancialPeriod(@Param('id') id: string) { return this.service.deleteFinancialPeriod(id); }

  // ---- Consolidation ----
  @Get('consolidation')
  getConsolidation() { return this.service.getConsolidation(); }
  @Get('intercompany')
  getIntercompany() { return this.service.getIntercompany(); }
}
