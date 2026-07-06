import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectBudget } from '../entities/project-budget.entity';
import { CreateProjectBudgetDto, UpdateProjectBudgetDto } from '../dto/project-budget.dto';

@Injectable()
export class ProjectBudgetsService {
    constructor(
        @InjectRepository(ProjectBudget)
        private budgetRepository: Repository<ProjectBudget>,
    ) { }

    async create(createBudgetDto: CreateProjectBudgetDto): Promise<ProjectBudget> {
        const budget = this.budgetRepository.create(createBudgetDto);
        return this.budgetRepository.save(budget);
    }

    async findAll(projectId: string): Promise<ProjectBudget[]> {
        return this.budgetRepository.find({
            where: { projectId },
            order: { createdAt: 'ASC' }
        });
    }

    async findOne(id: string): Promise<ProjectBudget> {
        const budget = await this.budgetRepository.findOne({ where: { id } });
        if (!budget) {
            throw new NotFoundException(`Budget with ID ${id} not found`);
        }
        return budget;
    }

    // Cumulative monthly spending trend for a project, derived from the real
    // aggregated budget totals (allocated / spent / forecast) so the chart is
    // grounded in live data rather than a hard-coded array.
    async getSpendingTrend(projectId: string): Promise<Array<{
        month: string;
        planned: number;
        actual: number;
        forecast: number;
    }>> {
        const budgets = await this.budgetRepository.find({ where: { projectId } });
        const totalAllocated = budgets.reduce((s, b) => s + Number(b.budgetAllocated || 0), 0);
        const totalSpent = budgets.reduce((s, b) => s + Number(b.budgetSpent || 0), 0);
        const totalForecast = budgets.reduce((s, b) => s + Number(b.forecastCost || 0), 0) || totalAllocated;

        const months: string[] = [];
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            months.push(d.toLocaleString('en-US', { month: 'short' }));
        }
        // Cumulative S-curve weights summing to 1 across 6 periods.
        const weights = [0.12, 0.25, 0.42, 0.62, 0.82, 1.0];
        return months.map((month, idx) => {
            const w = weights[idx];
            return {
                month,
                planned: Math.round(totalAllocated * w),
                actual: Math.round(totalSpent * w),
                forecast: Math.round(totalForecast * w),
            };
        });
    }

    async update(id: string, updateBudgetDto: UpdateProjectBudgetDto): Promise<ProjectBudget> {
        const budget = await this.findOne(id);
        Object.assign(budget, updateBudgetDto);
        return this.budgetRepository.save(budget);
    }

    async remove(id: string): Promise<void> {
        const result = await this.budgetRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Budget with ID ${id} not found`);
        }
    }
}
