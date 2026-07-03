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
import { ProbationReviewService } from '../services/probation-review.service';
import { ProbationReview } from '../entities/probation-review.entity';

@ApiTags('HR - Probation Reviews')
@Controller('hr/probation-reviews')
export class ProbationReviewController {
  constructor(private readonly service: ProbationReviewService) {}

  @Get()
  findAll(
    @Query('companyId') companyId: string,
    @Query('recordType') recordType?: string,
  ): Promise<ProbationReview[]> {
    return this.service.findAll(companyId || 'company-1', recordType);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<ProbationReview> {
    return this.service.findOne(id);
  }

  @Post()
  create(
    @Body() body: Partial<ProbationReview> & { companyId: string; recordType: string },
  ): Promise<ProbationReview> {
    return this.service.create({
      ...body,
      companyId: body.companyId || 'company-1',
      recordType: body.recordType || 'tracking',
    });
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<ProbationReview>,
  ): Promise<ProbationReview> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(id);
    return { success: true };
  }
}
