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
} from '@nestjs/swagger';
import { PurchaseRequisitionService } from '../services/purchase-requisition.service';
import {
  CreatePurchaseRequisitionDto,
  UpdatePurchaseRequisitionDto,
  PurchaseRequisitionResponseDto,
} from '../dto';

@ApiTags('Procurement - Purchase Requisitions')
@Controller('procurement/purchase-requisitions')
export class PurchaseRequisitionController {
  constructor(
    private readonly prService: PurchaseRequisitionService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new purchase requisition' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Purchase requisition created successfully',
    type: PurchaseRequisitionResponseDto,
  })
  async create(
    @Body() createDto: CreatePurchaseRequisitionDto,
  ): Promise<PurchaseRequisitionResponseDto> {
    return this.prService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all purchase requisitions' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'requesterId', required: false })
  @ApiQuery({ name: 'department', required: false })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of purchase requisitions',
    type: [PurchaseRequisitionResponseDto],
  })
  async findAll(
    @Query('status') status?: string,
    @Query('requesterId') requesterId?: string,
    @Query('department') department?: string,
  ): Promise<PurchaseRequisitionResponseDto[]> {
    return this.prService.findAll({ status, requesterId, department });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get purchase requisition by ID' })
  @ApiParam({ name: 'id', description: 'Purchase Requisition ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Purchase requisition details',
    type: PurchaseRequisitionResponseDto,
  })
  async findOne(@Param('id') id: string): Promise<PurchaseRequisitionResponseDto> {
    return this.prService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update purchase requisition' })
  @ApiParam({ name: 'id', description: 'Purchase Requisition ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Purchase requisition updated successfully',
    type: PurchaseRequisitionResponseDto,
  })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdatePurchaseRequisitionDto,
  ): Promise<PurchaseRequisitionResponseDto> {
    return this.prService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete purchase requisition' })
  @ApiParam({ name: 'id', description: 'Purchase Requisition ID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Purchase requisition deleted successfully',
  })
  async remove(@Param('id') id: string): Promise<void> {
    return this.prService.remove(id);
  }

  @Post(':id/submit')
  @ApiOperation({ summary: 'Submit purchase requisition for approval' })
  @ApiParam({ name: 'id', description: 'Purchase Requisition ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Purchase requisition submitted successfully',
    type: PurchaseRequisitionResponseDto,
  })
  async submit(@Param('id') id: string): Promise<PurchaseRequisitionResponseDto> {
    return this.prService.submit(id);
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve purchase requisition' })
  @ApiParam({ name: 'id', description: 'Purchase Requisition ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Purchase requisition approved successfully',
    type: PurchaseRequisitionResponseDto,
  })
  async approve(
    @Param('id') id: string,
    @Body() approverData: any,
  ): Promise<PurchaseRequisitionResponseDto> {
    return this.prService.approve(id, approverData);
  }

  @Post(':id/reject')
  @ApiOperation({ summary: 'Reject purchase requisition' })
  @ApiParam({ name: 'id', description: 'Purchase Requisition ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Purchase requisition rejected successfully',
    type: PurchaseRequisitionResponseDto,
  })
  async reject(
    @Param('id') id: string,
    @Body() rejectionData: any,
  ): Promise<PurchaseRequisitionResponseDto> {
    return this.prService.reject(id, rejectionData);
  }

  @Post(':id/request-info')
  @ApiOperation({ summary: 'Request more information on a purchase requisition' })
  @ApiParam({ name: 'id', description: 'Purchase Requisition ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Information requested successfully',
    type: PurchaseRequisitionResponseDto,
  })
  async requestInfo(
    @Param('id') id: string,
    @Body() infoData: any,
  ): Promise<PurchaseRequisitionResponseDto> {
    return this.prService.requestInfo(id, infoData);
  }

  @Post(':id/convert-to-po')
  @ApiOperation({ summary: 'Convert PR to Purchase Order' })
  @ApiParam({ name: 'id', description: 'Purchase Requisition ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Purchase requisition converted to PO successfully',
    type: PurchaseRequisitionResponseDto,
  })
  async convertToPO(
    @Param('id') id: string,
    @Body() poData: any,
  ): Promise<PurchaseRequisitionResponseDto> {
    return this.prService.convertToPO(id, poData);
  }
}
