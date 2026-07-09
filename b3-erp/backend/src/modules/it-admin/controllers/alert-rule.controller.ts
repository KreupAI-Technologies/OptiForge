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
import { AlertRuleService } from '../services/alert-rule.service';
import { AlertRule } from '../entities/alert-rule.entity';

@ApiTags('IT Admin - Alert Rules')
@Controller('it-admin/alert-rules')
export class AlertRuleController {
  constructor(private readonly service: AlertRuleService) {}

  @Get()
  @ApiOperation({ summary: 'List security alert rules' })
  @ApiQuery({ name: 'companyId', required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'severity', required: false })
  async findAll(
    @Query('companyId') companyId?: string,
    @Query('category') category?: string,
    @Query('severity') severity?: string,
  ): Promise<AlertRule[]> {
    return this.service.findAll({ companyId, category, severity });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get alert rule by ID' })
  async findOne(@Param('id') id: string): Promise<AlertRule> {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create alert rule' })
  async create(@Body() data: Partial<AlertRule>): Promise<AlertRule> {
    return this.service.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update alert rule (e.g. enable/disable toggle)' })
  async update(
    @Param('id') id: string,
    @Body() data: Partial<AlertRule>,
  ): Promise<AlertRule> {
    return this.service.update(id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete alert rule' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }
}
