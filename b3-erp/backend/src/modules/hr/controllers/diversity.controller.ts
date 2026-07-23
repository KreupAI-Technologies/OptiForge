import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DiversityService } from '../services/diversity.service';
import {
  DiversityKind,
  EeoBreakdownDto,
  MetricsBreakdownDto,
  PoshBreakdownDto,
} from '../dto/diversity-breakdown.dto';

const VALID_KINDS: readonly DiversityKind[] = ['eeo', 'metrics', 'posh'];

@ApiTags('HR - Diversity')
@Controller('hr/diversity')
export class DiversityController {
  constructor(private readonly service: DiversityService) {}

  /**
   * GET /hr/diversity/breakdown?kind=eeo|metrics|posh
   *
   * Returns the aggregated diversity breakdown for the requested view. Values
   * are computed live from hr_employees where the schema supports it and fall
   * back to stable server-side reference config for demographics the schema
   * does not model (see DiversityService).
   */
  @Get('breakdown')
  getBreakdown(
    @Query('kind') kind?: string,
  ): Promise<EeoBreakdownDto | MetricsBreakdownDto | PoshBreakdownDto> {
    const resolved = (kind ?? 'eeo') as DiversityKind;
    if (!VALID_KINDS.includes(resolved)) {
      throw new BadRequestException(
        `Invalid kind "${String(kind)}". Expected one of: ${VALID_KINDS.join(', ')}.`,
      );
    }
    return this.service.getBreakdown(resolved);
  }
}
