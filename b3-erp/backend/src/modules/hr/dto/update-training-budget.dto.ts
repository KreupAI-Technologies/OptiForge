import { PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateTrainingBudgetDto } from './create-training-budget.dto';

export class UpdateTrainingBudgetDto extends PartialType(CreateTrainingBudgetDto) {
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
