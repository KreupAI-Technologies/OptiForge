import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { EstimateComment } from '../entities/estimate-comment.entity';
import { EstimateCommentService } from '../services/estimate-comment.service';

@Controller('estimation/comments')
export class EstimateCommentController {
  constructor(private readonly estimateCommentService: EstimateCommentService) {}

  @Post()
  create(
    @Headers('x-company-id') companyId: string,
    @Body() data: Partial<EstimateComment>,
  ): Promise<EstimateComment> {
    return this.estimateCommentService.create(companyId, data);
  }

  @Get()
  findByEstimate(
    @Headers('x-company-id') companyId: string,
    @Query('estimateId') estimateId: string,
  ): Promise<EstimateComment[]> {
    return this.estimateCommentService.findByEstimate(companyId, estimateId);
  }

  @Get(':id')
  findOne(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
  ): Promise<EstimateComment> {
    return this.estimateCommentService.findOne(companyId, id);
  }

  @Patch(':id')
  update(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
    @Body() data: Partial<EstimateComment>,
  ): Promise<EstimateComment> {
    return this.estimateCommentService.update(companyId, id, data);
  }

  @Delete(':id')
  delete(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
  ): Promise<void> {
    return this.estimateCommentService.delete(companyId, id);
  }
}
