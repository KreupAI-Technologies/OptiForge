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
import { CrmCampaignService } from './services/crm-campaign.service';
import { CrmCampaign } from './entities/crm-campaign.entity';

@Controller('crm/marketing-campaigns')
export class CrmCampaignController {
  constructor(private readonly service: CrmCampaignService) {}

  @Get()
  findAll(@Query('companyId') companyId?: string) {
    return this.service.findAll(companyId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() data: Partial<CrmCampaign>) {
    return this.service.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: Partial<CrmCampaign>) {
    return this.service.update(id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
