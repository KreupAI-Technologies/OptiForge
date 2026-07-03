import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SkillAssessmentService } from '../services/skill-assessment.service';
import { SkillAssessment } from '../entities/skill-assessment.entity';

@ApiTags('HR - SkillAssessment')
@Controller('hr/skill-assessments')
export class SkillAssessmentController {
  constructor(private readonly service: SkillAssessmentService) {}

  @Get()
  findAll(
    @Query('companyId') companyId: string,
    @Query('status') status?: string,
  ): Promise<SkillAssessment[]> {
    return this.service.findAll(companyId || 'company-1', status);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<SkillAssessment> {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() body: Partial<SkillAssessment> & { companyId: string }): Promise<SkillAssessment> {
    return this.service.create({
      ...body,
      companyId: body.companyId || 'company-1',
    });
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<SkillAssessment>,
  ): Promise<SkillAssessment> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(id);
    return { success: true };
  }
}
