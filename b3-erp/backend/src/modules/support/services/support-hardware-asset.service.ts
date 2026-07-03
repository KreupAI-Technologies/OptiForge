import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupportHardwareAsset } from '../entities/support-hardware-asset.entity';

@Injectable()
export class SupportHardwareAssetService {
  constructor(
    @InjectRepository(SupportHardwareAsset)
    private readonly repo: Repository<SupportHardwareAsset>,
  ) {}

  findAll(companyId: string): Promise<SupportHardwareAsset[]> {
    return this.repo.find({ where: { companyId }, order: { name: 'ASC' } });
  }

  async findOne(id: string): Promise<SupportHardwareAsset> {
    const found = await this.repo.findOne({ where: { id } });
    if (!found) throw new NotFoundException(`Hardware asset ${id} not found`);
    return found;
  }

  create(
    data: Partial<SupportHardwareAsset> & { companyId: string },
  ): Promise<SupportHardwareAsset> {
    return this.repo.save(this.repo.create(data));
  }

  async update(
    id: string,
    data: Partial<SupportHardwareAsset>,
  ): Promise<SupportHardwareAsset> {
    const found = await this.findOne(id);
    Object.assign(found, data);
    return this.repo.save(found);
  }

  async remove(id: string): Promise<void> {
    const found = await this.findOne(id);
    await this.repo.remove(found);
  }
}
