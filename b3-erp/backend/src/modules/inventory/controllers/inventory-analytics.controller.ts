import { Controller, Get, Query } from '@nestjs/common';
import { InventoryAnalyticsService } from '../services/inventory-analytics.service';

/**
 * Read-only inventory analytics derived from StockBalance.
 * No new tables — all figures computed on the fly.
 */
@Controller('inventory/analytics')
export class InventoryAnalyticsController {
    constructor(private readonly analyticsService: InventoryAnalyticsService) {}

    @Get('aging')
    getAging(@Query('warehouseId') warehouseId?: string) {
        return this.analyticsService.getAgingItems(warehouseId);
    }

    @Get('dead-stock')
    getDeadStock(@Query('warehouseId') warehouseId?: string, @Query('thresholdDays') thresholdDays?: string) {
        return this.analyticsService.getDeadStock(warehouseId, thresholdDays ? Number(thresholdDays) : 180);
    }

    @Get('velocity')
    getVelocity(@Query('warehouseId') warehouseId?: string) {
        return this.analyticsService.getVelocity(warehouseId);
    }

    @Get('turnover')
    getTurnover(@Query('warehouseId') warehouseId?: string) {
        return this.analyticsService.getTurnover(warehouseId);
    }

    @Get('carrying-cost')
    getCarryingCost(@Query('warehouseId') warehouseId?: string, @Query('holdingRatePct') holdingRatePct?: string) {
        return this.analyticsService.getCarryingCost(warehouseId, holdingRatePct ? Number(holdingRatePct) : 22);
    }

    @Get('optimization')
    getOptimization(@Query('warehouseId') warehouseId?: string) {
        return this.analyticsService.getOptimization(warehouseId);
    }
}
