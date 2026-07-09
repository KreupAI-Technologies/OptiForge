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
import { ReportDashboardService } from './services/report-dashboard.service';
import { ReportDashboard } from './entities/report-dashboard.entity';

/**
 * User-saved custom dashboards ("My Dashboards" on /reports/dashboards).
 * Additive TypeORM-backed store, independent of any Prisma model.
 */
@ApiTags('Reports')
@ApiBearerAuth()
@Controller('reports/custom-dashboards')
export class ReportDashboardController {
  constructor(private readonly service: ReportDashboardService) {}

  @Get()
  @ApiOperation({ summary: 'List saved dashboards for a company' })
  @ApiQuery({ name: 'companyId', required: true })
  @ApiQuery({ name: 'category', required: false })
  list(
    @Query('companyId') companyId: string,
    @Query('category') category?: string,
  ) {
    return this.service.list(companyId, category);
  }

  @Get('widget-data')
  @ApiOperation({
    summary: 'Live cross-module widget data for dashboard widgets',
  })
  @ApiQuery({ name: 'companyId', required: true })
  @ApiQuery({ name: 'dashboardId', required: false })
  widgetData(
    @Query('companyId') companyId: string,
    @Query('dashboardId') dashboardId?: string,
  ) {
    return this.service.getWidgetData(companyId, dashboardId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a saved dashboard by id' })
  @ApiParam({ name: 'id' })
  @ApiQuery({ name: 'companyId', required: true })
  findOne(@Param('id') id: string, @Query('companyId') companyId: string) {
    return this.service.findOne(id, companyId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a saved dashboard' })
  create(@Body() body: Partial<ReportDashboard>) {
    return this.service.create(body);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a saved dashboard' })
  @ApiParam({ name: 'id' })
  update(
    @Param('id') id: string,
    @Body() body: Partial<ReportDashboard> & { companyId: string },
  ) {
    const { companyId, ...data } = body;
    return this.service.update(id, companyId, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete a saved dashboard' })
  @ApiParam({ name: 'id' })
  @ApiQuery({ name: 'companyId', required: true })
  remove(@Param('id') id: string, @Query('companyId') companyId: string) {
    return this.service.remove(id, companyId);
  }
}
