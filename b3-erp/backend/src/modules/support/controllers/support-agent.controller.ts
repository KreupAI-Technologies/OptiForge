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
import { SupportAgentService } from '../services/support-agent.service';
import { SupportAgent } from '../entities/support-agent.entity';

@ApiTags('Support Agents')
@Controller('support/team/agents')
export class SupportAgentController {
  constructor(private readonly service: SupportAgentService) {}

  @Get()
  findAll(@Query('companyId') companyId: string): Promise<SupportAgent[]> {
    return this.service.findAll(companyId || 'company-1');
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<SupportAgent> {
    return this.service.findOne(id);
  }

  @Post()
  create(
    @Body() body: Partial<SupportAgent> & { companyId: string },
  ): Promise<SupportAgent> {
    return this.service.create({ ...body, companyId: body.companyId || 'company-1' });
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<SupportAgent>,
  ): Promise<SupportAgent> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(id);
    return { success: true };
  }
}
