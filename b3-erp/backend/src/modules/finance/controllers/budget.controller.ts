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
  BudgetCrudService,
  CreateBudgetDto,
  UpdateBudgetDto,
} from '../services/budget-crud.service';

@ApiTags('Finance - Budgets')
@Controller('finance/budgets')
export class BudgetController {
  constructor(private readonly service: BudgetCrudService) {}

  @Get()
  @ApiOperation({ summary: 'List budgets' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'budgetType', required: false })
  @ApiQuery({ name: 'department', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiResponse({ status: HttpStatus.OK, description: 'List of budgets' })
  async findAll(
    @Query('status') status?: string,
    @Query('budgetType') budgetType?: string,
    @Query('department') department?: string,
    @Query('search') search?: string,
  ): Promise<any[]> {
    return this.service.findAll({ status, budgetType, department, search });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a budget by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Budget details' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not found' })
  async findOne(@Param('id') id: string): Promise<any> {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a budget' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Created' })
  async create(@Body() dto: CreateBudgetDto): Promise<any> {
    return this.service.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a budget' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Updated' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not found' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateBudgetDto,
  ): Promise<any> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a budget' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Deleted' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }
}
