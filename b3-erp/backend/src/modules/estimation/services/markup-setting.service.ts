import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MarkupSetting } from '../entities/markup-setting.entity';

@Injectable()
export class MarkupSettingService {
  constructor(
    @InjectRepository(MarkupSetting)
    private markupSettingRepository: Repository<MarkupSetting>,
  ) {}

  async create(
    companyId: string,
    data: Partial<MarkupSetting>,
  ): Promise<MarkupSetting> {
    const setting = this.markupSettingRepository.create({
      ...data,
      companyId,
    });
    return this.markupSettingRepository.save(setting);
  }

  async findAll(
    companyId: string,
    filters?: { category?: string; status?: string },
  ): Promise<MarkupSetting[]> {
    const query = this.markupSettingRepository
      .createQueryBuilder('setting')
      .where('setting.companyId = :companyId', { companyId })
      .orderBy('setting.category', 'ASC')
      .addOrderBy('setting.subcategory', 'ASC');

    if (filters?.category) {
      query.andWhere('setting.category = :category', {
        category: filters.category,
      });
    }
    if (filters?.status) {
      query.andWhere('setting.status = :status', { status: filters.status });
    }

    return query.getMany();
  }

  async findOne(companyId: string, id: string): Promise<MarkupSetting> {
    const setting = await this.markupSettingRepository.findOne({
      where: { id, companyId },
    });
    if (!setting) {
      throw new NotFoundException(`Markup Setting with ID ${id} not found`);
    }
    return setting;
  }

  async update(
    companyId: string,
    id: string,
    data: Partial<MarkupSetting>,
  ): Promise<MarkupSetting> {
    const setting = await this.findOne(companyId, id);
    Object.assign(setting, data);
    return this.markupSettingRepository.save(setting);
  }

  async delete(companyId: string, id: string): Promise<void> {
    const setting = await this.findOne(companyId, id);
    await this.markupSettingRepository.remove(setting);
  }
}
