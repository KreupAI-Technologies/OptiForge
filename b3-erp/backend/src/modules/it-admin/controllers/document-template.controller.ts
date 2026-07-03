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
import { DocumentTemplateService } from '../services/document-template.service';
import { DocumentTemplate } from '../entities/document-template.entity';

@ApiTags('IT Admin - Document Templates')
@Controller('it-admin/templates')
export class DocumentTemplateController {
  constructor(private readonly service: DocumentTemplateService) {}

  @Get()
  @ApiOperation({ summary: 'List document templates' })
  @ApiQuery({ name: 'companyId', required: false })
  @ApiQuery({ name: 'type', required: false })
  async findAll(
    @Query('companyId') companyId?: string,
    @Query('type') type?: string,
  ): Promise<DocumentTemplate[]> {
    return this.service.findAll({ companyId, type });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get template by ID' })
  async findOne(@Param('id') id: string): Promise<DocumentTemplate> {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create template' })
  async create(
    @Body() data: Partial<DocumentTemplate>,
  ): Promise<DocumentTemplate> {
    return this.service.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update template' })
  async update(
    @Param('id') id: string,
    @Body() data: Partial<DocumentTemplate>,
  ): Promise<DocumentTemplate> {
    return this.service.update(id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete template' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }
}
