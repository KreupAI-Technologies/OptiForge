import {
  IsDateString,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTrainingBudgetDto {
  @ApiPropertyOptional({ description: 'Owning company/tenant id' })
  @IsString()
  @IsOptional()
  companyId?: string;

  @ApiPropertyOptional({ description: 'Budget code (auto-generated if omitted)' })
  @IsString()
  @IsOptional()
  budgetCode?: string;

  @ApiPropertyOptional({ description: 'Budget type (company, department, team, individual)' })
  @IsString()
  @IsOptional()
  budgetType?: string;

  @ApiPropertyOptional({ description: 'Department id' })
  @IsString()
  @IsOptional()
  departmentId?: string;

  @ApiPropertyOptional({ description: 'Department name' })
  @IsString()
  @IsOptional()
  departmentName?: string;

  @ApiPropertyOptional({ description: 'Employee id' })
  @IsString()
  @IsOptional()
  employeeId?: string;

  @ApiPropertyOptional({ description: 'Employee name' })
  @IsString()
  @IsOptional()
  employeeName?: string;

  @ApiProperty({ description: 'Fiscal year (e.g. 2025-2026)' })
  @IsString()
  fiscalYear: string;

  @ApiPropertyOptional({ description: 'Period type (annual, quarterly, monthly)' })
  @IsString()
  @IsOptional()
  periodType?: string;

  @ApiPropertyOptional({ description: 'Period start date' })
  @IsDateString()
  @IsOptional()
  periodStart?: string;

  @ApiPropertyOptional({ description: 'Period end date' })
  @IsDateString()
  @IsOptional()
  periodEnd?: string;

  @ApiProperty({ description: 'Allocated amount' })
  @IsNumber()
  @Type(() => Number)
  allocatedAmount: number;

  @ApiPropertyOptional({ description: 'Utilized amount' })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  utilizedAmount?: number;

  @ApiPropertyOptional({ description: 'Remaining amount' })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  remainingAmount?: number;

  @ApiPropertyOptional({ description: 'Reserved amount' })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  reservedAmount?: number;

  @ApiPropertyOptional({ description: 'Breakdown by category' })
  @IsObject()
  @IsOptional()
  breakdown?: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'Status (draft, active, frozen, closed)' })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ description: 'Approved by' })
  @IsString()
  @IsOptional()
  approvedBy?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsString()
  @IsOptional()
  notes?: string;
}
