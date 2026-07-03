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
import { SupportFaqService } from '../services/support-faq.service';
import { SupportFaq } from '../entities/support-faq.entity';

@ApiTags('Support FAQs')
@Controller('support/knowledge/faqs')
export class SupportFaqController {
  constructor(private readonly service: SupportFaqService) {}

  @Get()
  findAll(
    @Query('companyId') companyId: string,
    @Query('category') category?: string,
    @Query('featured') featured?: string,
  ): Promise<SupportFaq[]> {
    return this.service.findAll(companyId || 'company-1', {
      category,
      featured: featured === undefined ? undefined : featured === 'true',
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<SupportFaq> {
    return this.service.findOne(id);
  }

  @Post()
  create(
    @Body() body: Partial<SupportFaq> & { companyId: string },
  ): Promise<SupportFaq> {
    return this.service.create({
      ...body,
      companyId: body.companyId || 'company-1',
    });
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<SupportFaq>,
  ): Promise<SupportFaq> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(id);
    return { success: true };
  }
}
