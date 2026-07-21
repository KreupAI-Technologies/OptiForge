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
import { ReviewCycleService } from '../services/review-cycle.service';
import { ReviewCycle } from '../entities/review-cycle.entity';
import { CreateReviewCycleDto } from '../dto/create-review-cycle.dto';
import { UpdateReviewCycleDto } from '../dto/update-review-cycle.dto';

@ApiTags('HR - Review Cycles')
@Controller('hr/review-cycles')
export class ReviewCycleController {
  constructor(private readonly service: ReviewCycleService) {}

  @Get()
  findAll(
    @Query('companyId') companyId: string,
    @Query('status') status?: string,
    @Query('cycleType') cycleType?: string,
  ): Promise<ReviewCycle[]> {
    return this.service.findAll(companyId || 'company-1', { status, cycleType });
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<ReviewCycle> {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() body: CreateReviewCycleDto): Promise<ReviewCycle> {
    const { startDate, endDate, ...rest } = body;
    return this.service.create({
      ...rest,
      ...(startDate ? { startDate: new Date(startDate) } : {}),
      ...(endDate ? { endDate: new Date(endDate) } : {}),
      companyId: body.companyId || 'company-1',
    });
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: UpdateReviewCycleDto,
  ): Promise<ReviewCycle> {
    const { startDate, endDate, ...rest } = body;
    return this.service.update(id, {
      ...rest,
      ...(startDate ? { startDate: new Date(startDate) } : {}),
      ...(endDate ? { endDate: new Date(endDate) } : {}),
    });
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(id);
    return { success: true };
  }
}
