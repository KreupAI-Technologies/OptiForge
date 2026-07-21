import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CourseProgressService } from '../services/course-progress.service';
import { CourseProgress } from '../entities/course-progress.entity';

@ApiTags('HR - E-Learning Progress')
@Controller('hr/elearning-progress')
export class CourseProgressController {
  constructor(private readonly service: CourseProgressService) {}

  @Get()
  findAll(
    @Query('companyId') companyId: string,
    @Query('courseId') courseId?: string,
    @Query('employeeId') employeeId?: string,
    @Query('status') status?: string,
  ): Promise<CourseProgress[]> {
    return this.service.findAll(companyId || 'company-1', {
      courseId,
      employeeId,
      status,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<CourseProgress> {
    return this.service.findOne(id);
  }

  @Post('enroll/:courseId')
  enroll(
    @Param('courseId') courseId: string,
    @Body()
    body: { companyId?: string; employeeId?: string; employeeName?: string },
  ): Promise<CourseProgress> {
    return this.service.enroll(courseId, {
      ...body,
      companyId: body?.companyId || 'company-1',
    });
  }

  @Put(':id/lesson/:lessonId')
  updateLessonProgress(
    @Param('id') id: string,
    @Param('lessonId') lessonId: string,
    @Body()
    body: {
      isCompleted: boolean;
      progressPercentage: number;
      timeSpentMinutes: number;
    },
  ): Promise<CourseProgress> {
    return this.service.updateLessonProgress(id, lessonId, body);
  }
}
