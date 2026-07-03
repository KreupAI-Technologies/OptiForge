import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupportSlaSetting } from '../entities/support-sla-setting.entity';

@Injectable()
export class SupportSlaSettingService {
  constructor(
    @InjectRepository(SupportSlaSetting)
    private readonly repo: Repository<SupportSlaSetting>,
  ) {}

  async findByCompany(companyId: string): Promise<SupportSlaSetting> {
    let row = await this.repo.findOne({ where: { companyId } });
    if (!row) {
      row = this.repo.create({
        companyId,
        slaConfigs: [],
        businessHours: [],
        escalationRules: [],
        notifications: {},
      });
    }
    return row;
  }

  async upsert(
    companyId: string,
    data: Partial<SupportSlaSetting>,
  ): Promise<SupportSlaSetting> {
    let row = await this.repo.findOne({ where: { companyId } });
    if (!row) {
      row = this.repo.create({ companyId });
    }
    if (data.slaConfigs !== undefined) row.slaConfigs = data.slaConfigs;
    if (data.businessHours !== undefined) row.businessHours = data.businessHours;
    if (data.escalationRules !== undefined) {
      row.escalationRules = data.escalationRules;
    }
    if (data.notifications !== undefined) row.notifications = data.notifications;
    return this.repo.save(row);
  }
}
