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

  /**
   * Reset a company's project settings back to the entity-defined defaults.
   * We delete the persisted row (if any) and recreate a bare row so TypeORM's
   * column defaults are re-applied, keeping the same company scope.
   */
  async reset(companyId = 'default'): Promise<ProjectSettingsEntity> {
    const existing = await this.settingsRepository.findOne({ where: { companyId } });
    if (existing) {
      await this.settingsRepository.remove(existing);
    }
    const fresh = this.settingsRepository.create({ companyId });
    return this.settingsRepository.save(fresh);
  }
}
