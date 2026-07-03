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
import { LicenseFeatureService } from '../services/license-feature.service';
import { LicenseFeature } from '../entities/license-feature.entity';

@ApiTags('IT Admin - License Features')
@Controller('it-admin/license-features')
export class LicenseFeatureController {
  constructor(private readonly service: LicenseFeatureService) {}

  @Get()
  @ApiOperation({ summary: 'List license features' })
  @ApiQuery({ name: 'companyId', required: false })
  @ApiQuery({ name: 'category', required: false })
  async findAll(
    @Query('companyId') companyId?: string,
    @Query('category') category?: string,
  ): Promise<LicenseFeature[]> {
    return this.service.findAll({ companyId, category });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get license feature by ID' })
  async findOne(@Param('id') id: string): Promise<LicenseFeature> {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create license feature' })
  async create(@Body() data: Partial<LicenseFeature>): Promise<LicenseFeature> {
    return this.service.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update license feature' })
  async update(
    @Param('id') id: string,
    @Body() data: Partial<LicenseFeature>,
  ): Promise<LicenseFeature> {
    return this.service.update(id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete license feature' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }
}
