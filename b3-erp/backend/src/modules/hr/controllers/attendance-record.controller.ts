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
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AttendanceRecordService } from '../services/attendance-record.service';
import { AttendanceRecord } from '../entities/attendance-record.entity';

@ApiTags('HR - Attendance Records')
@Controller('hr/attendance-records')
export class AttendanceRecordController {
  constructor(private readonly service: AttendanceRecordService) {}

  @Get()
  @ApiOperation({
    summary: 'Get attendance summary records (monthly/calendar/biometric/reports)',
  })
  @ApiQuery({ name: 'companyId', required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'period', required: false })
  @ApiQuery({ name: 'department', required: false })
  @ApiQuery({ name: 'search', required: false })
  findAll(
    @Query('companyId') companyId?: string,
    @Query('category') category?: string,
    @Query('status') status?: string,
    @Query('period') period?: string,
    @Query('department') department?: string,
    @Query('search') search?: string,
  ): Promise<AttendanceRecord[]> {
    return this.service.findAll({
      companyId,
      category,
      status,
      period,
      department,
      search,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an attendance record by ID' })
  findOne(@Param('id') id: string): Promise<AttendanceRecord> {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create an attendance record' })
  create(
    @Body() body: Partial<AttendanceRecord> & { companyId?: string },
  ): Promise<AttendanceRecord> {
    return this.service.create(body);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an attendance record' })
  update(
    @Param('id') id: string,
    @Body() body: Partial<AttendanceRecord>,
  ): Promise<AttendanceRecord> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an attendance record' })
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(id);
    return { success: true };
  }
}
