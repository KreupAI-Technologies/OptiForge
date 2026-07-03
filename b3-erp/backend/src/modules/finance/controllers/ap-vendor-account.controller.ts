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
import { ApVendorAccountService } from '../services/ap-vendor-account.service';
import { ApVendorAccount } from '../entities/ap-vendor-account.entity';

@ApiTags('Finance - Accounts Payable')
@Controller('finance/payables')
export class ApVendorAccountController {
  constructor(private readonly service: ApVendorAccountService) {}

  @Get()
  @ApiOperation({ summary: 'List AP vendor accounts' })
  @ApiResponse({ status: HttpStatus.OK })
  findAll(): Promise<ApVendorAccount[]> {
    return this.service.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Create AP vendor account' })
  @ApiResponse({ status: HttpStatus.CREATED })
  create(@Body() dto: Partial<ApVendorAccount>): Promise<ApVendorAccount> {
    return this.service.create(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get AP vendor account by id' })
  @ApiResponse({ status: HttpStatus.OK })
  findOne(@Param('id') id: string): Promise<ApVendorAccount> {
    return this.service.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update AP vendor account' })
  @ApiResponse({ status: HttpStatus.OK })
  update(
    @Param('id') id: string,
    @Body() dto: Partial<ApVendorAccount>,
  ): Promise<ApVendorAccount> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete AP vendor account' })
  @ApiResponse({ status: HttpStatus.OK })
  remove(@Param('id') id: string): Promise<{ success: boolean }> {
    return this.service.remove(id);
  }
}
