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
import { SupportEscalationRuleService } from '../services/support-escalation-rule.service';
import { SupportEscalationRule } from '../entities/support-escalation-rule.entity';

@ApiTags('Support Escalation Rules')
@Controller('support/automation/escalation')
export class SupportEscalationRuleController {
  constructor(private readonly service: SupportEscalationRuleService) {}

  @Get()
  findAll(
    @Query('companyId') companyId: string,
  ): Promise<SupportEscalationRule[]> {
    return this.service.findAll(companyId || 'company-1');
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<SupportEscalationRule> {
    return this.service.findOne(id);
  }

  @Post()
  create(
    @Body() body: Partial<SupportEscalationRule> & { companyId: string },
  ): Promise<SupportEscalationRule> {
    return this.service.create({ ...body, companyId: body.companyId || 'company-1' });
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<SupportEscalationRule>,
  ): Promise<SupportEscalationRule> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(id);
    return { success: true };
  }
}
