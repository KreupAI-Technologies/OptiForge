import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RFQBid, RFQBidStatus } from '../entities/rfq-bid.entity';

@Injectable()
export class RFQBidService {
  constructor(
    @InjectRepository(RFQBid)
    private readonly bidRepository: Repository<RFQBid>,
  ) {}

  async findByRfq(companyId: string, rfqId: string): Promise<RFQBid[]> {
    return this.bidRepository.find({
      where: { companyId, rfqId },
      order: { createdAt: 'DESC' },
    });
  }

  async create(
    companyId: string,
    rfqId: string,
    data: Partial<RFQBid>,
  ): Promise<RFQBid> {
    const bid = this.bidRepository.create({
      ...data,
      companyId,
      rfqId,
      status: (data.status as RFQBidStatus) ?? 'submitted',
    });
    return this.bidRepository.save(bid);
  }

  async findOne(companyId: string, bidId: string): Promise<RFQBid> {
    const bid = await this.bidRepository.findOne({
      where: { id: bidId, companyId },
    });
    if (!bid) {
      throw new NotFoundException(`RFQ bid with ID ${bidId} not found`);
    }
    return bid;
  }

  private async setStatus(
    companyId: string,
    bidId: string,
    status: RFQBidStatus,
    notes?: string,
  ): Promise<RFQBid> {
    const bid = await this.findOne(companyId, bidId);
    bid.status = status;
    if (notes !== undefined) {
      bid.notes = notes;
    }
    return this.bidRepository.save(bid);
  }

  shortlist(companyId: string, bidId: string, notes?: string): Promise<RFQBid> {
    return this.setStatus(companyId, bidId, 'shortlisted', notes);
  }

  reject(companyId: string, bidId: string, notes?: string): Promise<RFQBid> {
    return this.setStatus(companyId, bidId, 'rejected', notes);
  }

  async award(
    companyId: string,
    bidId: string,
    notes?: string,
  ): Promise<RFQBid> {
    const bid = await this.setStatus(companyId, bidId, 'awarded', notes);
    // Reject other bids on the same RFQ that are not already rejected.
    await this.bidRepository
      .createQueryBuilder()
      .update(RFQBid)
      .set({ status: 'rejected' })
      .where('companyId = :companyId', { companyId })
      .andWhere('rfqId = :rfqId', { rfqId: bid.rfqId })
      .andWhere('id != :bidId', { bidId })
      .andWhere('status != :rejected', { rejected: 'rejected' })
      .execute();
    return bid;
  }
}
