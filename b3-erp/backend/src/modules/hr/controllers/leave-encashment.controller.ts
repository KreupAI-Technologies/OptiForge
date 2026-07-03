import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LeaveEncashmentService } from '../services/leave-encashment.service';
import { LeaveEncashment } from '../entities/leave-encashment.entity';

@ApiTags('HR - LeaveEncashment')
@Controller('hr/leave-encashments')
export class LeaveEncashmentController {
  constructor(private readonly service: LeaveEncashmentService) {}

  @Get()
  findAll(
    @Query('companyId') companyId: string,
    @Query('status') status?: string,
  ): Promise<LeaveEncashment[]> {
    return this.service.findAll(companyId || 'company-1', status);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<LeaveEncashment> {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() body: Partial<LeaveEncashment> & { companyId: string }): Promise<LeaveEncashment> {
    return this.service.create({
      ...body,
      companyId: body.companyId || 'company-1',
    });
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<LeaveEncashment>,
  ): Promise<LeaveEncashment> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(id);
    return { success: true };
  }
}
