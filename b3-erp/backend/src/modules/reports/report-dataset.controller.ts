import {
  Controller,
  Get,
  Put,
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
import { ReportDatasetService } from './services/report-dataset.service';

/**
 * Generic report dataset endpoints. Report pages fetch their pre-computed
 * dataset by reportKey (e.g. "finance.ar-aging") and render `payload`.
 */
@ApiTags('Reports')
@ApiBearerAuth()
@Controller('reports/datasets')
export class ReportDatasetController {
  constructor(private readonly service: ReportDatasetService) {}

  @Get()
  @ApiOperation({ summary: 'List stored report datasets for a company' })
  @ApiQuery({ name: 'companyId', required: true })
  @ApiQuery({ name: 'category', required: false })
  list(
    @Query('companyId') companyId: string,
    @Query('category') category?: string,
  ) {
    return this.service.list(companyId, category);
  }

  @Get(':reportKey')
  @ApiOperation({ summary: 'Get a stored report dataset by reportKey' })
  @ApiParam({ name: 'reportKey', description: 'e.g. finance.ar-aging' })
  @ApiQuery({ name: 'companyId', required: true })
  getByKey(
    @Param('reportKey') reportKey: string,
    @Query('companyId') companyId: string,
  ) {
    return this.service.getByKey(companyId, reportKey);
  }

  @Put(':reportKey')
  @ApiOperation({ summary: 'Upsert a report dataset for a reportKey' })
  @ApiParam({ name: 'reportKey', description: 'e.g. finance.ar-aging' })
  upsert(
    @Param('reportKey') reportKey: string,
    @Body()
    body: {
      companyId: string;
      title?: string;
      category?: string;
      payload?: Record<string, unknown>;
    },
  ) {
    const { companyId, title, category, payload } = body;
    return this.service.upsert(companyId, reportKey, { title, category, payload });
  }
}
