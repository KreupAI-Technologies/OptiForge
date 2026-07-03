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
import { SupportAgentSkillService } from '../services/support-agent-skill.service';
import { SupportAgentSkill } from '../entities/support-agent-skill.entity';

@ApiTags('Support Agent Skills')
@Controller('support/team/skills')
export class SupportAgentSkillController {
  constructor(private readonly service: SupportAgentSkillService) {}

  @Get()
  findAll(@Query('companyId') companyId: string): Promise<SupportAgentSkill[]> {
    return this.service.findAll(companyId || 'company-1');
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<SupportAgentSkill> {
    return this.service.findOne(id);
  }

  @Post()
  create(
    @Body() body: Partial<SupportAgentSkill> & { companyId: string },
  ): Promise<SupportAgentSkill> {
    return this.service.create({ ...body, companyId: body.companyId || 'company-1' });
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<SupportAgentSkill>,
  ): Promise<SupportAgentSkill> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(id);
    return { success: true };
  }
}
