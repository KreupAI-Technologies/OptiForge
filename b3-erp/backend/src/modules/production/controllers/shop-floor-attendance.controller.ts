import {
  Controller, Get, Post, Body, Query, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ShopFloorAttendanceService } from '../services/shop-floor-attendance.service';
import { ShopFloorAttendance } from '../entities/shop-floor-attendance.entity';

@ApiTags('Production - Shop Floor Attendance')
@Controller('production/shopfloor/attendance')
export class ShopFloorAttendanceController {
  constructor(private readonly service: ShopFloorAttendanceService) {}

  @Post('start-shift')
  @ApiOperation({ summary: 'Operator start-shift (clock in)' })
  @ApiResponse({ status: HttpStatus.CREATED })
  async startShift(@Body() dto: Partial<ShopFloorAttendance>): Promise<ShopFloorAttendance> {
    return this.service.startShift(dto);
  }

  @Post('end-shift')
  @ApiOperation({ summary: 'Operator end-shift (clock out) with production summary' })
  @ApiResponse({ status: HttpStatus.CREATED })
  async endShift(
    @Body() dto: Partial<ShopFloorAttendance> & { id?: string },
  ): Promise<ShopFloorAttendance> {
    return this.service.endShift(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List shop-floor attendance records' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'operatorId', required: false })
  @ApiQuery({ name: 'shiftDate', required: false })
  async findAll(
    @Query('status') status?: string,
    @Query('operatorId') operatorId?: string,
    @Query('shiftDate') shiftDate?: string,
  ): Promise<ShopFloorAttendance[]> {
    return this.service.findAll({ status, operatorId, shiftDate });
  }
}
