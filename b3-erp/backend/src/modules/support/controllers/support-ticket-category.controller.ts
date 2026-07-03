import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SupportTicketCategoryService } from '../services/support-ticket-category.service';
import { SupportTicketCategory } from '../entities/support-ticket-category.entity';

@ApiTags('Support Ticket Categories')
@Controller('support/tickets/categories')
export class SupportTicketCategoryController {
  constructor(private readonly service: SupportTicketCategoryService) {}

  @Get()
  findAll(
    @Query('companyId') companyId: string,
  ): Promise<SupportTicketCategory[]> {
    return this.service.findAll(companyId || 'company-1');
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<SupportTicketCategory> {
    return this.service.findOne(id);
  }

  @Post()
  create(
    @Body() body: Partial<SupportTicketCategory> & { companyId: string },
  ): Promise<SupportTicketCategory> {
    return this.service.create({
      ...body,
      companyId: body.companyId || 'company-1',
    });
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<SupportTicketCategory>,
  ): Promise<SupportTicketCategory> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(id);
    return { success: true };
  }
}
