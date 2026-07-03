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
import { WebhookEndpointService } from '../services/webhook-endpoint.service';
import { WebhookEndpoint } from '../entities/webhook-endpoint.entity';

@ApiTags('IT Admin - Webhook Endpoints')
@Controller('it-admin/webhook-endpoints')
export class WebhookEndpointController {
  constructor(private readonly service: WebhookEndpointService) {}

  @Get()
  @ApiOperation({ summary: 'List webhook endpoints' })
  @ApiQuery({ name: 'companyId', required: false })
  @ApiQuery({ name: 'status', required: false })
  async findAll(
    @Query('companyId') companyId?: string,
    @Query('status') status?: string,
  ): Promise<WebhookEndpoint[]> {
    return this.service.findAll({ companyId, status });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get webhook endpoint by ID' })
  async findOne(@Param('id') id: string): Promise<WebhookEndpoint> {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create webhook endpoint' })
  async create(@Body() data: Partial<WebhookEndpoint>): Promise<WebhookEndpoint> {
    return this.service.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update webhook endpoint' })
  async update(
    @Param('id') id: string,
    @Body() data: Partial<WebhookEndpoint>,
  ): Promise<WebhookEndpoint> {
    return this.service.update(id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete webhook endpoint' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }
}
