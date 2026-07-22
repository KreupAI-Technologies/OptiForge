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
import { CurrencyMasterService } from '../services/currency-master.service';
import { CurrencyMaster } from '../entities/currency-master.entity';

@ApiTags('Finance - Currency Master')
@Controller('finance/currency-master')
export class CurrencyMasterController {
  constructor(private readonly service: CurrencyMasterService) {}

  @Get()
  @ApiOperation({ summary: 'List currencies' })
  findAll(): Promise<CurrencyMaster[]> {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get currency by id' })
  findOne(@Param('id') id: string): Promise<CurrencyMaster> {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create currency' })
  create(@Body() dto: Partial<CurrencyMaster>): Promise<CurrencyMaster> {
    return this.service.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update currency' })
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CurrencyMaster>,
  ): Promise<CurrencyMaster> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete currency' })
  remove(@Param('id') id: string): Promise<{ success: boolean }> {
    return this.service.remove(id);
  }
}
