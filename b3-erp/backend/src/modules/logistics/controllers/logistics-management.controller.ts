import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { LogisticsManagementService } from '../services/logistics-management.service';

// Exposes the (previously unrouted) LogisticsManagementService methods that
// power the fleet-maintenance, driver-compliance, load-planning, dispatch,
// analytics/reports and analytics/spend dashboard pages.
@Controller('logistics/management')
export class LogisticsManagementController {
  constructor(private readonly service: LogisticsManagementService) {}

  private company(companyId?: string): string {
    return companyId || 'default-company-id';
  }

  // ---- Fleet maintenance ----
  @Get('vehicle-maintenance')
  getVehicleMaintenance(
    @Headers('x-company-id') companyId: string,
    @Query('vehicleId') vehicleId?: string,
    @Query('maintenanceType') maintenanceType?: string,
    @Query('status') status?: string,
  ) {
    return this.service.getVehicleMaintenanceRecords(this.company(companyId), {
      vehicleId,
      maintenanceType,
      status,
    });
  }

  @Post('vehicle-maintenance')
  createVehicleMaintenance(
    @Headers('x-company-id') companyId: string,
    @Body() data: any,
  ) {
    return this.service.createVehicleMaintenance({
      companyId: this.company(companyId),
      ...data,
    });
  }

  @Put('vehicle-maintenance/:id')
  updateVehicleMaintenance(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
    @Body() data: any,
  ) {
    return this.service.updateVehicleMaintenance(id, this.company(companyId), data);
  }

  // ---- Driver compliance ----
  @Get('driver-compliance')
  getDriverCompliance(
    @Headers('x-company-id') companyId: string,
    @Query('driverId') driverId?: string,
    @Query('complianceType') complianceType?: string,
    @Query('status') status?: string,
  ) {
    return this.service.getDriverComplianceRecords(this.company(companyId), {
      driverId,
      complianceType,
      status,
    });
  }

  @Post('driver-compliance')
  createDriverCompliance(
    @Headers('x-company-id') companyId: string,
    @Body() data: any,
  ) {
    return this.service.createDriverCompliance({
      companyId: this.company(companyId),
      ...data,
    });
  }

  @Put('driver-compliance/:id')
  updateDriverCompliance(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
    @Body() data: any,
  ) {
    return this.service.updateDriverCompliance(id, this.company(companyId), data);
  }

  // ---- Load planning ----
  @Get('load-plans')
  getLoadPlans(
    @Headers('x-company-id') companyId: string,
    @Query('loadType') loadType?: string,
    @Query('status') status?: string,
  ) {
    return this.service.getLoadPlans(this.company(companyId), {
      loadType,
      status,
    });
  }

  @Post('load-plans')
  createLoadPlan(
    @Headers('x-company-id') companyId: string,
    @Body() data: any,
  ) {
    return this.service.createLoadPlan({
      companyId: this.company(companyId),
      ...data,
    });
  }

  @Put('load-plans/:id')
  updateLoadPlan(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
    @Body() data: any,
  ) {
    return this.service.updateLoadPlan(id, this.company(companyId), data);
  }

  // ---- Dispatch board ----
  @Get('dispatch-board')
  getDispatchBoard(
    @Headers('x-company-id') companyId: string,
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.service.getDispatchBoard(this.company(companyId), {
      status,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  // ---- Analytics: dashboard, delivery performance, freight spend ----
  @Get('dashboard')
  getDashboard(@Headers('x-company-id') companyId: string) {
    return this.service.getLogisticsDashboard(this.company(companyId));
  }

  @Get('delivery-performance')
  getDeliveryPerformance(
    @Headers('x-company-id') companyId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate
      ? new Date(startDate)
      : new Date(end.getFullYear(), end.getMonth() - 6, end.getDate());
    return this.service.getDeliveryPerformanceReport(
      this.company(companyId),
      start,
      end,
    );
  }

  @Get('freight-spend')
  getFreightSpend(
    @Headers('x-company-id') companyId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate
      ? new Date(startDate)
      : new Date(end.getFullYear(), end.getMonth() - 6, end.getDate());
    return this.service.getFreightSpendAnalysis(
      this.company(companyId),
      start,
      end,
    );
  }
}
