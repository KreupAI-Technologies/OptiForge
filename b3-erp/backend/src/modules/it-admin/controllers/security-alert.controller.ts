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
import { SecurityAlertService } from '../services/security-alert.service';
import { SecurityAlert } from '../entities/security-alert.entity';

@ApiTags('IT Admin - Security Alerts')
@Controller('it-admin/security-alerts')
export class SecurityAlertController {
  constructor(private readonly service: SecurityAlertService) {}

  @Get()
  @ApiOperation({ summary: 'List security alerts' })
  @ApiQuery({ name: 'companyId', required: false })
  @ApiQuery({ name: 'severity', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'type', required: false })
  async findAll(
    @Query('companyId') companyId?: string,
    @Query('severity') severity?: string,
    @Query('status') status?: string,
    @Query('type') type?: string,
  ): Promise<SecurityAlert[]> {
    return this.service.findAll({ companyId, severity, status, type });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get security alert by ID' })
  async findOne(@Param('id') id: string): Promise<SecurityAlert> {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create security alert' })
  async create(@Body() data: Partial<SecurityAlert>): Promise<SecurityAlert> {
    return this.service.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update security alert' })
  async update(
    @Param('id') id: string,
    @Body() data: Partial<SecurityAlert>,
  ): Promise<SecurityAlert> {
    return this.service.update(id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete security alert' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }
}
