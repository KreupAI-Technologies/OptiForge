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
import { ProcurementAutomationRule } from '../entities/procurement-automation-rule.entity';
import { ProcurementAutomationRuleService } from '../services/procurement-automation-rule.service';

@Controller('procurement/automation-rules')
export class ProcurementAutomationRuleController {
  constructor(
    private readonly service: ProcurementAutomationRuleService,
  ) {}

  @Post()
  create(
    @Headers('x-company-id') companyId: string,
    @Body() data: Partial<ProcurementAutomationRule>,
  ): Promise<ProcurementAutomationRule> {
    return this.service.create(companyId, data);
  }

  @Get()
  findAll(
    @Headers('x-company-id') companyId: string,
    @Query('trigger') trigger?: string,
    @Query('isActive') isActive?: string,
  ): Promise<ProcurementAutomationRule[]> {
    return this.service.findAll(companyId, {
      trigger,
      isActive:
        isActive === undefined ? undefined : isActive === 'true',
    });
  }

  @Get(':id')
  findOne(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
  ): Promise<ProcurementAutomationRule> {
    return this.service.findOne(companyId, id);
  }

  @Patch(':id')
  update(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
    @Body() data: Partial<ProcurementAutomationRule>,
  ): Promise<ProcurementAutomationRule> {
    return this.service.update(companyId, id, data);
  }

  @Post(':id/toggle')
  toggle(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
  ): Promise<ProcurementAutomationRule> {
    return this.service.toggle(companyId, id);
  }

  @Delete(':id')
  delete(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
  ): Promise<void> {
    return this.service.delete(companyId, id);
  }
}
