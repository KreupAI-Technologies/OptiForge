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
import { CPQApprovalItem } from '../entities/cpq-approval-item.entity';
import { CPQApprovalItemService } from '../services/cpq-approval-item.service';

@Controller('cpq/approval-items')
export class CPQApprovalItemController {
  constructor(
    private readonly cpqApprovalItemService: CPQApprovalItemService,
  ) {}

  @Get()
  findAll(
    @Headers('x-company-id') companyId: string,
    @Query('category') category?: string,
    @Query('status') status?: string,
  ): Promise<CPQApprovalItem[]> {
    return this.cpqApprovalItemService.findAll(companyId, { category, status });
  }

  @Get(':id')
  findOne(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
  ): Promise<CPQApprovalItem> {
    return this.cpqApprovalItemService.findOne(companyId, id);
  }

  @Post()
  create(
    @Headers('x-company-id') companyId: string,
    @Body() data: Partial<CPQApprovalItem>,
  ): Promise<CPQApprovalItem> {
    return this.cpqApprovalItemService.create(companyId, data);
  }

  @Patch(':id')
  update(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
    @Body() data: Partial<CPQApprovalItem>,
  ): Promise<CPQApprovalItem> {
    return this.cpqApprovalItemService.update(companyId, id, data);
  }

  @Post(':id/decision')
  decide(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
    @Body() body: { status: CPQApprovalItem['status'] },
  ): Promise<CPQApprovalItem> {
    return this.cpqApprovalItemService.decide(companyId, id, body.status);
  }

  @Post(':id/comments')
  addComment(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
    @Body() body: { text: string; author?: string },
  ): Promise<CPQApprovalItem> {
    return this.cpqApprovalItemService.addComment(companyId, id, body);
  }

  @Delete(':id')
  remove(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
  ): Promise<void> {
    return this.cpqApprovalItemService.remove(companyId, id);
  }
}
