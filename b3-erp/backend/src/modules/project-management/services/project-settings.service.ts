import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectSettingsEntity } from '../entities/project-settings.entity';

@Injectable()
export class ProjectSettingsService {
  constructor(
    @InjectRepository(ProjectSettingsEntity)
    private readonly settingsRepository: Repository<ProjectSettingsEntity>,
  ) {}

  async findOne(companyId = 'default'): Promise<ProjectSettingsEntity> {
    let settings = await this.settingsRepository.findOne({ where: { companyId } });
    if (!settings) {
      settings = this.settingsRepository.create({ companyId });
      settings = await this.settingsRepository.save(settings);
    }
    return settings;
  }

  async upsert(
    companyId = 'default',
    data: Partial<ProjectSettingsEntity>,
  ): Promise<ProjectSettingsEntity> {
    let settings = await this.settingsRepository.findOne({ where: { companyId } });
    if (!settings) {
      settings = this.settingsRepository.create({ ...data, companyId });
    } else {
      // never allow overwriting the identity fields
      const { id, companyId: _c, createdAt, updatedAt, ...rest } = data as any;
      Object.assign(settings, rest);
    }
    return this.settingsRepository.save(settings);
  }
}
