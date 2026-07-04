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
import { SafetyHazardService } from '../services/safety-hazard.service';
import { SafetyHazard } from '../entities/safety-hazard.entity';

@ApiTags('HR - Safety Hazards')
@Controller('hr/safety-hazards')
export class SafetyHazardController {
  constructor(private readonly service: SafetyHazardService) {}

  @Get()
  findAll(
    @Query('companyId') companyId: string,
    @Query('recordType') recordType?: string,
  ): Promise<SafetyHazard[]> {
    return this.service.findAll(companyId || 'company-1', recordType);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<SafetyHazard> {
    return this.service.findOne(id);
  }

  @Post()
  create(
    @Body() body: Partial<SafetyHazard> & { companyId: string },
  ): Promise<SafetyHazard> {
    return this.service.create({
      ...body,
      companyId: body.companyId || 'company-1',
    });
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<SafetyHazard>,
  ): Promise<SafetyHazard> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(id);
    return { success: true };
  }
}
