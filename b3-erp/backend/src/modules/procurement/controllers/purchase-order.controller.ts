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
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { PurchaseOrderService } from '../services/purchase-order.service';
import {
  CreatePurchaseOrderDto,
  UpdatePurchaseOrderDto,
  PurchaseOrderResponseDto,
} from '../dto';

@ApiTags('Procurement - Purchase Orders')
@Controller('procurement/purchase-orders')
export class PurchaseOrderController {
  constructor(private readonly poService: PurchaseOrderService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new purchase order' })
  async create(@Body() createDto: CreatePurchaseOrderDto): Promise<PurchaseOrderResponseDto> {
    return this.poService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all purchase orders' })
  async findAll(@Query() filters?: any): Promise<PurchaseOrderResponseDto[]> {
    return this.poService.findAll(filters);
  }

  @Get('outstanding')
  @ApiOperation({ summary: 'Get outstanding purchase orders' })
  async getOutstandingOrders(): Promise<any[]> {
    return this.poService.getOutstandingOrders();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get purchase order by ID' })
  async findOne(@Param('id') id: string): Promise<PurchaseOrderResponseDto> {
    return this.poService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update purchase order' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdatePurchaseOrderDto,
  ): Promise<PurchaseOrderResponseDto> {
    return this.poService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete purchase order' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.poService.remove(id);
  }

  @Post(':id/submit')
  @ApiOperation({ summary: 'Submit purchase order for approval' })
  async submit(@Param('id') id: string): Promise<PurchaseOrderResponseDto> {
    return this.poService.submit(id);
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve purchase order' })
  async approve(@Param('id') id: string, @Body() approverData: any): Promise<PurchaseOrderResponseDto> {
    return this.poService.approve(id, approverData);
  }

  @Post('bulk-import')
  @ApiOperation({ summary: 'Bulk-import a purchase order from parsed line-item rows' })
  async bulkImport(@Body() body: { rows: any[]; meta?: any }): Promise<PurchaseOrderResponseDto> {
    const rows = Array.isArray(body) ? (body as any[]) : body?.rows;
    const meta = Array.isArray(body) ? undefined : body?.meta;
    return this.poService.bulkImport(rows, meta);
  }

  @Post(':id/delegate')
  @ApiOperation({ summary: 'Delegate purchase order approval' })
  async delegate(@Param('id') id: string, @Body() delegateData: any): Promise<PurchaseOrderResponseDto> {
    return this.poService.delegate(id, delegateData);
  }

  @Post(':id/request-info')
  @ApiOperation({ summary: 'Request more information on a purchase order approval' })
  async requestInfo(@Param('id') id: string, @Body() infoData: any): Promise<PurchaseOrderResponseDto> {
    return this.poService.requestInfo(id, infoData);
  }

  @Post(':id/close')
  @ApiOperation({ summary: 'Close purchase order' })
  async close(@Param('id') id: string): Promise<PurchaseOrderResponseDto> {
    return this.poService.close(id);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel purchase order' })
  async cancel(@Param('id') id: string, @Body() cancelData: any): Promise<PurchaseOrderResponseDto> {
    return this.poService.cancel(id, cancelData.reason);
  }
}
