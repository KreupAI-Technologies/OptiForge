import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ElearningCourseService } from '../services/elearning-course.service';
import { ElearningCourse } from '../entities/elearning-course.entity';

@ApiTags('HR - ElearningCourse')
@Controller('hr/elearning-courses')
export class ElearningCourseController {
  constructor(private readonly service: ElearningCourseService) {}

  @Get()
  findAll(
    @Query('companyId') companyId: string,
    @Query('status') status?: string,
  ): Promise<ElearningCourse[]> {
    return this.service.findAll(companyId || 'company-1', status);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<ElearningCourse> {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() body: Partial<ElearningCourse> & { companyId: string }): Promise<ElearningCourse> {
    return this.service.create({
      ...body,
      companyId: body.companyId || 'company-1',
    });
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<ElearningCourse>,
  ): Promise<ElearningCourse> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(id);
    return { success: true };
  }
}
