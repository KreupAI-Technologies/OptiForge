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
import { ApiTags } from '@nestjs/swagger';
import { TrainingScheduleService } from '../services/training-schedule.service';
import { TrainingSchedule } from '../entities/training-schedule.entity';

@ApiTags('HR - Training Schedules')
@Controller('hr/training-schedules')
export class TrainingScheduleController {
  constructor(private readonly service: TrainingScheduleService) {}

  @Get()
  findAll(
    @Query('companyId') companyId: string,
    @Query('programId') programId?: string,
    @Query('status') status?: string,
  ): Promise<TrainingSchedule[]> {
    return this.service.findAll(companyId || 'company-1', { programId, status });
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<TrainingSchedule> {
    return this.service.findOne(id);
  }

  @Post()
  create(
    @Body() body: Partial<TrainingSchedule> & { companyId: string },
  ): Promise<TrainingSchedule> {
    return this.service.create({
      ...body,
      companyId: body.companyId || 'company-1',
    });
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<TrainingSchedule>,
  ): Promise<TrainingSchedule> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(id);
    return { success: true };
  }
}
