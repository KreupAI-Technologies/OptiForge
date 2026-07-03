import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PriceList } from '../entities/price-list.entity';

@Injectable()
export class PriceListService {
  constructor(
    @InjectRepository(PriceList)
    private priceListRepository: Repository<PriceList>,
  ) {}

  async create(
    companyId: string,
    data: Partial<PriceList>,
  ): Promise<PriceList> {
    const priceList = this.priceListRepository.create({
      ...data,
      companyId,
    });
    return this.priceListRepository.save(priceList);
  }

  async findAll(
    companyId: string,
    filters?: { status?: string; priceType?: string },
  ): Promise<PriceList[]> {
    const query = this.priceListRepository
      .createQueryBuilder('priceList')
      .where('priceList.companyId = :companyId', { companyId })
      .orderBy('priceList.createdAt', 'DESC');

    if (filters?.status) {
      query.andWhere('priceList.status = :status', { status: filters.status });
    }
    if (filters?.priceType) {
      query.andWhere('priceList.priceType = :priceType', {
        priceType: filters.priceType,
      });
    }

    return query.getMany();
  }

  async findOne(companyId: string, id: string): Promise<PriceList> {
    const priceList = await this.priceListRepository.findOne({
      where: { id, companyId },
    });
    if (!priceList) {
      throw new NotFoundException(`Price List with ID ${id} not found`);
    }
    return priceList;
  }

  async update(
    companyId: string,
    id: string,
    data: Partial<PriceList>,
  ): Promise<PriceList> {
    const priceList = await this.findOne(companyId, id);
    Object.assign(priceList, data);
    return this.priceListRepository.save(priceList);
  }

  async delete(companyId: string, id: string): Promise<void> {
    const priceList = await this.findOne(companyId, id);
    await this.priceListRepository.remove(priceList);
  }
}
