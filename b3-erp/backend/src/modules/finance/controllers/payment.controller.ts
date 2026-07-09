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
import { PaymentService } from '../services/payment.service';
import {
  CreatePaymentDto,
  UpdatePaymentDto,
  PaymentResponseDto,
} from '../dto';

@ApiTags('Finance - Payment')
@Controller('finance/payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new payment' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Payment created successfully',
    type: PaymentResponseDto,
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input' })
  async create(
    @Body() createDto: CreatePaymentDto,
  ): Promise<PaymentResponseDto> {
    return this.paymentService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all payments' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status' })
  @ApiQuery({ name: 'paymentType', required: false, description: 'Filter by payment type' })
  @ApiQuery({ name: 'partyId', required: false, description: 'Filter by party' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date (YYYY-MM-DD)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of payments',
    type: [PaymentResponseDto],
  })
  async findAll(
    @Query('status') status?: string,
    @Query('paymentType') paymentType?: string,
    @Query('partyId') partyId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<PaymentResponseDto[]> {
    return this.paymentService.findAll({
      status,
      paymentType,
      partyId,
      startDate,
      endDate,
    });
  }

  @Get('unreconciled')
  @ApiOperation({ summary: 'Get unreconciled payments' })
  @ApiQuery({ name: 'bankAccountId', required: false, description: 'Filter by bank account' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of unreconciled payments',
    type: [PaymentResponseDto],
  })
  async getUnreconciled(
    @Query('bankAccountId') bankAccountId?: string,
  ): Promise<PaymentResponseDto[]> {
    return this.paymentService.getUnreconciled(bankAccountId);
  }

  @Get('verification-queue')
  @ApiOperation({ summary: 'Get payment verification queue' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Verification queue records' })
  async getVerificationQueue() {
    return this.paymentService.getVerificationQueue();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment by ID' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Payment details',
    type: PaymentResponseDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Payment not found' })
  async findOne(@Param('id') id: string): Promise<PaymentResponseDto> {
    return this.paymentService.findOne(id);
  }

  @Get(':id/activity')
  @ApiOperation({ summary: 'Get payment activity timeline (audit-derived)' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Chronological activity timeline for the payment',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Payment not found' })
  async getActivity(@Param('id') id: string) {
    return this.paymentService.getActivity(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update payment' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Payment updated successfully',
    type: PaymentResponseDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Payment not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Cannot update posted payment' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdatePaymentDto,
  ): Promise<PaymentResponseDto> {
    return this.paymentService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete payment' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Payment deleted successfully',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Payment not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Cannot delete posted payment' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.paymentService.remove(id);
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve payment' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Payment approved successfully',
    type: PaymentResponseDto,
  })
  async approve(@Param('id') id: string): Promise<PaymentResponseDto> {
    return this.paymentService.approve(id);
  }

  @Post(':id/post')
  @ApiOperation({ summary: 'Post payment to general ledger' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Payment posted successfully',
    type: PaymentResponseDto,
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Payment not approved or already posted' })
  async post(@Param('id') id: string): Promise<PaymentResponseDto> {
    return this.paymentService.postToGL(id);
  }

  @Post(':id/reconcile')
  @ApiOperation({ summary: 'Reconcile payment with bank statement' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Payment reconciled successfully',
    type: PaymentResponseDto,
  })
  async reconcile(@Param('id') id: string): Promise<PaymentResponseDto> {
    return this.paymentService.reconcile(id);
  }

  @Post(':id/mark-bounced')
  @ApiOperation({ summary: 'Mark payment as bounced' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Payment marked as bounced',
    type: PaymentResponseDto,
  })
  async markBounced(
    @Param('id') id: string,
    @Body('reason') reason: string,
  ): Promise<PaymentResponseDto> {
    return this.paymentService.markBounced(id, reason);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel payment' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Payment cancelled successfully',
    type: PaymentResponseDto,
  })
  async cancel(@Param('id') id: string): Promise<PaymentResponseDto> {
    return this.paymentService.cancel(id);
  }
}
