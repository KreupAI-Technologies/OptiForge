import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ConsolidationService } from '../services/consolidation.service';

@ApiTags('Logistics - Consolidation')
@Controller('logistics/consolidation')
export class ConsolidationController {
  constructor(private readonly consolidationService: ConsolidationService) {}

  @Get('opportunities')
  @ApiOperation({ summary: 'Find consolidation opportunities' })
  async opportunities() {
    try {
      return await this.consolidationService.findConsolidationOpportunities();
    } catch {
      return [];
    }
  }

  @Get('pending-orders')
  @ApiOperation({ summary: 'Get pending (unconsolidated) orders' })
  async pendingOrders() {
    try {
      return await this.consolidationService.getPendingOrders();
    } catch {
      return [];
    }
  }

  @Get('report')
  @ApiOperation({ summary: 'Get consolidation savings report' })
  async report() {
    try {
      return await this.consolidationService.getConsolidationReport();
    } catch {
      return null;
    }
  }

  @Post('consolidate')
  @ApiOperation({ summary: 'Consolidate a set of orders' })
  async consolidate(
    @Body()
    body: {
      orderIds: string[];
      type?: any;
      vehicleType?: string;
      scheduledDispatch?: string;
    },
  ) {
    return this.consolidationService.consolidateOrders(
      body.orderIds || [],
      body.type || 'same_route',
      body.vehicleType || 'Truck (10 Ton)',
      body.scheduledDispatch || new Date().toISOString(),
    );
  }

  @Post(':id/dispatch')
  @ApiOperation({ summary: 'Dispatch a consolidation' })
  async dispatch(@Param('id') id: string) {
    return this.consolidationService.dispatchConsolidation(id);
  }
}
