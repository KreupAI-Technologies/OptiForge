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
import { CertificateRequestService } from '../services/certificate-request.service';
import { CertificateRequest } from '../entities/certificate-request.entity';

@ApiTags('HR - Certificate Requests')
@Controller('hr/certificate-requests')
export class CertificateRequestController {
  constructor(private readonly service: CertificateRequestService) {}

  @Get()
  findAll(
    @Query('companyId') companyId: string,
    @Query('recordType') recordType?: string,
  ): Promise<CertificateRequest[]> {
    return this.service.findAll(companyId || 'company-1', recordType);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<CertificateRequest> {
    return this.service.findOne(id);
  }

  @Post()
  create(
    @Body() body: Partial<CertificateRequest> & { companyId: string },
  ): Promise<CertificateRequest> {
    return this.service.create({
      ...body,
      companyId: body.companyId || 'company-1',
    });
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<CertificateRequest>,
  ): Promise<CertificateRequest> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(id);
    return { success: true };
  }
}
