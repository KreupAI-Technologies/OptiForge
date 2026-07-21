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
import { SystemMonitorService } from '../services/system-monitor.service';
import { SystemMonitor } from '../entities/system-monitor.entity';

@ApiTags('IT Admin - System Monitoring')
@Controller('it-admin/monitoring')
export class SystemMonitorController {
  constructor(private readonly service: SystemMonitorService) {}

  @Get()
  @ApiOperation({ summary: 'List monitoring records' })
  @ApiQuery({ name: 'companyId', required: false })
  @ApiQuery({ name: 'kind', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'severity', required: false })
  @ApiQuery({ name: 'category', required: false })
  async findAll(
    @Query('companyId') companyId?: string,
    @Query('kind') kind?: string,
    @Query('status') status?: string,
    @Query('severity') severity?: string,
    @Query('category') category?: string,
  ): Promise<SystemMonitor[]> {
    return this.service.findAll({ companyId, kind, status, severity, category });
  }

  @Get('summary')
  @ApiOperation({ summary: 'Monitoring summary counts for a kind' })
  @ApiQuery({ name: 'kind', required: true })
  @ApiQuery({ name: 'companyId', required: false })
  async summary(
    @Query('kind') kind: string,
    @Query('companyId') companyId?: string,
  ) {
    return this.service.summary(kind || 'health', companyId);
  }

  @Get('history')
  @ApiOperation({ summary: 'Recent monitoring time-series for a kind' })
  @ApiQuery({ name: 'kind', required: false })
  @ApiQuery({ name: 'companyId', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async history(
    @Query('kind') kind?: string,
    @Query('companyId') companyId?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.history(
      kind || 'performance',
      companyId,
      limit ? parseInt(limit, 10) : 30,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get monitoring record by ID' })
  async findOne(@Param('id') id: string): Promise<SystemMonitor> {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create monitoring record' })
  async create(@Body() data: Partial<SystemMonitor>): Promise<SystemMonitor> {
    return this.service.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update monitoring record' })
  async update(
    @Param('id') id: string,
    @Body() data: Partial<SystemMonitor>,
  ): Promise<SystemMonitor> {
    return this.service.update(id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete monitoring record' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }
}
