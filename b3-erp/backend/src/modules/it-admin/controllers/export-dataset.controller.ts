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
import { ExportDatasetService } from '../services/export-dataset.service';
import { ExportDataset } from '../entities/export-dataset.entity';

@ApiTags('IT Admin - Export Datasets')
@Controller('it-admin/export-datasets')
export class ExportDatasetController {
  constructor(private readonly service: ExportDatasetService) {}

  @Get()
  @ApiOperation({ summary: 'List export datasets' })
  @ApiQuery({ name: 'companyId', required: false })
  @ApiQuery({ name: 'category', required: false })
  async findAll(
    @Query('companyId') companyId?: string,
    @Query('category') category?: string,
  ): Promise<ExportDataset[]> {
    return this.service.findAll({ companyId, category });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get export dataset by ID' })
  async findOne(@Param('id') id: string): Promise<ExportDataset> {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create export dataset' })
  async create(@Body() data: Partial<ExportDataset>): Promise<ExportDataset> {
    return this.service.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update export dataset' })
  async update(
    @Param('id') id: string,
    @Body() data: Partial<ExportDataset>,
  ): Promise<ExportDataset> {
    return this.service.update(id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete export dataset' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }
}
