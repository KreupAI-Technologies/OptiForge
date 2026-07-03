import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BomReceipt } from '../entities/bom-receipt.entity';

@Injectable()
export class BomReceiptService {
  constructor(
    @InjectRepository(BomReceipt)
    private bomReceiptRepository: Repository<BomReceipt>,
  ) {}

  async create(
    companyId: string,
    data: Partial<BomReceipt>,
  ): Promise<BomReceipt> {
    const entity = this.bomReceiptRepository.create({ ...data, companyId });
    return this.bomReceiptRepository.save(entity);
  }

  async findAll(
    companyId: string,
    filters?: { status?: string },
  ): Promise<BomReceipt[]> {
    const query = this.bomReceiptRepository
      .createQueryBuilder('receipt')
      .where('receipt.companyId = :companyId', { companyId })
      .orderBy('receipt.submittedDate', 'DESC');

    if (filters?.status) {
      query.andWhere('receipt.status = :status', { status: filters.status });
    }
    return query.getMany();
  }

  async findOne(companyId: string, id: string): Promise<BomReceipt> {
    const entity = await this.bomReceiptRepository.findOne({
      where: { id, companyId },
    });
    if (!entity) {
      throw new NotFoundException(`BOM Receipt with ID ${id} not found`);
    }
    return entity;
  }

  async update(
    companyId: string,
    id: string,
    data: Partial<BomReceipt>,
  ): Promise<BomReceipt> {
    const entity = await this.findOne(companyId, id);
    Object.assign(entity, data);
    return this.bomReceiptRepository.save(entity);
  }

  async delete(companyId: string, id: string): Promise<void> {
    const entity = await this.findOne(companyId, id);
    await this.bomReceiptRepository.remove(entity);
  }
}
