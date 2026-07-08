import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { GoodsReceiptService } from '../services/goods-receipt.service';
import {
  CreateGoodsReceiptDto,
  UpdateGoodsReceiptDto,
  GoodsReceiptResponseDto,
} from '../dto';

@ApiTags('Procurement - Goods Receipts')
@Controller('procurement/goods-receipts')
export class GoodsReceiptController {
  constructor(private readonly grnService: GoodsReceiptService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new goods receipt' })
  async create(@Body() createDto: CreateGoodsReceiptDto): Promise<GoodsReceiptResponseDto> {
    return this.grnService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all goods receipts' })
  async findAll(@Query() filters?: any): Promise<GoodsReceiptResponseDto[]> {
    return this.grnService.findAll(filters);
  }

  @Get('pending')
  @ApiOperation({ summary: 'Get pending goods receipts' })
  async getPendingReceipts(): Promise<any[]> {
    return this.grnService.getPendingReceipts();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get goods receipt by ID' })
  async findOne(@Param('id') id: string): Promise<GoodsReceiptResponseDto> {
    return this.grnService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update goods receipt' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateGoodsReceiptDto,
  ): Promise<GoodsReceiptResponseDto> {
    return this.grnService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete goods receipt' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.grnService.remove(id);
  }

  @Post(':id/quality-check')
  @ApiOperation({ summary: 'Perform quality check on goods receipt' })
  async qualityCheck(@Param('id') id: string, @Body() checkData: any): Promise<GoodsReceiptResponseDto> {
    return this.grnService.qualityCheck(id, checkData);
  }

  @Post(':id/post-to-inventory')
  @ApiOperation({ summary: 'Post goods receipt to inventory' })
  async postToInventory(@Param('id') id: string): Promise<GoodsReceiptResponseDto> {
    return this.grnService.postToInventory(id);
  }

  @Post(':id/match-invoice')
  @ApiOperation({ summary: 'Match a goods receipt to a purchase invoice' })
  async matchInvoice(@Param('id') id: string, @Body() matchData: any): Promise<GoodsReceiptResponseDto> {
    return this.grnService.matchInvoice(id, matchData);
  }
}
