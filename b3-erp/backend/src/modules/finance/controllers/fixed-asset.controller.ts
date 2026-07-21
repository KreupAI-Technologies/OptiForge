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
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import {
  FixedAssetService,
  CreateFixedAssetDto,
  UpdateFixedAssetDto,
} from '../services/fixed-asset.service';

@ApiTags('Finance - Fixed Assets')
@Controller('finance/fixed-assets')
export class FixedAssetController {
  constructor(private readonly service: FixedAssetService) {}

  // Static route BEFORE :id
  @Get('summary')
  @ApiOperation({ summary: 'Aggregated fixed asset summary by category' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Asset summary' })
  async summary(): Promise<any> {
    return this.service.getSummary();
  }

  // Static routes BEFORE :id so they are not captured as an id param.
  @Post('depreciation/run')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Run one depreciation period for all active assets' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Depreciation run summary' })
  async runDepreciation(): Promise<any> {
    return this.service.runDepreciation();
  }

  @Post('depreciation/manual-entry')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Post a manual depreciation adjustment for one asset' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Updated asset' })
  async manualDepreciation(
    @Body() body: { assetId?: string; assetCode?: string; amount: number },
  ): Promise<any> {
    return this.service.manualDepreciationEntry(
      body.assetId || body.assetCode || '',
      Number(body.amount),
    );
  }

  @Get()
  @ApiOperation({ summary: 'List fixed assets' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiResponse({ status: HttpStatus.OK, description: 'List of fixed assets' })
  async findAll(
    @Query('status') status?: string,
    @Query('category') category?: string,
    @Query('search') search?: string,
  ): Promise<any[]> {
    return this.service.findAll({ status, category, search });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a fixed asset by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Asset details' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not found' })
  async findOne(@Param('id') id: string): Promise<any> {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a fixed asset' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Created' })
  async create(@Body() dto: CreateFixedAssetDto): Promise<any> {
    return this.service.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a fixed asset' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Updated' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not found' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateFixedAssetDto,
  ): Promise<any> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a fixed asset' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Deleted' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }
}
