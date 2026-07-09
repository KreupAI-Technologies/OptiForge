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
import { PayrollStatutoryFilingService } from '../services/payroll-statutory-filing.service';
import { PayrollStatutoryFiling } from '../entities/payroll-statutory-filing.entity';

@ApiTags('HR - Payroll Statutory Filings')
@Controller('hr/statutory-filings')
export class PayrollStatutoryFilingController {
  constructor(private readonly service: PayrollStatutoryFilingService) {}

  @Get()
  @ApiOperation({ summary: 'Get PF/ESI/PT statutory filings' })
  @ApiQuery({ name: 'companyId', required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'search', required: false })
  findAll(
    @Query('companyId') companyId?: string,
    @Query('category') category?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ): Promise<PayrollStatutoryFiling[]> {
    return this.service.findAll({ companyId, category, status, search });
  }

  @Get('summary')
  @ApiOperation({ summary: 'Aggregate statutory filings grouped by category' })
  @ApiQuery({ name: 'companyId', required: false })
  getSummary(@Query('companyId') companyId?: string) {
    return this.service.summary(companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a statutory filing by ID' })
  findOne(@Param('id') id: string): Promise<PayrollStatutoryFiling> {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a statutory filing' })
  create(
    @Body() body: Partial<PayrollStatutoryFiling> & { companyId?: string },
  ): Promise<PayrollStatutoryFiling> {
    return this.service.create(body);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a statutory filing' })
  update(
    @Param('id') id: string,
    @Body() body: Partial<PayrollStatutoryFiling>,
  ): Promise<PayrollStatutoryFiling> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a statutory filing' })
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(id);
    return { success: true };
  }
}
