import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ReportCatalogService } from './services/report-catalog.service';
import { ReportCatalogItem } from './entities/report-catalog-item.entity';

/**
 * Catalog of available reports, grouped by module. Module report-landing pages
 * (e.g. /reports/financial) fetch their items by `module` and render cards.
 */
@ApiTags('Reports')
@ApiBearerAuth()
@Controller('reports/catalog')
export class ReportCatalogController {
  constructor(private readonly service: ReportCatalogService) {}

  @Get()
  @ApiOperation({ summary: 'List report catalog items for a company/module' })
  @ApiQuery({ name: 'companyId', required: true })
  @ApiQuery({ name: 'module', required: false })
  list(
    @Query('companyId') companyId: string,
    @Query('module') module?: string,
  ) {
    return this.service.list(companyId, module);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a report catalog item by id' })
  @ApiParam({ name: 'id' })
  @ApiQuery({ name: 'companyId', required: true })
  findOne(@Param('id') id: string, @Query('companyId') companyId: string) {
    return this.service.findOne(id, companyId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a report catalog item' })
  create(@Body() body: Partial<ReportCatalogItem>) {
    return this.service.create(body);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a report catalog item' })
  @ApiParam({ name: 'id' })
  update(
    @Param('id') id: string,
    @Body() body: Partial<ReportCatalogItem> & { companyId: string },
  ) {
    const { companyId, ...data } = body;
    return this.service.update(id, companyId, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete a report catalog item' })
  @ApiParam({ name: 'id' })
  @ApiQuery({ name: 'companyId', required: true })
  remove(@Param('id') id: string, @Query('companyId') companyId: string) {
    return this.service.remove(id, companyId);
  }
}
