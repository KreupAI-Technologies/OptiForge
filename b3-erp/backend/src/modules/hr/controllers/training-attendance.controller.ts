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
import { TrainingAttendanceService } from '../services/training-attendance.service';
import { TrainingAttendance } from '../entities/training-attendance.entity';

@ApiTags('HR - Training Attendance')
@Controller('hr/training-attendance')
export class TrainingAttendanceController {
  constructor(private readonly service: TrainingAttendanceService) {}

  @Get()
  findAll(
    @Query('companyId') companyId: string,
    @Query('scheduleId') scheduleId?: string,
    @Query('enrollmentId') enrollmentId?: string,
    @Query('date') date?: string,
  ): Promise<TrainingAttendance[]> {
    return this.service.findAll(companyId || 'company-1', {
      scheduleId,
      enrollmentId,
      date,
    });
  }

  @Post()
  create(
    @Body() body: Partial<TrainingAttendance> & { companyId: string },
  ): Promise<TrainingAttendance> {
    return this.service.create({
      ...body,
      companyId: body.companyId || 'company-1',
    });
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<TrainingAttendance>,
  ): Promise<TrainingAttendance> {
    return this.service.update(id, body);
  }

  @Post(':id/note')
  addNote(
    @Param('id') id: string,
    @Body() body: { note: string },
  ): Promise<TrainingAttendance> {
    return this.service.addNote(id, body?.note ?? '');
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(id);
    return { success: true };
  }
}
