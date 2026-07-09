import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ComplianceCertificateService } from '../services/compliance-certificate.service';
import { ComplianceCertificate } from '../entities/compliance-certificate.entity';

@ApiTags('HR - Compliance Certificates')
@Controller('hr/compliance-certificates')
export class ComplianceCertificateController {
  constructor(private readonly service: ComplianceCertificateService) {}

  @Get()
  findAll(
    @Query('companyId') companyId: string,
    @Query('status') status?: string,
  ): Promise<ComplianceCertificate[]> {
    return this.service.findAll(companyId || 'company-1', status);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<ComplianceCertificate> {
    return this.service.findOne(id);
  }

  @Post()
  create(
    @Body() body: Partial<ComplianceCertificate> & { companyId: string },
  ): Promise<ComplianceCertificate> {
    return this.service.create({
      ...body,
      companyId: body.companyId || 'company-1',
    });
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<ComplianceCertificate>,
  ): Promise<ComplianceCertificate> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(id);
    return { success: true };
  }
}
