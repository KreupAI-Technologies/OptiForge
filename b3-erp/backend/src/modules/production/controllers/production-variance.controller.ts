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
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ProductionVarianceService } from '../services/production-variance.service';
import {
  ProductionVariance,
  VarianceCategory,
} from '../entities/production-variance.entity';

@ApiTags('Production - Analytics - Variance')
@Controller('production/analytics/variances')
export class ProductionVarianceController {
  constructor(private readonly varianceService: ProductionVarianceService) {}

  @Post()
  @ApiOperation({ summary: 'Create production variance record' })
  @ApiResponse({ status: HttpStatus.CREATED })
  async create(@Body() dto: Partial<ProductionVariance>): Promise<ProductionVariance> {
    return this.varianceService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all production variance records' })
  @ApiQuery({ name: 'companyId', required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'status', required: false })
  async findAll(
    @Query('companyId') companyId?: string,
    @Query('category') category?: VarianceCategory,
    @Query('status') status?: string,
  ): Promise<ProductionVariance[]> {
    return this.varianceService.findAll({ companyId, category, status });
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get aggregate variance summary' })
  @ApiQuery({ name: 'companyId', required: true })
  async getSummary(@Query('companyId') companyId: string): Promise<any> {
    return this.varianceService.getSummary(companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get production variance by ID' })
  @ApiParam({ name: 'id' })
  async findOne(@Param('id') id: string): Promise<ProductionVariance> {
    return this.varianceService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update production variance' })
  @ApiParam({ name: 'id' })
  async update(
    @Param('id') id: string,
    @Body() dto: Partial<ProductionVariance>,
  ): Promise<ProductionVariance> {
    return this.varianceService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete production variance' })
  @ApiParam({ name: 'id' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.varianceService.remove(id);
  }
}
