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
import { MonitoredServerService } from '../services/monitored-server.service';
import { MonitoredServer } from '../entities/monitored-server.entity';

@ApiTags('IT Admin - Monitored Servers')
@Controller('it-admin/monitored-servers')
export class MonitoredServerController {
  constructor(private readonly service: MonitoredServerService) {}

  @Get()
  @ApiOperation({ summary: 'List monitored servers (seeds defaults on first read)' })
  @ApiQuery({ name: 'companyId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'role', required: false })
  async findAll(
    @Query('companyId') companyId?: string,
    @Query('status') status?: string,
    @Query('role') role?: string,
  ): Promise<MonitoredServer[]> {
    return this.service.findAll({ companyId, status, role });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get monitored server by ID' })
  async findOne(@Param('id') id: string): Promise<MonitoredServer> {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create monitored server' })
  async create(
    @Body() data: Partial<MonitoredServer>,
  ): Promise<MonitoredServer> {
    return this.service.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update monitored server' })
  async update(
    @Param('id') id: string,
    @Body() data: Partial<MonitoredServer>,
  ): Promise<MonitoredServer> {
    return this.service.update(id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete monitored server' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }
}
