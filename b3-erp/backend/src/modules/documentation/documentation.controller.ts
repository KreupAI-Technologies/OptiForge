import { Controller, Get, Param, Query } from '@nestjs/common';
import { DocumentationService } from './documentation.service';

@Controller('documentation')
export class DocumentationController {
  constructor(private readonly service: DocumentationService) {}

  @Get('articles')
  findArticles(
    @Query('companyId') companyId?: string,
    @Query('category') category?: string,
    @Query('search') search?: string,
  ) {
    return this.service.findArticles(companyId, category, search);
  }

  @Get('articles/:slug')
  findBySlug(
    @Param('slug') slug: string,
    @Query('companyId') companyId?: string,
  ) {
    return this.service.findBySlug(slug, companyId);
  }
}
