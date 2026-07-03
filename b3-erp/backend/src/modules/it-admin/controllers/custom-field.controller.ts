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
import { CustomFieldService } from '../services/custom-field.service';
import { CustomFieldDef } from '../entities/custom-field.entity';

@ApiTags('IT Admin - Custom Fields')
@Controller('it-admin/custom-fields')
export class CustomFieldController {
  constructor(private readonly service: CustomFieldService) {}

  @Get()
  @ApiOperation({ summary: 'List custom fields' })
  @ApiQuery({ name: 'companyId', required: false })
  @ApiQuery({ name: 'module', required: false })
  async findAll(
    @Query('companyId') companyId?: string,
    @Query('module') module?: string,
  ): Promise<CustomFieldDef[]> {
    return this.service.findAll({ companyId, module });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get custom field by ID' })
  async findOne(@Param('id') id: string): Promise<CustomFieldDef> {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create custom field' })
  async create(@Body() data: Partial<CustomFieldDef>): Promise<CustomFieldDef> {
    return this.service.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update custom field' })
  async update(
    @Param('id') id: string,
    @Body() data: Partial<CustomFieldDef>,
  ): Promise<CustomFieldDef> {
    return this.service.update(id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete custom field' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }
}
