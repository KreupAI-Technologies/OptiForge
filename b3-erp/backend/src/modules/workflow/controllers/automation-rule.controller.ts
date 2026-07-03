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
import { AutomationRule } from '../entities/automation-rule.entity';
import { AutomationRuleService } from '../services/automation-rule.service';

@Controller('workflow/automation-rules')
export class AutomationRuleController {
  constructor(private readonly automationRuleService: AutomationRuleService) {}

  @Post()
  create(
    @Headers('x-company-id') companyId: string,
    @Body() data: Partial<AutomationRule>,
  ): Promise<AutomationRule> {
    return this.automationRuleService.create(companyId, data);
  }

  @Get()
  findAll(
    @Headers('x-company-id') companyId: string,
    @Query('status') status?: string,
    @Query('category') category?: string,
  ): Promise<AutomationRule[]> {
    return this.automationRuleService.findAll(companyId, { status, category });
  }

  @Get(':id')
  findOne(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
  ): Promise<AutomationRule> {
    return this.automationRuleService.findOne(companyId, id);
  }

  @Patch(':id')
  update(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
    @Body() data: Partial<AutomationRule>,
  ): Promise<AutomationRule> {
    return this.automationRuleService.update(companyId, id, data);
  }

  @Delete(':id')
  delete(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
  ): Promise<void> {
    return this.automationRuleService.delete(companyId, id);
  }
}
