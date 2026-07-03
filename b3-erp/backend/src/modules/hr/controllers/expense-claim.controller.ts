import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ExpenseClaimService } from '../services/expense-claim.service';
import { ExpenseClaim } from '../entities/expense-claim.entity';

@ApiTags('HR - Expense Claims')
@Controller('hr/expense-claims')
export class ExpenseClaimController {
  constructor(private readonly service: ExpenseClaimService) {}

  @Get()
  findAll(
    @Query('companyId') companyId: string,
    @Query('kind') kind?: string,
    @Query('status') status?: string,
  ): Promise<ExpenseClaim[]> {
    return this.service.findAll(companyId || 'company-1', { kind, status });
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<ExpenseClaim> {
    return this.service.findOne(id);
  }

  @Post()
  create(
    @Body() body: Partial<ExpenseClaim> & { companyId: string },
  ): Promise<ExpenseClaim> {
    return this.service.create({
      ...body,
      companyId: body.companyId || 'company-1',
    });
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<ExpenseClaim>,
  ): Promise<ExpenseClaim> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(id);
    return { success: true };
  }
}
