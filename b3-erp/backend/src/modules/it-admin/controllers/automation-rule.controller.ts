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
import { AutomationRuleService } from '../services/automation-rule.service';
import { AutomationRule } from '../entities/automation-rule.entity';

@ApiTags('IT Admin - Automation Rules')
@Controller('it-admin/automation-rules')
export class AutomationRuleController {
  constructor(private readonly service: AutomationRuleService) {}

  @Get()
  @ApiOperation({ summary: 'List automation rules' })
  @ApiQuery({ name: 'companyId', required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'status', required: false })
  async findAll(
    @Query('companyId') companyId?: string,
    @Query('category') category?: string,
    @Query('status') status?: string,
  ): Promise<AutomationRule[]> {
    return this.service.findAll({ companyId, category, status });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get automation rule by ID' })
  async findOne(@Param('id') id: string): Promise<AutomationRule> {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create automation rule' })
  async create(@Body() data: Partial<AutomationRule>): Promise<AutomationRule> {
    return this.service.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update automation rule' })
  async update(
    @Param('id') id: string,
    @Body() data: Partial<AutomationRule>,
  ): Promise<AutomationRule> {
    return this.service.update(id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete automation rule' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }
}
