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
import { BomReceipt } from '../entities/bom-receipt.entity';
import { BomReceiptService } from '../services/bom-receipt.service';

@Controller('procurement/bom-receipts')
export class BomReceiptController {
  constructor(private readonly bomReceiptService: BomReceiptService) {}

  @Post()
  create(
    @Headers('x-company-id') companyId: string,
    @Body() data: Partial<BomReceipt>,
  ): Promise<BomReceipt> {
    return this.bomReceiptService.create(companyId, data);
  }

  @Get()
  findAll(
    @Headers('x-company-id') companyId: string,
    @Query('status') status?: string,
  ): Promise<BomReceipt[]> {
    return this.bomReceiptService.findAll(companyId, { status });
  }

  @Get(':id')
  findOne(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
  ): Promise<BomReceipt> {
    return this.bomReceiptService.findOne(companyId, id);
  }

  @Patch(':id')
  update(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
    @Body() data: Partial<BomReceipt>,
  ): Promise<BomReceipt> {
    return this.bomReceiptService.update(companyId, id, data);
  }

  @Delete(':id')
  delete(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
  ): Promise<void> {
    return this.bomReceiptService.delete(companyId, id);
  }
}
