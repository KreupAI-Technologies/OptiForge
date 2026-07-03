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
import { SupportGuideService } from '../services/support-guide.service';
import { SupportGuide } from '../entities/support-guide.entity';

@ApiTags('Support Guides')
@Controller('support/knowledge/guides')
export class SupportGuideController {
  constructor(private readonly service: SupportGuideService) {}

  @Get()
  findAll(@Query('companyId') companyId: string): Promise<SupportGuide[]> {
    return this.service.findAll(companyId || 'company-1');
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<SupportGuide> {
    return this.service.findOne(id);
  }

  @Post()
  create(
    @Body() body: Partial<SupportGuide> & { companyId: string },
  ): Promise<SupportGuide> {
    return this.service.create({ ...body, companyId: body.companyId || 'company-1' });
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<SupportGuide>,
  ): Promise<SupportGuide> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(id);
    return { success: true };
  }
}
