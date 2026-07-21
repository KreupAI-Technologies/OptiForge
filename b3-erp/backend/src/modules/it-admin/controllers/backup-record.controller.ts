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

  @Post(':id/restore')
  @ApiOperation({ summary: 'Restore a backup record' })
  async restore(@Param('id') id: string): Promise<BackupRecord> {
    return this.service.restore(id);
  }

  @Post(':id/pause')
  @ApiOperation({ summary: 'Pause a running import/backup job' })
  async pause(@Param('id') id: string): Promise<BackupRecord> {
    return this.service.pause(id);
  }

  @Post(':id/resume')
  @ApiOperation({ summary: 'Resume a paused import/backup job' })
  async resume(@Param('id') id: string): Promise<BackupRecord> {
    return this.service.resume(id);
  }

  @Post(':id/retry')
  @ApiOperation({ summary: 'Retry (re-queue) a failed or paused import/backup job' })
  async retry(@Param('id') id: string): Promise<BackupRecord> {
    return this.service.retry(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete backup record' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }
}
