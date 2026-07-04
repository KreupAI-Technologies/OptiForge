import { Controller, Get, Headers, Query } from '@nestjs/common';
import { CollaborationService } from '../services/collaboration.service';

@Controller('collaboration/files')
export class CollabFilesController {
  constructor(private readonly service: CollaborationService) {}

  @Get()
  findAll(
    @Headers('x-company-id') companyId: string,
    @Query('companyId') companyIdQuery?: string,
  ) {
    return this.service.findFiles(companyId || companyIdQuery);
  }
}
