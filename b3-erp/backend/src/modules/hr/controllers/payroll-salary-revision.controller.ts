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
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { PayrollSalaryRevisionService } from '../services/payroll-salary-revision.service';
import { PayrollSalaryRevision } from '../entities/payroll-salary-revision.entity';

@ApiTags('HR - Payroll Salary Revisions')
@Controller('hr/salary-revisions')
export class PayrollSalaryRevisionController {
  constructor(private readonly service: PayrollSalaryRevisionService) {}

  @Get()
  @ApiOperation({ summary: 'Get salary revisions / increments' })
  @ApiQuery({ name: 'companyId', required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'search', required: false })
  findAll(
    @Query('companyId') companyId?: string,
    @Query('category') category?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ): Promise<PayrollSalaryRevision[]> {
    return this.service.findAll({ companyId, category, status, search });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a salary revision by ID' })
  findOne(@Param('id') id: string): Promise<PayrollSalaryRevision> {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a salary revision' })
  create(
    @Body() body: Partial<PayrollSalaryRevision> & { companyId?: string },
  ): Promise<PayrollSalaryRevision> {
    return this.service.create(body);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a salary revision' })
  update(
    @Param('id') id: string,
    @Body() body: Partial<PayrollSalaryRevision>,
  ): Promise<PayrollSalaryRevision> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a salary revision' })
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(id);
    return { success: true };
  }
}
