import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CrmEmailCampaignService } from './services/crm-email-campaign.service';
import { CrmEmailCampaign } from './entities/crm-email-campaign.entity';

@Controller('crm/email-campaigns')
export class CrmEmailCampaignController {
  constructor(private readonly service: CrmEmailCampaignService) {}

  @Get()
  findAll(@Query('companyId') companyId?: string) {
    return this.service.findAll(companyId);
  }

  @Get('performance')
  getPerformance(@Query('companyId') companyId?: string) {
    return this.service.getPerformance(companyId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() data: Partial<CrmEmailCampaign>) {
    return this.service.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: Partial<CrmEmailCampaign>) {
    return this.service.update(id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
