import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { EstimationWhatIfScenario } from '../entities/whatif-scenario.entity';
import { WhatIfScenarioService } from '../services/whatif-scenario.service';

@Controller('estimation/what-if')
export class WhatIfScenarioController {
  constructor(private readonly whatIfScenarioService: WhatIfScenarioService) {}

  @Post()
  create(
    @Headers('x-company-id') companyId: string,
    @Body() data: Partial<EstimationWhatIfScenario>,
  ): Promise<EstimationWhatIfScenario> {
    return this.whatIfScenarioService.create(companyId, data);
  }

  @Get()
  findAll(
    @Headers('x-company-id') companyId: string,
    @Query('estimateId') estimateId?: string,
  ): Promise<EstimationWhatIfScenario[]> {
    return this.whatIfScenarioService.findAll(companyId, estimateId);
  }

  @Get(':id')
  findOne(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
  ): Promise<EstimationWhatIfScenario> {
    return this.whatIfScenarioService.findOne(companyId, id);
  }

  @Delete(':id')
  delete(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
  ): Promise<void> {
    return this.whatIfScenarioService.delete(companyId, id);
  }
}
