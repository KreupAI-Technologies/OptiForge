import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PmResourceSkill } from '../entities/pm-resource-skill.entity';
import { SaveResourceSkillsDto } from '../dto/pm-resource-skill.dto';

@Injectable()
export class PmResourceSkillsService {
  constructor(
    @InjectRepository(PmResourceSkill)
    private readonly repo: Repository<PmResourceSkill>,
  ) {}

  async findAll(resourceId?: string): Promise<PmResourceSkill[]> {
    const where = resourceId ? { resourceId } : {};
    return this.repo.find({ where, order: { updatedAt: 'DESC' } });
  }

  async findByResource(resourceId: string): Promise<PmResourceSkill | null> {
    return this.repo.findOne({ where: { resourceId } });
  }

  /** Upsert the skill set for a resource (one row per resource). */
  async save(dto: SaveResourceSkillsDto): Promise<PmResourceSkill> {
    let row = await this.repo.findOne({ where: { resourceId: dto.resourceId } });
    if (row) {
      row.skills = dto.skills;
      if (dto.resourceName != null) row.resourceName = dto.resourceName;
      if (dto.companyId != null) row.companyId = dto.companyId;
    } else {
      row = this.repo.create(dto);
    }
    return this.repo.save(row);
  }

  async remove(id: string): Promise<void> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException(`Resource skills ${id} not found`);
    await this.repo.remove(row);
  }
}
