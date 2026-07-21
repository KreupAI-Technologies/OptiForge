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
import { CertificationTrackingService } from '../services/certification-tracking.service';
import { CertificationTracking } from '../entities/certification-tracking.entity';

@ApiTags('HR - Certifications')
@Controller('hr/certifications')
export class CertificationTrackingController {
  constructor(private readonly service: CertificationTrackingService) {}

  @Get()
  findAll(
    @Query('companyId') companyId: string,
    @Query('employeeId') employeeId?: string,
    @Query('status') status?: string,
  ): Promise<CertificationTracking[]> {
    return this.service.findAll(companyId || 'company-1', {
      employeeId,
      status,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<CertificationTracking> {
    return this.service.findOne(id);
  }

  @Post()
  create(
    @Body() body: Partial<CertificationTracking> & { companyId: string },
  ): Promise<CertificationTracking> {
    return this.service.create({
      ...body,
      companyId: body.companyId || 'company-1',
    });
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<CertificationTracking>,
  ): Promise<CertificationTracking> {
    return this.service.update(id, body);
  }

  @Post(':id/renew')
  renew(
    @Param('id') id: string,
    @Body() body: { newExpiryDate: string; cost?: number; remarks?: string },
  ): Promise<CertificationTracking> {
    return this.service.renew(id, body);
  }

  @Post(':id/upload')
  upload(
    @Param('id') id: string,
    @Body() body: { fileUrl: string },
  ): Promise<CertificationTracking> {
    return this.service.uploadCertificate(id, body?.fileUrl ?? '');
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(id);
    return { success: true };
  }
}
