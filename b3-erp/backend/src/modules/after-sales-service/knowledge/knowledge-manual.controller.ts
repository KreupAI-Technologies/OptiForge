import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { KnowledgeManualService } from './knowledge-manual.service';

@ApiTags('After Sales - Knowledge Manuals')
@Controller('after-sales-service/knowledge-manuals')
export class KnowledgeManualController {
  constructor(private readonly svc: KnowledgeManualService) {}

  @Get()
  @ApiOperation({ summary: 'List product manuals' })
  async findAll(
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('format') format?: string,
  ) {
    return this.svc.findAll({ search, category, format });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a product manual by id' })
  async findOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }
}
