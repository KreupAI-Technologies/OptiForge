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
import { TrainingWaitlistService } from '../services/training-waitlist.service';
import { TrainingWaitlist } from '../entities/training-waitlist.entity';

@ApiTags('HR - Training Waitlist')
@Controller('hr/training-waitlist')
export class TrainingWaitlistController {
  constructor(private readonly service: TrainingWaitlistService) {}

  @Get()
  findAll(
    @Query('companyId') companyId: string,
    @Query('programId') programId?: string,
    @Query('scheduleId') scheduleId?: string,
    @Query('status') status?: string,
  ): Promise<TrainingWaitlist[]> {
    return this.service.findAll(companyId || 'company-1', {
      programId,
      scheduleId,
      status,
    });
  }

  @Post()
  create(
    @Body() body: Partial<TrainingWaitlist> & { companyId: string },
  ): Promise<TrainingWaitlist> {
    return this.service.create({
      ...body,
      companyId: body.companyId || 'company-1',
    });
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<TrainingWaitlist>,
  ): Promise<TrainingWaitlist> {
    return this.service.update(id, body);
  }

  @Post(':id/notify')
  notify(@Param('id') id: string): Promise<TrainingWaitlist> {
    return this.service.notify(id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(id);
    return { success: true };
  }
}
