import { PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateReviewCycleDto } from './create-review-cycle.dto';

export class UpdateReviewCycleDto extends PartialType(CreateReviewCycleDto) {
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
