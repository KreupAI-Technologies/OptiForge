import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateKpiMasterDto {
  @ApiPropertyOptional({ description: 'Owning company/tenant id' })
  @IsString()
  @IsOptional()
  companyId?: string;

  @ApiPropertyOptional({ description: 'KPI code (auto-generated if omitted)' })
  @IsString()
  @IsOptional()
  kpiCode?: string;

  @ApiProperty({ description: 'KPI name' })
  @IsString()
  kpiName: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Category (sales, operations, hr, quality, ...)' })
  @IsString()
  category: string;

  @ApiProperty({ description: 'KPI type (quantitative, qualitative, milestone)' })
  @IsString()
  kpiType: string;

  @ApiPropertyOptional({ description: 'Measurement unit (percentage, number, currency, rating)' })
  @IsString()
  @IsOptional()
  measurementUnit?: string;

  @ApiPropertyOptional({ description: 'Measurement frequency' })
  @IsString()
  @IsOptional()
  measurementFrequency?: string;

  @ApiPropertyOptional({ description: 'Target type (higher_better, lower_better, target_range)' })
  @IsString()
  @IsOptional()
  targetType?: string;

  @ApiPropertyOptional({ description: 'Default target value' })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  defaultTarget?: number;

  @ApiPropertyOptional({ description: 'Minimum value' })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  minValue?: number;

  @ApiPropertyOptional({ description: 'Maximum value' })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  maxValue?: number;

  @ApiPropertyOptional({ description: 'Data source (manual, system, integration)' })
  @IsString()
  @IsOptional()
  dataSource?: string;

  @ApiPropertyOptional({ description: 'Calculation formula' })
  @IsString()
  @IsOptional()
  calculationFormula?: string;

  @ApiPropertyOptional({ description: 'Linked metric' })
  @IsString()
  @IsOptional()
  linkedMetric?: string;

  @ApiPropertyOptional({ description: 'Applicable to (employee, team, department, company)' })
  @IsArray()
  @IsOptional()
  applicableTo?: string[];

  @ApiPropertyOptional({ description: 'Applicable departments' })
  @IsArray()
  @IsOptional()
  applicableDepartments?: string[];

  @ApiPropertyOptional({ description: 'Applicable designations' })
  @IsArray()
  @IsOptional()
  applicableDesignations?: string[];
}
