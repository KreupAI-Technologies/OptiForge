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
import { ComplianceAuditService } from '../services/compliance-audit.service';
import { ComplianceAudit } from '../entities/compliance-audit.entity';

@ApiTags('HR - Compliance Audits')
@Controller('hr/compliance-audits')
export class ComplianceAuditController {
  constructor(private readonly service: ComplianceAuditService) {}

  @Get()
  findAll(@Query('companyId') companyId: string): Promise<ComplianceAudit[]> {
    return this.service.findAll(companyId || 'company-1');
  }

  @Get('summary')
  summary(@Query('companyId') companyId: string) {
    return this.service.summary(companyId || 'company-1');
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<ComplianceAudit> {
    return this.service.findOne(id);
  }

  @Post()
  create(
    @Body() body: Partial<ComplianceAudit> & { companyId: string },
  ): Promise<ComplianceAudit> {
    return this.service.create({
      ...body,
      companyId: body.companyId || 'company-1',
    });
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<ComplianceAudit>,
  ): Promise<ComplianceAudit> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(id);
    return { success: true };
  }
}
