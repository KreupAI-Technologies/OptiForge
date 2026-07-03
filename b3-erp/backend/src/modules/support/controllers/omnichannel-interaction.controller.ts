import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { OmnichannelInteractionService } from '../services/omnichannel-interaction.service';
import { OmnichannelInteraction } from '../entities/omnichannel-interaction.entity';

@ApiTags('Support Omnichannel')
@Controller('support/omnichannel')
export class OmnichannelInteractionController {
  constructor(private readonly service: OmnichannelInteractionService) {}

  @Get()
  findAll(
    @Query('companyId') companyId: string,
    @Query('channel') channel?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ): Promise<OmnichannelInteraction[]> {
    return this.service.findAll(companyId || 'company-1', {
      channel,
      status,
      search,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<OmnichannelInteraction> {
    return this.service.findOne(id);
  }
}
