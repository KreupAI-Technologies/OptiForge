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
import { HrGrievanceService } from '../services/hr-grievance.service';
import { HrGrievance } from '../entities/hr-grievance.entity';

@ApiTags('HR - Grievances')
@Controller('hr/grievances')
export class HrGrievanceController {
  constructor(private readonly service: HrGrievanceService) {}

  @Get()
  findAll(
    @Query('companyId') companyId: string,
    @Query('caseType') caseType?: string,
  ): Promise<HrGrievance[]> {
    return this.service.findAll(companyId || 'company-1', caseType);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<HrGrievance> {
    return this.service.findOne(id);
  }

  @Post()
  create(
    @Body() body: Partial<HrGrievance> & { companyId: string },
  ): Promise<HrGrievance> {
    return this.service.create({
      ...body,
      companyId: body.companyId || 'company-1',
    });
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<HrGrievance>,
  ): Promise<HrGrievance> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(id);
    return { success: true };
  }
}
