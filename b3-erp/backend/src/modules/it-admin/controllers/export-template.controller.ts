import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ExportTemplateService } from '../services/export-template.service';
import { ExportTemplate } from '../entities/export-template.entity';

@ApiTags('IT Admin - Export Templates')
@Controller('it-admin/export-templates')
export class ExportTemplateController {
  constructor(private readonly service: ExportTemplateService) {}

  @Get()
  @ApiOperation({ summary: 'List export templates (seeds defaults on first read)' })
  @ApiQuery({ name: 'companyId', required: false })
  @ApiQuery({ name: 'dataset', required: false })
  async findAll(
    @Query('companyId') companyId?: string,
    @Query('dataset') dataset?: string,
  ): Promise<ExportTemplate[]> {
    return this.service.findAll({ companyId, dataset });
  }

  // Static column-schema mapping for a target dataset (import page preview).
  @Get('column-schema/:dataset')
  @ApiOperation({ summary: 'Column mapping schema for a target dataset' })
  columnSchema(@Param('dataset') dataset: string) {
    return this.service.columnSchema(dataset);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get export template by ID' })
  async findOne(@Param('id') id: string): Promise<ExportTemplate> {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create export template' })
  async create(@Body() data: Partial<ExportTemplate>): Promise<ExportTemplate> {
    return this.service.create(data);
  }

  @Post(':id/apply')
  @ApiOperation({ summary: 'Apply template (stamps lastUsedAt, returns template)' })
  async apply(@Param('id') id: string): Promise<ExportTemplate> {
    return this.service.apply(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update export template' })
  async update(
    @Param('id') id: string,
    @Body() data: Partial<ExportTemplate>,
  ): Promise<ExportTemplate> {
    return this.service.update(id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete export template' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }
}
