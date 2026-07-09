import { IsString, IsOptional, IsArray } from 'class-validator';

export class SaveResourceSkillsDto {
  @IsString()
  @IsOptional()
  companyId?: string;

  @IsString()
  resourceId: string;

  @IsString()
  @IsOptional()
  resourceName?: string;

  @IsArray()
  @IsString({ each: true })
  skills: string[];
}
