import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsArray,
  IsString,
  IsObject,
  Min,
  Max,
} from 'class-validator';

export class UpdateTwoFactorSettingDto {
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @IsBoolean()
  required?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedMethods?: string[];

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(365)
  gracePeriodDays?: number;

  @IsOptional()
  @IsObject()
  config?: Record<string, any>;
}
