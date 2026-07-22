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
import { IntercompanyTransactionService } from '../services/intercompany-transaction.service';
import { IntercompanyTransaction } from '../entities/intercompany-transaction.entity';

@ApiTags('Finance - Intercompany')
@Controller('finance/intercompany-transactions')
export class IntercompanyTransactionController {
  constructor(private readonly service: IntercompanyTransactionService) {}

  @Get()
  @ApiOperation({ summary: 'List intercompany transactions' })
  findAll(): Promise<IntercompanyTransaction[]> {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get intercompany transaction by id' })
  findOne(@Param('id') id: string): Promise<IntercompanyTransaction> {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create intercompany transaction' })
  create(
    @Body() dto: Partial<IntercompanyTransaction>,
  ): Promise<IntercompanyTransaction> {
    return this.service.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update intercompany transaction' })
  update(
    @Param('id') id: string,
    @Body() dto: Partial<IntercompanyTransaction>,
  ): Promise<IntercompanyTransaction> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete intercompany transaction' })
  remove(@Param('id') id: string): Promise<{ success: boolean }> {
    return this.service.remove(id);
  }
}
