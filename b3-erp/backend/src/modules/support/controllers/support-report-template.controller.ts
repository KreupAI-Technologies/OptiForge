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
import { SupportReportTemplateService } from '../services/support-report-template.service';
import { SupportReportTemplate } from '../entities/support-report-template.entity';

@ApiTags('Support Report Templates')
@Controller('support/report-templates')
export class SupportReportTemplateController {
  constructor(private readonly service: SupportReportTemplateService) {}

  @Get()
  findAll(
    @Query('companyId') companyId: string,
    @Query('category') category?: string,
    @Query('scheduled') scheduled?: string,
  ): Promise<SupportReportTemplate[]> {
    return this.service.findAll(companyId || 'company-1', {
      category,
      scheduled: scheduled === undefined ? undefined : scheduled === 'true',
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<SupportReportTemplate> {
    return this.service.findOne(id);
  }

  @Post()
  create(
    @Body() body: Partial<SupportReportTemplate> & { companyId: string },
  ): Promise<SupportReportTemplate> {
    return this.service.create({
      ...body,
      companyId: body.companyId || 'company-1',
    });
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<SupportReportTemplate>,
  ): Promise<SupportReportTemplate> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(id);
    return { success: true };
  }
}
