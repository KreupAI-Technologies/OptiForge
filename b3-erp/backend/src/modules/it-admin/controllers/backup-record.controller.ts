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
import { BackupRecordService } from '../services/backup-record.service';
import { BackupRecord } from '../entities/backup-record.entity';

@ApiTags('IT Admin - Backup Records')
@Controller('it-admin/backup-records')
export class BackupRecordController {
  constructor(private readonly service: BackupRecordService) {}

  @Get()
  @ApiOperation({ summary: 'List backup records' })
  @ApiQuery({ name: 'companyId', required: false })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'status', required: false })
  async findAll(
    @Query('companyId') companyId?: string,
    @Query('type') type?: string,
    @Query('status') status?: string,
  ): Promise<BackupRecord[]> {
    return this.service.findAll({ companyId, type, status });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get backup record by ID' })
  async findOne(@Param('id') id: string): Promise<BackupRecord> {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create backup record' })
  async create(@Body() data: Partial<BackupRecord>): Promise<BackupRecord> {
    return this.service.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update backup record' })
  async update(
    @Param('id') id: string,
    @Body() data: Partial<BackupRecord>,
  ): Promise<BackupRecord> {
    return this.service.update(id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete backup record' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }
}
