import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { KnowledgeFaqService } from './knowledge-faq.service';

@ApiTags('After Sales - Knowledge FAQs')
@Controller('after-sales-service/knowledge-faqs')
export class KnowledgeFaqController {
  constructor(private readonly svc: KnowledgeFaqService) {}

  @Get()
  @ApiOperation({ summary: 'List knowledge base FAQs' })
  async findAll(
    @Query('search') search?: string,
    @Query('category') category?: string,
  ) {
    return this.svc.findAll({ search, category });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a knowledge base FAQ by id' })
  async findOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }
}
