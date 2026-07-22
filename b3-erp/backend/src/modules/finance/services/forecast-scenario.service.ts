import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ForecastScenario } from '../entities/forecast-scenario.entity';

@Injectable()
export class ForecastScenarioService {
  constructor(
    @InjectRepository(ForecastScenario)
    private readonly repo: Repository<ForecastScenario>,
  ) {}

  async findAll(): Promise<ForecastScenario[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<ForecastScenario> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) {
      throw new NotFoundException(`Forecast scenario ${id} not found`);
    }
    return row;
  }

  async create(dto: Partial<ForecastScenario>): Promise<ForecastScenario> {
    const row = this.repo.create(dto);
    return this.repo.save(row);
  }

  async update(
    id: string,
    dto: Partial<ForecastScenario>,
  ): Promise<ForecastScenario> {
    const row = await this.findOne(id);
    Object.assign(row, dto);
    return this.repo.save(row);
  }

  async remove(id: string): Promise<{ success: boolean }> {
    const row = await this.findOne(id);
    await this.repo.remove(row);
    return { success: true };
  }
}
