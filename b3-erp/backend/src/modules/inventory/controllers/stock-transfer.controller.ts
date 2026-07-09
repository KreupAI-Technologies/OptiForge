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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { StockTransferService } from '../services/stock-transfer.service';
import {
  CreateStockTransferDto,
  UpdateStockTransferDto,
  StockTransferResponseDto,
} from '../dto';

@ApiTags('Inventory - Stock Transfer')
@Controller('inventory/stock-transfers')
export class StockTransferController {
  constructor(private readonly stockTransferService: StockTransferService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new stock transfer' })
  @ApiResponse({ status: HttpStatus.CREATED, type: StockTransferResponseDto })
  async create(
    @Body() createDto: CreateStockTransferDto,
  ): Promise<StockTransferResponseDto> {
    return this.stockTransferService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all stock transfers' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'warehouseId', required: false })
  @ApiResponse({ status: HttpStatus.OK, type: [StockTransferResponseDto] })
  async findAll(
    @Query('status') status?: string,
    @Query('warehouseId') warehouseId?: string,
  ): Promise<StockTransferResponseDto[]> {
    return this.stockTransferService.findAll({ status, warehouseId });
  }

  @Get('in-transit')
  @ApiOperation({ summary: 'Get all in-transit transfers' })
  @ApiResponse({ status: HttpStatus.OK, type: [StockTransferResponseDto] })
  async getInTransit(): Promise<StockTransferResponseDto[]> {
    return this.stockTransferService.getInTransit();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get stock transfer by ID' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: HttpStatus.OK, type: StockTransferResponseDto })
  async findOne(@Param('id') id: string): Promise<StockTransferResponseDto> {
    return this.stockTransferService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update stock transfer' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: HttpStatus.OK, type: StockTransferResponseDto })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateStockTransferDto,
  ): Promise<StockTransferResponseDto> {
    return this.stockTransferService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete stock transfer' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  async remove(@Param('id') id: string): Promise<void> {
    return this.stockTransferService.remove(id);
  }

  @Post(':id/submit')
  @ApiOperation({ summary: 'Submit transfer for approval' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: HttpStatus.OK, type: StockTransferResponseDto })
  async submit(@Param('id') id: string): Promise<StockTransferResponseDto> {
    return this.stockTransferService.submit(id);
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve transfer' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: HttpStatus.OK, type: StockTransferResponseDto })
  async approve(@Param('id') id: string): Promise<StockTransferResponseDto> {
    return this.stockTransferService.approve(id);
  }

  @Post(':id/reject')
  @ApiOperation({ summary: 'Reject transfer' })
  @ApiParam({ name: 'id' })
  @ApiBody({
    required: false,
    schema: {
      type: 'object',
      properties: { rejectionReason: { type: 'string' } },
    },
  })
  @ApiResponse({ status: HttpStatus.OK, type: StockTransferResponseDto })
  async reject(
    @Param('id') id: string,
    @Body() body: { rejectionReason?: string },
  ): Promise<StockTransferResponseDto> {
    return this.stockTransferService.reject(id, body?.rejectionReason);
  }

  @Post(':id/dispatch')
  @ApiOperation({ summary: 'Dispatch transfer' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: HttpStatus.OK, type: StockTransferResponseDto })
  async dispatch(@Param('id') id: string): Promise<StockTransferResponseDto> {
    return this.stockTransferService.dispatch(id);
  }

  @Post(':id/receive')
  @ApiOperation({ summary: 'Receive transfer' })
  @ApiParam({ name: 'id' })
  @ApiBody({ description: 'Received quantities', schema: { type: 'object' } })
  @ApiResponse({ status: HttpStatus.OK, type: StockTransferResponseDto })
  async receive(
    @Param('id') id: string,
    @Body() receiveData: any,
  ): Promise<StockTransferResponseDto> {
    return this.stockTransferService.receive(id, receiveData);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel transfer' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: HttpStatus.OK, type: StockTransferResponseDto })
  async cancel(@Param('id') id: string): Promise<StockTransferResponseDto> {
    return this.stockTransferService.cancel(id);
  }
}
