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
import { SupportAssignmentRuleService } from '../services/support-assignment-rule.service';
import { SupportAssignmentRule } from '../entities/support-assignment-rule.entity';

@ApiTags('Support Assignment Rules')
@Controller('support/automation/assignment')
export class SupportAssignmentRuleController {
  constructor(private readonly service: SupportAssignmentRuleService) {}

  @Get()
  findAll(
    @Query('companyId') companyId: string,
  ): Promise<SupportAssignmentRule[]> {
    return this.service.findAll(companyId || 'company-1');
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<SupportAssignmentRule> {
    return this.service.findOne(id);
  }

  @Post()
  create(
    @Body() body: Partial<SupportAssignmentRule> & { companyId: string },
  ): Promise<SupportAssignmentRule> {
    return this.service.create({ ...body, companyId: body.companyId || 'company-1' });
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<SupportAssignmentRule>,
  ): Promise<SupportAssignmentRule> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(id);
    return { success: true };
  }
}
