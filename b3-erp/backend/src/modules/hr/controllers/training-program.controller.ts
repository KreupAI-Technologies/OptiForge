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
import { TrainingProgramService } from '../services/training-program.service';
import { TrainingProgram } from '../entities/training-program.entity';

@ApiTags('HR - Training Programs')
@Controller('hr/training-programs')
export class TrainingProgramController {
  constructor(private readonly service: TrainingProgramService) {}

  @Get()
  findAll(
    @Query('companyId') companyId: string,
    @Query('category') category?: string,
    @Query('status') status?: string,
  ): Promise<TrainingProgram[]> {
    return this.service.findAll(companyId || 'company-1', { category, status });
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<TrainingProgram> {
    return this.service.findOne(id);
  }

  @Post()
  create(
    @Body() body: Partial<TrainingProgram> & { companyId: string },
  ): Promise<TrainingProgram> {
    return this.service.create({
      ...body,
      companyId: body.companyId || 'company-1',
    });
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<TrainingProgram>,
  ): Promise<TrainingProgram> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(id);
    return { success: true };
  }
}
