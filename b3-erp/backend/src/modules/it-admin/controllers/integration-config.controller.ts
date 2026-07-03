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
import { IntegrationConfigService } from '../services/integration-config.service';
import { IntegrationConfig } from '../entities/integration-config.entity';

@ApiTags('IT Admin - Integrations')
@Controller('it-admin/integrations')
export class IntegrationConfigController {
  constructor(private readonly service: IntegrationConfigService) {}

  @Get()
  @ApiOperation({ summary: 'List integration configs' })
  @ApiQuery({ name: 'companyId', required: false })
  @ApiQuery({ name: 'category', required: false })
  async findAll(
    @Query('companyId') companyId?: string,
    @Query('category') category?: string,
  ): Promise<IntegrationConfig[]> {
    return this.service.findAll({ companyId, category });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get integration by ID' })
  async findOne(@Param('id') id: string): Promise<IntegrationConfig> {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create integration config' })
  async create(
    @Body() data: Partial<IntegrationConfig>,
  ): Promise<IntegrationConfig> {
    return this.service.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update integration config' })
  async update(
    @Param('id') id: string,
    @Body() data: Partial<IntegrationConfig>,
  ): Promise<IntegrationConfig> {
    return this.service.update(id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete integration config' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }
}
