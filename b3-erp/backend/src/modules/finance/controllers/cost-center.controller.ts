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
  CostCenterCrudService,
  CreateCostCenterDto,
  UpdateCostCenterDto,
} from '../services/cost-center-crud.service';

@ApiTags('Finance - Cost Centers')
@Controller('finance/cost-centers')
export class CostCenterController {
  constructor(private readonly service: CostCenterCrudService) {}

  @Get()
  @ApiOperation({ summary: 'List cost centers' })
  @ApiQuery({ name: 'department', required: false })
  @ApiQuery({ name: 'isActive', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiResponse({ status: HttpStatus.OK, description: 'List of cost centers' })
  async findAll(
    @Query('department') department?: string,
    @Query('isActive') isActive?: string,
    @Query('search') search?: string,
  ): Promise<any[]> {
    return this.service.findAll({ department, isActive, search });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a cost center by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Cost center details' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not found' })
  async findOne(@Param('id') id: string): Promise<any> {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a cost center' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Created' })
  async create(@Body() dto: CreateCostCenterDto): Promise<any> {
    return this.service.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a cost center' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Updated' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not found' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCostCenterDto,
  ): Promise<any> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a cost center' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Deleted' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }
}
