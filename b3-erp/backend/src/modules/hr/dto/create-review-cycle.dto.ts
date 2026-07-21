import {
  IsBoolean,
  IsDateString,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReviewCycleDto {
  @ApiPropertyOptional({ description: 'Owning company/tenant id' })
  @IsString()
  @IsOptional()
  companyId?: string;

  @ApiPropertyOptional({ description: 'Cycle code (auto-generated if omitted)' })
  @IsString()
  @IsOptional()
  cycleCode?: string;

  @ApiProperty({ description: 'Cycle name' })
  @IsString()
  cycleName: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Cycle type (annual, semi_annual, quarterly, monthly)' })
  @IsString()
  @IsOptional()
  cycleType?: string;

  @ApiPropertyOptional({ description: 'Fiscal year' })
  @IsString()
  @IsOptional()
  fiscalYear?: string;

  @ApiPropertyOptional({ description: 'Start date' })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date' })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Include self appraisal' })
  @IsBoolean()
  @IsOptional()
  includeSelfAppraisal?: boolean;

  @ApiPropertyOptional({ description: 'Include manager review' })
  @IsBoolean()
  @IsOptional()
  includeManagerReview?: boolean;

  @ApiPropertyOptional({ description: 'Include peer review' })
  @IsBoolean()
  @IsOptional()
  includePeerReview?: boolean;

  @ApiPropertyOptional({ description: 'Include 360 review' })
  @IsBoolean()
  @IsOptional()
  include360Review?: boolean;

  @ApiPropertyOptional({ description: 'Include goals' })
  @IsBoolean()
  @IsOptional()
  includeGoals?: boolean;

  @ApiPropertyOptional({ description: 'Include competencies' })
  @IsBoolean()
  @IsOptional()
  includeCompetencies?: boolean;

  @ApiPropertyOptional({ description: 'Goals weightage' })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  goalsWeightage?: number;

  @ApiPropertyOptional({ description: 'Competencies weightage' })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  competenciesWeightage?: number;

  @ApiPropertyOptional({ description: 'Rating scale (3_point, 4_point, 5_point, custom)' })
  @IsString()
  @IsOptional()
  ratingScale?: string;

  @ApiPropertyOptional({ description: 'Rating labels map' })
  @IsObject()
  @IsOptional()
  ratingLabels?: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'Status (draft, active, in_progress, completed, archived)' })
  @IsString()
  @IsOptional()
  status?: string;
}
