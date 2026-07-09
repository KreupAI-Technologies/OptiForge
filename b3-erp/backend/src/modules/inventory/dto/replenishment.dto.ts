import {
    IsString,
    IsOptional,
    IsNumber,
    IsBoolean,
    IsNotEmpty,
    IsArray,
    IsIn,
    MaxLength,
    Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const SCHEDULES = ['realtime', 'hourly', 'daily', 'weekly'] as const;
const METHODS = [
    'reorder-point',
    'min-max',
    'consumption-based',
    'economic-order-qty',
] as const;
const PRIORITIES = ['critical', 'high', 'medium', 'low'] as const;

// ---- Auto-replenishment config ----

export class CreateAutoReplenishmentConfigDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    configName: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    description?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    @MaxLength(100)
    category?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    @MaxLength(255)
    itemPattern?: string;

    @ApiPropertyOptional({ default: true })
    @IsBoolean()
    @IsOptional()
    enabled?: boolean;

    @ApiPropertyOptional({ enum: SCHEDULES, default: 'daily' })
    @IsIn(SCHEDULES as unknown as string[])
    @IsOptional()
    schedule?: (typeof SCHEDULES)[number];

    @ApiPropertyOptional({ default: false })
    @IsBoolean()
    @IsOptional()
    autoApprove?: boolean;

    @ApiPropertyOptional({ default: 0 })
    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    maxOrderValue?: number;

    @ApiPropertyOptional({ type: [String] })
    @IsArray()
    @IsOptional()
    notifyUsers?: string[];
}

export class UpdateAutoReplenishmentConfigDto {
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    @MaxLength(255)
    configName?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    description?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    @MaxLength(100)
    category?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    @MaxLength(255)
    itemPattern?: string;

    @ApiPropertyOptional()
    @IsBoolean()
    @IsOptional()
    enabled?: boolean;

    @ApiPropertyOptional({ enum: SCHEDULES })
    @IsIn(SCHEDULES as unknown as string[])
    @IsOptional()
    schedule?: (typeof SCHEDULES)[number];

    @ApiPropertyOptional()
    @IsBoolean()
    @IsOptional()
    autoApprove?: boolean;

    @ApiPropertyOptional()
    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    maxOrderValue?: number;

    @ApiPropertyOptional({ type: [String] })
    @IsArray()
    @IsOptional()
    notifyUsers?: string[];
}

export class ToggleAutoReplenishmentConfigDto {
    @ApiProperty()
    @IsBoolean()
    enabled: boolean;
}

// ---- Reorder rule ----

export class CreateReorderRuleDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    ruleName: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    description?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    @MaxLength(100)
    category?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    @MaxLength(255)
    itemFilter?: string;

    @ApiPropertyOptional({ enum: METHODS, default: 'reorder-point' })
    @IsIn(METHODS as unknown as string[])
    @IsOptional()
    method?: (typeof METHODS)[number];

    @ApiPropertyOptional({ default: false })
    @IsBoolean()
    @IsOptional()
    autoApprove?: boolean;

    @ApiPropertyOptional({ enum: PRIORITIES, default: 'medium' })
    @IsIn(PRIORITIES as unknown as string[])
    @IsOptional()
    priority?: (typeof PRIORITIES)[number];

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    @MaxLength(255)
    supplier?: string;

    @ApiPropertyOptional({ default: 0 })
    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    leadTimeDays?: number;

    @ApiPropertyOptional({ default: 0 })
    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    safetyStockDays?: number;

    @ApiPropertyOptional({ default: true })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}

// ---- Replenishment request ----

export class CreateReplenishmentRequestDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    itemCode: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    @MaxLength(255)
    itemName?: string;

    @ApiProperty()
    @IsNumber()
    @Min(0.0001)
    @Type(() => Number)
    quantity: number;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    @MaxLength(20)
    uom?: string;

    @ApiPropertyOptional({ enum: PRIORITIES, default: 'medium' })
    @IsIn(PRIORITIES as unknown as string[])
    @IsOptional()
    priority?: (typeof PRIORITIES)[number];

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    requestDate?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    requiredBy?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    notes?: string;
}
