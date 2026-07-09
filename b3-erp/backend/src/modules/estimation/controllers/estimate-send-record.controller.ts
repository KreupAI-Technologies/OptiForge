import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
} from '@nestjs/common';
import { EstimateSendRecord } from '../entities/estimate-send-record.entity';
import { EstimateSendRecordService } from '../services/estimate-send-record.service';

// Customer-delivery ("send") records for estimates. Backs the
// estimation/workflow/send page.
@Controller('estimation/workflow/send')
export class EstimateSendRecordController {
  constructor(
    private readonly sendRecordService: EstimateSendRecordService,
  ) {}

  @Post(':estimateId')
  send(
    @Headers('x-company-id') companyId: string,
    @Param('estimateId') estimateId: string,
    @Body() data: Partial<EstimateSendRecord>,
  ): Promise<EstimateSendRecord> {
    return this.sendRecordService.send(companyId, estimateId, data);
  }

  @Get(':estimateId')
  findByEstimate(
    @Headers('x-company-id') companyId: string,
    @Param('estimateId') estimateId: string,
  ): Promise<EstimateSendRecord[]> {
    return this.sendRecordService.findByEstimate(companyId, estimateId);
  }
}
