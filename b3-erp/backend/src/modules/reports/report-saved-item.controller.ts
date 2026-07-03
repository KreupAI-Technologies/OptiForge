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
import { ReportSavedItemService } from './services/report-saved-item.service';
import { ReportSavedItem } from './entities/report-saved-item.entity';

/**
 * User-saved / custom reports ("My Reports" on the custom report builder).
 * Additive TypeORM-backed store, independent of the Prisma SavedReport model.
 */
@ApiTags('Reports')
@ApiBearerAuth()
@Controller('reports/saved-items')
export class ReportSavedItemController {
  constructor(private readonly service: ReportSavedItemService) {}

  @Get()
  @ApiOperation({ summary: 'List saved/custom reports for a company' })
  @ApiQuery({ name: 'companyId', required: true })
  @ApiQuery({ name: 'category', required: false })
  list(
    @Query('companyId') companyId: string,
    @Query('category') category?: string,
  ) {
    return this.service.list(companyId, category);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a saved report by id' })
  @ApiParam({ name: 'id' })
  @ApiQuery({ name: 'companyId', required: true })
  findOne(@Param('id') id: string, @Query('companyId') companyId: string) {
    return this.service.findOne(id, companyId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a saved/custom report' })
  create(@Body() body: Partial<ReportSavedItem>) {
    return this.service.create(body);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a saved/custom report' })
  @ApiParam({ name: 'id' })
  update(
    @Param('id') id: string,
    @Body() body: Partial<ReportSavedItem> & { companyId: string },
  ) {
    const { companyId, ...data } = body;
    return this.service.update(id, companyId, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete a saved/custom report' })
  @ApiParam({ name: 'id' })
  @ApiQuery({ name: 'companyId', required: true })
  remove(@Param('id') id: string, @Query('companyId') companyId: string) {
    return this.service.remove(id, companyId);
  }
}
