import { Body, Controller, Get, Put, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SupportSlaSettingService } from '../services/support-sla-setting.service';
import { SupportSlaSetting } from '../entities/support-sla-setting.entity';

@ApiTags('Support SLA Settings')
@Controller('support/sla/settings')
export class SupportSlaSettingController {
  constructor(private readonly service: SupportSlaSettingService) {}

  @Get()
  findByCompany(
    @Query('companyId') companyId: string,
  ): Promise<SupportSlaSetting> {
    return this.service.findByCompany(companyId || 'company-1');
  }

  @Put()
  upsert(
    @Body() body: Partial<SupportSlaSetting> & { companyId?: string },
  ): Promise<SupportSlaSetting> {
    return this.service.upsert(body.companyId || 'company-1', body);
  }
}
