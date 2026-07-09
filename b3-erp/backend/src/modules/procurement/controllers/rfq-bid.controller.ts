import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RFQBid } from '../entities/rfq-bid.entity';
import { RFQBidService } from '../services/rfq-bid.service';

@ApiTags('Procurement - RFQ Bids')
@Controller('procurement/rfq')
export class RFQBidController {
  constructor(private readonly bidService: RFQBidService) {}

  @Get(':id/bids')
  @ApiOperation({ summary: 'List bids submitted against an RFQ' })
  findByRfq(
    @Headers('x-company-id') companyId: string,
    @Param('id') rfqId: string,
  ): Promise<RFQBid[]> {
    return this.bidService.findByRfq(companyId, rfqId);
  }

  @Post(':id/bids')
  @ApiOperation({ summary: 'Record a supplier bid on an RFQ' })
  create(
    @Headers('x-company-id') companyId: string,
    @Param('id') rfqId: string,
    @Body() data: Partial<RFQBid>,
  ): Promise<RFQBid> {
    return this.bidService.create(companyId, rfqId, data);
  }

  @Post('bids/:bidId/shortlist')
  @ApiOperation({ summary: 'Shortlist a supplier bid' })
  shortlist(
    @Headers('x-company-id') companyId: string,
    @Param('bidId') bidId: string,
    @Body() body: { notes?: string },
  ): Promise<RFQBid> {
    return this.bidService.shortlist(companyId, bidId, body?.notes);
  }

  @Post('bids/:bidId/reject')
  @ApiOperation({ summary: 'Reject a supplier bid' })
  reject(
    @Headers('x-company-id') companyId: string,
    @Param('bidId') bidId: string,
    @Body() body: { notes?: string },
  ): Promise<RFQBid> {
    return this.bidService.reject(companyId, bidId, body?.notes);
  }

  @Post('bids/:bidId/award')
  @ApiOperation({ summary: 'Award a supplier bid (rejects the rest)' })
  award(
    @Headers('x-company-id') companyId: string,
    @Param('bidId') bidId: string,
    @Body() body: { notes?: string },
  ): Promise<RFQBid> {
    return this.bidService.award(companyId, bidId, body?.notes);
  }
}
