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
import { ApiEndpointService } from '../services/api-endpoint.service';
import { ApiEndpoint } from '../entities/api-endpoint.entity';

@ApiTags('IT Admin - API Endpoints')
@Controller('it-admin/api-endpoints')
export class ApiEndpointController {
  constructor(private readonly service: ApiEndpointService) {}

  @Get()
  @ApiOperation({ summary: 'List API endpoints' })
  @ApiQuery({ name: 'companyId', required: false })
  @ApiQuery({ name: 'category', required: false })
  async findAll(
    @Query('companyId') companyId?: string,
    @Query('category') category?: string,
  ): Promise<ApiEndpoint[]> {
    return this.service.findAll({ companyId, category });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get API endpoint by ID' })
  async findOne(@Param('id') id: string): Promise<ApiEndpoint> {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create API endpoint' })
  async create(@Body() data: Partial<ApiEndpoint>): Promise<ApiEndpoint> {
    return this.service.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update API endpoint' })
  async update(
    @Param('id') id: string,
    @Body() data: Partial<ApiEndpoint>,
  ): Promise<ApiEndpoint> {
    return this.service.update(id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete API endpoint' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }
}
