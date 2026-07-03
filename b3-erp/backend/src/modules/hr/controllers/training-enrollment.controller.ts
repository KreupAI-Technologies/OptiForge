import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TrainingEnrollmentService } from '../services/training-enrollment.service';
import { TrainingEnrollment } from '../entities/training-enrollment.entity';

@ApiTags('HR - TrainingEnrollment')
@Controller('hr/training-enrollments')
export class TrainingEnrollmentController {
  constructor(private readonly service: TrainingEnrollmentService) {}

  @Get()
  findAll(
    @Query('companyId') companyId: string,
    @Query('status') status?: string,
  ): Promise<TrainingEnrollment[]> {
    return this.service.findAll(companyId || 'company-1', status);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<TrainingEnrollment> {
    return this.service.findOne(id);
  }

  @Post()
  create(
    @Body() body: Partial<TrainingEnrollment> & { companyId: string },
  ): Promise<TrainingEnrollment> {
    return this.service.create({
      ...body,
      companyId: body.companyId || 'company-1',
    });
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<TrainingEnrollment>,
  ): Promise<TrainingEnrollment> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(id);
    return { success: true };
  }
}
