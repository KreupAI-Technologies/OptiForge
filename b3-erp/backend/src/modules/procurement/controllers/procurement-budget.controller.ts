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
import {
  ProcurementBudgetService,
  UpsertBudgetDto,
} from '../services/procurement-budget.service';

@Controller('procurement/budgets')
export class ProcurementBudgetController {
  constructor(private readonly service: ProcurementBudgetService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query('companyId') companyId = 'default',
    @Query('budgetType') budgetType?: string,
    @Query('fiscalYear') fiscalYear?: string,
  ) {
    return this.service.findAll(companyId, budgetType, fiscalYear);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: UpsertBudgetDto) {
    return this.service.create({ ...dto, companyId: dto.companyId || 'default' });
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async update(@Param('id') id: string, @Body() dto: Partial<UpsertBudgetDto>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
