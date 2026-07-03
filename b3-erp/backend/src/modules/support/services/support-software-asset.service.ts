import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupportSoftwareAsset } from '../entities/support-software-asset.entity';

@Injectable()
export class SupportSoftwareAssetService {
  constructor(
    @InjectRepository(SupportSoftwareAsset)
    private readonly repo: Repository<SupportSoftwareAsset>,
  ) {}

  findAll(companyId: string): Promise<SupportSoftwareAsset[]> {
    return this.repo.find({ where: { companyId }, order: { name: 'ASC' } });
  }

  async findOne(id: string): Promise<SupportSoftwareAsset> {
    const found = await this.repo.findOne({ where: { id } });
    if (!found) throw new NotFoundException(`Software asset ${id} not found`);
    return found;
  }

  create(
    data: Partial<SupportSoftwareAsset> & { companyId: string },
  ): Promise<SupportSoftwareAsset> {
    return this.repo.save(this.repo.create(data));
  }

  async update(
    id: string,
    data: Partial<SupportSoftwareAsset>,
  ): Promise<SupportSoftwareAsset> {
    const found = await this.findOne(id);
    Object.assign(found, data);
    return this.repo.save(found);
  }

  async remove(id: string): Promise<void> {
    const found = await this.findOne(id);
    await this.repo.remove(found);
  }
}
