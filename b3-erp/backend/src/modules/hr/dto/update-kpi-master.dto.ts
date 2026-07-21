import { PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateKpiMasterDto } from './create-kpi-master.dto';

export class UpdateKpiMasterDto extends PartialType(CreateKpiMasterDto) {
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
