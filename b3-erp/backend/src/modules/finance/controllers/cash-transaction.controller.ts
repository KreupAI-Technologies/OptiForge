import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CashTransactionService } from '../services/cash-transaction.service';
import { CashTransaction } from '../entities/cash-transaction.entity';

@ApiTags('Finance - Cash')
@Controller('finance/cash-transactions')
export class CashTransactionController {
  constructor(private readonly service: CashTransactionService) {}

  @Get()
  @ApiOperation({ summary: 'List cash transactions' })
  findAll(): Promise<CashTransaction[]> {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get cash transaction by id' })
  findOne(@Param('id') id: string): Promise<CashTransaction> {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create cash transaction' })
  create(@Body() dto: Partial<CashTransaction>): Promise<CashTransaction> {
    return this.service.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update cash transaction' })
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CashTransaction>,
  ): Promise<CashTransaction> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete cash transaction' })
  remove(@Param('id') id: string): Promise<{ success: boolean }> {
    return this.service.remove(id);
  }
}
