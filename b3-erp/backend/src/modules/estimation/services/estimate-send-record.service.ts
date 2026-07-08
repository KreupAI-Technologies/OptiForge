import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EstimateSendRecord } from '../entities/estimate-send-record.entity';

@Injectable()
export class EstimateSendRecordService {
  constructor(
    @InjectRepository(EstimateSendRecord)
    private sendRecordRepository: Repository<EstimateSendRecord>,
  ) {}

  // Persist a customer-delivery record for an estimate. Does not integrate a
  // real email/WhatsApp provider — it records that the send was requested.
  async send(
    companyId: string,
    estimateId: string,
    data: Partial<EstimateSendRecord>,
  ): Promise<EstimateSendRecord> {
    const record = this.sendRecordRepository.create({
      ...data,
      companyId,
      estimateId,
      channel: data.channel || 'email',
      status: 'sent',
      sentAt: new Date(),
    });
    return this.sendRecordRepository.save(record);
  }

  async findByEstimate(
    companyId: string,
    estimateId: string,
  ): Promise<EstimateSendRecord[]> {
    return this.sendRecordRepository.find({
      where: { companyId, estimateId },
      order: { createdAt: 'DESC' },
    });
  }
}
