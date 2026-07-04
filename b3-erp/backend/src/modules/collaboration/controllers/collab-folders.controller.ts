import { Controller, Get, Headers, Query } from '@nestjs/common';
import { CollaborationService } from '../services/collaboration.service';

@Controller('collaboration/folders')
export class CollabFoldersController {
  constructor(private readonly service: CollaborationService) {}

  @Get()
  findAll(
    @Headers('x-company-id') companyId: string,
    @Query('companyId') companyIdQuery?: string,
  ) {
    return this.service.findFolders(companyId || companyIdQuery);
  }
}
