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
import { SafetyTrainingService } from '../services/safety-training.service';
import { SafetyTraining } from '../entities/safety-training.entity';

@ApiTags('HR - Safety Management')
@Controller('hr/safety-trainings')
export class SafetyTrainingController {
  constructor(private readonly service: SafetyTrainingService) {}

  @Get()
  findAll(
    @Query('companyId') companyId: string,
    @Query('recordType') recordType?: string,
  ): Promise<SafetyTraining[]> {
    return this.service.findAll(companyId || 'company-1', recordType);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<SafetyTraining> {
    return this.service.findOne(id);
  }

  @Post()
  create(
    @Body() body: Partial<SafetyTraining> & { companyId: string },
  ): Promise<SafetyTraining> {
    return this.service.create({
      ...body,
      companyId: body.companyId || 'company-1',
    });
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<SafetyTraining>,
  ): Promise<SafetyTraining> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(id);
    return { success: true };
  }
}
