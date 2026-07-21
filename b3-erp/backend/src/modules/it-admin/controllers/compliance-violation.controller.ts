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
import { ComplianceViolationService } from '../services/compliance-violation.service';
import { ComplianceViolation } from '../entities/compliance-violation.entity';

@ApiTags('IT Admin - Compliance Violations')
@Controller('it-admin/compliance-violations')
export class ComplianceViolationController {
  constructor(private readonly service: ComplianceViolationService) {}

  @Get()
  @ApiOperation({ summary: 'List compliance violations' })
  @ApiQuery({ name: 'companyId', required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'severity', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'requirementId', required: false })
  async findAll(
    @Query('companyId') companyId?: string,
    @Query('category') category?: string,
    @Query('severity') severity?: string,
    @Query('status') status?: string,
    @Query('requirementId') requirementId?: string,
  ): Promise<ComplianceViolation[]> {
    return this.service.findAll({
      companyId,
      category,
      severity,
      status,
      requirementId,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get compliance violation by ID' })
  async findOne(@Param('id') id: string): Promise<ComplianceViolation> {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create compliance violation' })
  async create(
    @Body() data: Partial<ComplianceViolation>,
  ): Promise<ComplianceViolation> {
    return this.service.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update / resolve compliance violation' })
  async update(
    @Param('id') id: string,
    @Body() data: Partial<ComplianceViolation> & { resolvedBy?: string },
  ): Promise<ComplianceViolation> {
    // Convenience: a bare { status: 'Resolved' } (optionally with resolvedBy)
    // routes through resolve() so resolvedAt is stamped consistently.
    if (data.status === 'Resolved' && Object.keys(data).length <= 2) {
      return this.service.resolve(id, data.resolvedBy);
    }
    return this.service.update(id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete compliance violation' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }
}
