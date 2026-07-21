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
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ComplianceRequirementService } from '../services/compliance-requirement.service';
import { ComplianceRequirement } from '../entities/compliance-requirement.entity';

@ApiTags('IT Admin - Compliance Requirements')
@Controller('it-admin/compliance-requirements')
export class ComplianceRequirementController {
  constructor(private readonly service: ComplianceRequirementService) {}

  @Get()
  @ApiOperation({ summary: 'List compliance requirements' })
  @ApiQuery({ name: 'companyId', required: false })
  @ApiQuery({ name: 'standard', required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'severity', required: false })
  async findAll(
    @Query('companyId') companyId?: string,
    @Query('standard') standard?: string,
    @Query('category') category?: string,
    @Query('status') status?: string,
    @Query('severity') severity?: string,
  ): Promise<ComplianceRequirement[]> {
    return this.service.findAll({
      companyId,
      standard,
      category,
      status,
      severity,
    });
  }

  @Get('report')
  @ApiOperation({ summary: 'Generate aggregated compliance report' })
  @ApiQuery({ name: 'companyId', required: false })
  async report(@Query('companyId') companyId?: string) {
    return this.service.generateReport(companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get compliance requirement by ID' })
  async findOne(@Param('id') id: string): Promise<ComplianceRequirement> {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create compliance requirement' })
  async create(
    @Body() data: Partial<ComplianceRequirement>,
  ): Promise<ComplianceRequirement> {
    return this.service.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update compliance requirement' })
  async update(
    @Param('id') id: string,
    @Body() data: Partial<ComplianceRequirement>,
  ): Promise<ComplianceRequirement> {
    return this.service.update(id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete compliance requirement' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }
}
