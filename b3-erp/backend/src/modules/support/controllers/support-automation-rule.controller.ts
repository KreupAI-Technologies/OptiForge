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
import { SupportAutomationRuleService } from '../services/support-automation-rule.service';
import { SupportAutomationRule } from '../entities/support-automation-rule.entity';

@ApiTags('Support Automation Rules')
@Controller('support/automation/rules')
export class SupportAutomationRuleController {
  constructor(private readonly service: SupportAutomationRuleService) {}

  @Get()
  findAll(
    @Query('companyId') companyId: string,
    @Query('category') category?: string,
    @Query('active') active?: string,
  ): Promise<SupportAutomationRule[]> {
    return this.service.findAll(companyId || 'company-1', {
      category,
      active: active === undefined ? undefined : active === 'true',
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<SupportAutomationRule> {
    return this.service.findOne(id);
  }

  @Post()
  create(
    @Body() body: Partial<SupportAutomationRule> & { companyId: string },
  ): Promise<SupportAutomationRule> {
    return this.service.create({
      ...body,
      companyId: body.companyId || 'company-1',
    });
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<SupportAutomationRule>,
  ): Promise<SupportAutomationRule> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(id);
    return { success: true };
  }
}
