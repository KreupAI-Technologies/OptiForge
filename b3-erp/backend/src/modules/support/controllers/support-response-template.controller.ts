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
import { SupportResponseTemplateService } from '../services/support-response-template.service';
import { SupportResponseTemplate } from '../entities/support-response-template.entity';

@ApiTags('Support Response Templates')
@Controller('support/automation/responses')
export class SupportResponseTemplateController {
  constructor(private readonly service: SupportResponseTemplateService) {}

  @Get()
  findAll(
    @Query('companyId') companyId: string,
    @Query('category') category?: string,
    @Query('active') active?: string,
  ): Promise<SupportResponseTemplate[]> {
    return this.service.findAll(companyId || 'company-1', {
      category,
      active: active === undefined ? undefined : active === 'true',
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<SupportResponseTemplate> {
    return this.service.findOne(id);
  }

  @Post()
  create(
    @Body() body: Partial<SupportResponseTemplate> & { companyId: string },
  ): Promise<SupportResponseTemplate> {
    return this.service.create({
      ...body,
      companyId: body.companyId || 'company-1',
    });
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<SupportResponseTemplate>,
  ): Promise<SupportResponseTemplate> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(id);
    return { success: true };
  }
}
