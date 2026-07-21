import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { SourcingStrategy } from '../entities/sourcing-strategy.entity';
import { SourcingStrategyService } from '../services/sourcing-strategy.service';

@Controller('procurement/sourcing-strategies')
export class SourcingStrategyController {
  constructor(
    private readonly sourcingStrategyService: SourcingStrategyService,
  ) {}

  @Post()
  create(
    @Headers('x-company-id') companyId: string,
    @Body() data: Partial<SourcingStrategy>,
  ): Promise<SourcingStrategy> {
    return this.sourcingStrategyService.create(companyId || 'default', data);
  }

  @Get()
  findAll(
    @Headers('x-company-id') companyId: string,
    @Query('status') status?: string,
    @Query('strategyType') strategyType?: string,
    @Query('category') category?: string,
  ): Promise<SourcingStrategy[]> {
    return this.sourcingStrategyService.findAll(companyId || 'default', {
      status,
      strategyType,
      category,
    });
  }

  @Get(':id')
  findOne(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
  ): Promise<SourcingStrategy> {
    return this.sourcingStrategyService.findOne(companyId || 'default', id);
  }

  @Patch(':id')
  update(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
    @Body() data: Partial<SourcingStrategy>,
  ): Promise<SourcingStrategy> {
    return this.sourcingStrategyService.update(companyId || 'default', id, data);
  }

  @Delete(':id')
  delete(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
  ): Promise<void> {
    return this.sourcingStrategyService.delete(companyId || 'default', id);
  }
}
