import { Controller, Get, Headers, Query } from '@nestjs/common';
import { CollaborationService } from '../services/collaboration.service';

@Controller('collaboration/messages')
export class CollabMessagesController {
  constructor(private readonly service: CollaborationService) {}

  @Get()
  findAll(
    @Headers('x-company-id') companyId: string,
    @Query('companyId') companyIdQuery?: string,
    @Query('channelId') channelId?: string,
  ) {
    return this.service.findMessages(companyId || companyIdQuery, channelId);
  }
}
