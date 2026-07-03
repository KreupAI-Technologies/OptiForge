import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TimesheetService } from '../services/timesheet.service';
import { Timesheet } from '../entities/timesheet.entity';

@ApiTags('HR - Timesheet')
@Controller('hr/timesheets')
export class TimesheetController {
  constructor(private readonly service: TimesheetService) {}

  @Get()
  findAll(
    @Query('companyId') companyId: string,
    @Query('status') status?: string,
  ): Promise<Timesheet[]> {
    return this.service.findAll(companyId || 'company-1', status);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Timesheet> {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() body: Partial<Timesheet> & { companyId: string }): Promise<Timesheet> {
    return this.service.create({
      ...body,
      companyId: body.companyId || 'company-1',
    });
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: Partial<Timesheet>): Promise<Timesheet> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(id);
    return { success: true };
  }
}
