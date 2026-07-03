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
import { ComplianceLicenseService } from '../services/compliance-license.service';
import { ComplianceLicense } from '../entities/compliance-license.entity';

@ApiTags('HR - Compliance Licenses')
@Controller('hr/compliance-licenses')
export class ComplianceLicenseController {
  constructor(private readonly service: ComplianceLicenseService) {}

  @Get()
  findAll(
    @Query('companyId') companyId: string,
    @Query('recordType') recordType?: string,
  ): Promise<ComplianceLicense[]> {
    return this.service.findAll(companyId || 'company-1', recordType);
  }

  @Get('summary')
  summary(
    @Query('companyId') companyId: string,
    @Query('recordType') recordType?: string,
  ) {
    return this.service.summary(companyId || 'company-1', recordType);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<ComplianceLicense> {
    return this.service.findOne(id);
  }

  @Post()
  create(
    @Body() body: Partial<ComplianceLicense> & { companyId: string },
  ): Promise<ComplianceLicense> {
    return this.service.create({
      ...body,
      companyId: body.companyId || 'company-1',
    });
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<ComplianceLicense>,
  ): Promise<ComplianceLicense> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(id);
    return { success: true };
  }
}
