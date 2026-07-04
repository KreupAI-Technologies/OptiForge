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
import { SafetyInspectionService } from '../services/safety-inspection.service';
import { SafetyInspection } from '../entities/safety-inspection.entity';

@ApiTags('HR - Safety Inspections')
@Controller('hr/safety-inspections')
export class SafetyInspectionController {
  constructor(private readonly service: SafetyInspectionService) {}

  @Get()
  findAll(
    @Query('companyId') companyId: string,
    @Query('recordType') recordType?: string,
  ): Promise<SafetyInspection[]> {
    return this.service.findAll(companyId || 'company-1', recordType);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<SafetyInspection> {
    return this.service.findOne(id);
  }

  @Post()
  create(
    @Body() body: Partial<SafetyInspection> & { companyId: string },
  ): Promise<SafetyInspection> {
    return this.service.create({
      ...body,
      companyId: body.companyId || 'company-1',
    });
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<SafetyInspection>,
  ): Promise<SafetyInspection> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(id);
    return { success: true };
  }
}
