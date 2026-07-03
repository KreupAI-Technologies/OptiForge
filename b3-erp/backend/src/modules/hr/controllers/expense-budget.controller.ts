import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ExpenseBudgetService } from '../services/expense-budget.service';
import { ExpenseBudget } from '../entities/expense-budget.entity';

@ApiTags('HR - ExpenseBudget')
@Controller('hr/expense-budgets')
export class ExpenseBudgetController {
  constructor(private readonly service: ExpenseBudgetService) {}

  @Get()
  findAll(
    @Query('companyId') companyId: string,
    @Query('status') status?: string,
  ): Promise<ExpenseBudget[]> {
    return this.service.findAll(companyId || 'company-1', status);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<ExpenseBudget> {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() body: Partial<ExpenseBudget> & { companyId: string }): Promise<ExpenseBudget> {
    return this.service.create({
      ...body,
      companyId: body.companyId || 'company-1',
    });
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: Partial<ExpenseBudget>): Promise<ExpenseBudget> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(id);
    return { success: true };
  }
}
