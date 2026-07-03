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
import { SupportTroubleshootingArticleService } from '../services/support-troubleshooting-article.service';
import { SupportTroubleshootingArticle } from '../entities/support-troubleshooting-article.entity';

@ApiTags('Support Troubleshooting Articles')
@Controller('support/knowledge/troubleshooting')
export class SupportTroubleshootingArticleController {
  constructor(
    private readonly service: SupportTroubleshootingArticleService,
  ) {}

  @Get()
  findAll(
    @Query('companyId') companyId: string,
  ): Promise<SupportTroubleshootingArticle[]> {
    return this.service.findAll(companyId || 'company-1');
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<SupportTroubleshootingArticle> {
    return this.service.findOne(id);
  }

  @Post()
  create(
    @Body() body: Partial<SupportTroubleshootingArticle> & { companyId: string },
  ): Promise<SupportTroubleshootingArticle> {
    return this.service.create({ ...body, companyId: body.companyId || 'company-1' });
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<SupportTroubleshootingArticle>,
  ): Promise<SupportTroubleshootingArticle> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(id);
    return { success: true };
  }
}
