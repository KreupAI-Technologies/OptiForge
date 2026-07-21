import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TrainingFeedbackService } from '../services/training-feedback.service';
import { TrainingFeedback } from '../entities/training-feedback.entity';

@ApiTags('HR - Training Feedback')
@Controller('hr/training-feedback')
export class TrainingFeedbackController {
  constructor(private readonly service: TrainingFeedbackService) {}

  @Get()
  findAll(
    @Query('companyId') companyId: string,
    @Query('scheduleId') scheduleId?: string,
    @Query('programId') programId?: string,
    @Query('employeeId') employeeId?: string,
  ): Promise<TrainingFeedback[]> {
    return this.service.findAll(companyId || 'company-1', {
      scheduleId,
      programId,
      employeeId,
    });
  }

  @Post()
  create(
    @Body() body: Partial<TrainingFeedback> & { companyId: string },
  ): Promise<TrainingFeedback> {
    return this.service.create({
      ...body,
      companyId: body.companyId || 'company-1',
    });
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(id);
    return { success: true };
  }
}
