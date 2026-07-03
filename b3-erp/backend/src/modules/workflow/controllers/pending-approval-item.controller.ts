import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { PendingApprovalItem } from '../entities/pending-approval-item.entity';
import { PendingApprovalItemService } from '../services/pending-approval-item.service';

@Controller('workflow/pending-approvals')
export class PendingApprovalItemController {
  constructor(
    private readonly pendingApprovalService: PendingApprovalItemService,
  ) {}

  @Post()
  create(
    @Headers('x-company-id') companyId: string,
    @Body() data: Partial<PendingApprovalItem>,
  ): Promise<PendingApprovalItem> {
    return this.pendingApprovalService.create(companyId, data);
  }

  @Get()
  findAll(
    @Headers('x-company-id') companyId: string,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
  ): Promise<PendingApprovalItem[]> {
    return this.pendingApprovalService.findAll(companyId, { status, priority });
  }

  @Get(':id')
  findOne(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
  ): Promise<PendingApprovalItem> {
    return this.pendingApprovalService.findOne(companyId, id);
  }

  @Patch(':id')
  update(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
    @Body() data: Partial<PendingApprovalItem>,
  ): Promise<PendingApprovalItem> {
    return this.pendingApprovalService.update(companyId, id, data);
  }

  @Delete(':id')
  delete(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
  ): Promise<void> {
    return this.pendingApprovalService.delete(companyId, id);
  }
}
