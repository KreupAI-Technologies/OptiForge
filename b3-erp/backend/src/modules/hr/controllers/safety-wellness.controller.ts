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
import { SafetyWellnessService } from '../services/safety-wellness.service';
import { SafetyWellness } from '../entities/safety-wellness.entity';

@ApiTags('HR - Safety Wellness')
@Controller('hr/safety-wellness')
export class SafetyWellnessController {
  constructor(private readonly service: SafetyWellnessService) {}

  @Get()
  findAll(
    @Query('companyId') companyId: string,
    @Query('recordType') recordType?: string,
  ): Promise<SafetyWellness[]> {
    return this.service.findAll(companyId || 'company-1', recordType);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<SafetyWellness> {
    return this.service.findOne(id);
  }

  @Post()
  create(
    @Body() body: Partial<SafetyWellness> & { companyId: string },
  ): Promise<SafetyWellness> {
    return this.service.create({
      ...body,
      companyId: body.companyId || 'company-1',
    });
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<SafetyWellness>,
  ): Promise<SafetyWellness> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(id);
    return { success: true };
  }
}
