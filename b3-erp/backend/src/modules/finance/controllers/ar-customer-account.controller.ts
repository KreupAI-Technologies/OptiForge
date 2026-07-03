import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ArCustomerAccountService } from '../services/ar-customer-account.service';
import { ArCustomerAccount } from '../entities/ar-customer-account.entity';

@ApiTags('Finance - Accounts Receivable')
@Controller('finance/receivables')
export class ArCustomerAccountController {
  constructor(private readonly service: ArCustomerAccountService) {}

  @Get()
  @ApiOperation({ summary: 'List AR customer accounts' })
  @ApiResponse({ status: HttpStatus.OK })
  findAll(): Promise<ArCustomerAccount[]> {
    return this.service.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Create AR customer account' })
  @ApiResponse({ status: HttpStatus.CREATED })
  create(@Body() dto: Partial<ArCustomerAccount>): Promise<ArCustomerAccount> {
    return this.service.create(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get AR customer account by id' })
  @ApiResponse({ status: HttpStatus.OK })
  findOne(@Param('id') id: string): Promise<ArCustomerAccount> {
    return this.service.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update AR customer account' })
  @ApiResponse({ status: HttpStatus.OK })
  update(
    @Param('id') id: string,
    @Body() dto: Partial<ArCustomerAccount>,
  ): Promise<ArCustomerAccount> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete AR customer account' })
  @ApiResponse({ status: HttpStatus.OK })
  remove(@Param('id') id: string): Promise<{ success: boolean }> {
    return this.service.remove(id);
  }
}
