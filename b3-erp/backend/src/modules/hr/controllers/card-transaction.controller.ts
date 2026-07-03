import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CardTransactionService } from '../services/card-transaction.service';
import { CardTransaction } from '../entities/card-transaction.entity';

@ApiTags('HR - Card Transactions')
@Controller('hr/card-transactions')
export class CardTransactionController {
  constructor(private readonly service: CardTransactionService) {}

  @Get()
  findAll(
    @Query('companyId') companyId: string,
    @Query('status') status?: string,
  ): Promise<CardTransaction[]> {
    return this.service.findAll(companyId || 'company-1', status);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<CardTransaction> {
    return this.service.findOne(id);
  }

  @Post()
  create(
    @Body() body: Partial<CardTransaction> & { companyId: string },
  ): Promise<CardTransaction> {
    return this.service.create({
      ...body,
      companyId: body.companyId || 'company-1',
    });
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<CardTransaction>,
  ): Promise<CardTransaction> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(id);
    return { success: true };
  }
}
