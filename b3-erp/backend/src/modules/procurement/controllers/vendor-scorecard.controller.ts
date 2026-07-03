import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { VendorScorecard } from '../entities/vendor-scorecard.entity';
import { VendorScorecardService } from '../services/vendor-scorecard.service';

@Controller('procurement/vendor-scorecards')
export class VendorScorecardController {
  constructor(
    private readonly vendorScorecardService: VendorScorecardService,
  ) {}

  @Post()
  create(
    @Headers('x-company-id') companyId: string,
    @Body() data: Partial<VendorScorecard>,
  ): Promise<VendorScorecard> {
    return this.vendorScorecardService.create(companyId, data);
  }

  @Get()
  findAll(
    @Headers('x-company-id') companyId: string,
    @Query('category') category?: string,
    @Query('tier') tier?: string,
    @Query('status') status?: string,
  ): Promise<VendorScorecard[]> {
    return this.vendorScorecardService.findAll(companyId, {
      category,
      tier,
      status,
    });
  }

  @Get(':id')
  findOne(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
  ): Promise<VendorScorecard> {
    return this.vendorScorecardService.findOne(companyId, id);
  }

  @Patch(':id')
  update(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
    @Body() data: Partial<VendorScorecard>,
  ): Promise<VendorScorecard> {
    return this.vendorScorecardService.update(companyId, id, data);
  }

  @Delete(':id')
  delete(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
  ): Promise<void> {
    return this.vendorScorecardService.delete(companyId, id);
  }
}
