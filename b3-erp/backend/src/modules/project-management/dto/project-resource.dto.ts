import { IsString, IsOptional, IsDateString, IsNumber } from 'class-validator';

export class CreateProjectResourceDto {
    @IsString()
    projectId: string;

    @IsString()
    userId: string;

    @IsString()
    @IsOptional()
    role?: string;

    @IsNumber()
    @IsOptional()
    allocationPercentage?: number;

    @IsDateString()
    @IsOptional()
    startDate?: string;

    @IsDateString()
    @IsOptional()
    endDate?: string;

    @IsNumber()
    @IsOptional()
    hourlyRate?: number;
}

export class UpdateProjectResourceDto {
    @IsString()
    @IsOptional()
    role?: string;

    @IsNumber()
    @IsOptional()
    allocationPercentage?: number;

    @IsDateString()
    @IsOptional()
    startDate?: string;

    @IsDateString()
    @IsOptional()
    endDate?: string;

    @IsNumber()
    @IsOptional()
    hourlyRate?: number;
}

export class TransferResourceDto {
    // The resource (project_resources.id) or userId being transferred.
    @IsString()
    @IsOptional()
    resourceId?: string;

    @IsString()
    @IsOptional()
    userId?: string;

    @IsString()
    fromProject: string;

    @IsString()
    toProject: string;

    @IsString()
    @IsOptional()
    transferDate?: string;

    @IsString()
    @IsOptional()
    role?: string;

    @IsNumber()
    @IsOptional()
    allocation?: number;

    @IsString()
    @IsOptional()
    reason?: string;
}

export class BalanceWorkloadDto {
    @IsString()
    @IsOptional()
    department?: string;

    @IsString()
    @IsOptional()
    projectId?: string;

    @IsString()
    @IsOptional()
    method?: string;
}
