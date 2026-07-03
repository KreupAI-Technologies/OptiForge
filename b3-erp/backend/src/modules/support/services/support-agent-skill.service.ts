import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupportAgentSkill } from '../entities/support-agent-skill.entity';

@Injectable()
export class SupportAgentSkillService {
  constructor(
    @InjectRepository(SupportAgentSkill)
    private readonly repo: Repository<SupportAgentSkill>,
  ) {}

  findAll(companyId: string): Promise<SupportAgentSkill[]> {
    return this.repo.find({ where: { companyId }, order: { agentName: 'ASC' } });
  }

  async findOne(id: string): Promise<SupportAgentSkill> {
    const found = await this.repo.findOne({ where: { id } });
    if (!found) throw new NotFoundException(`Skill matrix ${id} not found`);
    return found;
  }

  create(
    data: Partial<SupportAgentSkill> & { companyId: string },
  ): Promise<SupportAgentSkill> {
    return this.repo.save(this.repo.create(data));
  }

  async update(
    id: string,
    data: Partial<SupportAgentSkill>,
  ): Promise<SupportAgentSkill> {
    const found = await this.findOne(id);
    Object.assign(found, data);
    return this.repo.save(found);
  }

  async remove(id: string): Promise<void> {
    const found = await this.findOne(id);
    await this.repo.remove(found);
  }
}
