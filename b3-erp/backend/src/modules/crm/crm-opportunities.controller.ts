import { Controller, Get } from '@nestjs/common';
import { CrmOpportunitiesService } from './services/crm-opportunities.service';

@Controller('crm/opportunities-views')
export class CrmOpportunitiesController {
  constructor(private readonly service: CrmOpportunitiesService) {}

  @Get('pipeline')
  getPipeline() {
    return this.service.getPipeline();
  }

  @Get('won')
  getWon() {
    return this.service.getWon();
  }

  @Get('lost')
  getLost() {
    return this.service.getLost();
  }
}
