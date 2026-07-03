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
import { SupportScheduledChangeService } from '../services/support-scheduled-change.service';
import { SupportScheduledChange } from '../entities/support-scheduled-change.entity';

@ApiTags('Support Scheduled Changes')
@Controller('support/changes/scheduled')
export class SupportScheduledChangeController {
  constructor(private readonly service: SupportScheduledChangeService) {}

  @Get()
  findAll(
    @Query('companyId') companyId: string,
  ): Promise<SupportScheduledChange[]> {
    return this.service.findAll(companyId || 'company-1');
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<SupportScheduledChange> {
    return this.service.findOne(id);
  }

  @Post()
  create(
    @Body() body: Partial<SupportScheduledChange> & { companyId: string },
  ): Promise<SupportScheduledChange> {
    return this.service.create({ ...body, companyId: body.companyId || 'company-1' });
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<SupportScheduledChange>,
  ): Promise<SupportScheduledChange> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(id);
    return { success: true };
  }
}
