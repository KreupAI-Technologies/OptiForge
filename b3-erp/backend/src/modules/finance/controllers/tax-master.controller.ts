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
  TaxMasterService,
  CreateTaxMasterDto,
  UpdateTaxMasterDto,
} from '../services/tax-master.service';

@ApiTags('Finance - Tax Masters')
@Controller('finance/tax-masters')
export class TaxMasterController {
  constructor(private readonly service: TaxMasterService) {}

  @Get()
  @ApiOperation({ summary: 'List tax masters (rates)' })
  @ApiQuery({ name: 'taxType', required: false })
  @ApiQuery({ name: 'taxCategory', required: false })
  @ApiQuery({ name: 'isActive', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiResponse({ status: HttpStatus.OK, description: 'List of tax masters' })
  async findAll(
    @Query('taxType') taxType?: string,
    @Query('taxCategory') taxCategory?: string,
    @Query('isActive') isActive?: string,
    @Query('search') search?: string,
  ): Promise<any[]> {
    return this.service.findAll({ taxType, taxCategory, isActive, search });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a tax master by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Tax master details' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not found' })
  async findOne(@Param('id') id: string): Promise<any> {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a tax master' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Created' })
  async create(@Body() dto: CreateTaxMasterDto): Promise<any> {
    return this.service.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a tax master' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Updated' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not found' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTaxMasterDto,
  ): Promise<any> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a tax master' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Deleted' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }
}
