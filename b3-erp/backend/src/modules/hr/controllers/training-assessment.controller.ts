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
import { TrainingAssessmentService } from '../services/training-assessment.service';
import { TrainingAssessment } from '../entities/training-assessment.entity';
import { TrainingAssessmentAttempt } from '../entities/training-assessment-attempt.entity';

@ApiTags('HR - Training Assessments')
@Controller('hr/training-assessments')
export class TrainingAssessmentController {
  constructor(private readonly service: TrainingAssessmentService) {}

  @Get()
  findAll(
    @Query('companyId') companyId: string,
    @Query('programId') programId?: string,
    @Query('scheduleId') scheduleId?: string,
    @Query('assessmentType') assessmentType?: string,
  ): Promise<TrainingAssessment[]> {
    return this.service.findAll(companyId || 'company-1', {
      programId,
      scheduleId,
      assessmentType,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<TrainingAssessment> {
    return this.service.findOne(id);
  }

  @Post()
  create(
    @Body() body: Partial<TrainingAssessment> & { companyId: string },
  ): Promise<TrainingAssessment> {
    return this.service.create({
      ...body,
      companyId: body.companyId || 'company-1',
    });
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<TrainingAssessment>,
  ): Promise<TrainingAssessment> {
    return this.service.update(id, body);
  }

  @Post(':id/attempt')
  startAttempt(
    @Param('id') id: string,
    @Body()
    body: {
      companyId?: string;
      enrollmentId?: string;
      employeeId?: string;
      employeeName?: string;
    },
  ): Promise<TrainingAssessmentAttempt> {
    return this.service.startAttempt(id, {
      ...body,
      companyId: body?.companyId || 'company-1',
    });
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(id);
    return { success: true };
  }
}

@ApiTags('HR - Training Assessment Attempts')
@Controller('hr/training-assessment-attempts')
export class TrainingAssessmentAttemptController {
  constructor(private readonly service: TrainingAssessmentService) {}

  @Get(':id')
  findOne(@Param('id') id: string): Promise<TrainingAssessmentAttempt> {
    return this.service.findAttempt(id);
  }

  @Post(':id/submit')
  submit(
    @Param('id') id: string,
    @Body() body: { answers: Array<Record<string, unknown>> },
  ): Promise<TrainingAssessmentAttempt> {
    return this.service.submitAttempt(id, body?.answers ?? []);
  }
}
