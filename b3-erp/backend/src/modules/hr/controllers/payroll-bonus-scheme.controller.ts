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
import { PayrollBonusSchemeService } from '../services/payroll-bonus-scheme.service';
import { PayrollBonusScheme } from '../entities/payroll-bonus-scheme.entity';

@ApiTags('HR - Payroll Bonus Schemes')
@Controller('hr/bonus-schemes')
export class PayrollBonusSchemeController {
  constructor(private readonly service: PayrollBonusSchemeService) {}

  @Get()
  @ApiOperation({ summary: 'Get bonus scheme definitions' })
  @ApiQuery({ name: 'companyId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'schemeType', required: false })
  @ApiQuery({ name: 'search', required: false })
  findAll(
    @Query('companyId') companyId?: string,
    @Query('status') status?: string,
    @Query('schemeType') schemeType?: string,
    @Query('search') search?: string,
  ): Promise<PayrollBonusScheme[]> {
    return this.service.findAll({ companyId, status, schemeType, search });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a bonus scheme by ID' })
  findOne(@Param('id') id: string): Promise<PayrollBonusScheme> {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a bonus scheme' })
  create(
    @Body() body: Partial<PayrollBonusScheme> & { companyId?: string },
  ): Promise<PayrollBonusScheme> {
    return this.service.create(body);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a bonus scheme' })
  update(
    @Param('id') id: string,
    @Body() body: Partial<PayrollBonusScheme>,
  ): Promise<PayrollBonusScheme> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a bonus scheme' })
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(id);
    return { success: true };
  }
}
