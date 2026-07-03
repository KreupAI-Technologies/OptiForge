import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../../project/entities/project.entity';

const ACTIVE_STATUSES = ['active', 'in progress', 'in_progress'];
const COMPLETED_STATUSES = ['completed', 'complete'];
const DELAYED_STATUSES = ['delayed', 'on_hold', 'on hold'];

function num(v: any): number {
  const n = typeof v === 'string' ? parseFloat(v) : v;
  return Number.isFinite(n) ? n : 0;
}

@Injectable()
export class PmAnalyticsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  async getSummary() {
    const projects = await this.projectRepository.find();

    const norm = (s: string) => (s || '').toLowerCase();
    const totalProjects = projects.length;
    const activeProjects = projects.filter((p) => ACTIVE_STATUSES.includes(norm(p.status))).length;
    const completedProjects = projects.filter((p) => COMPLETED_STATUSES.includes(norm(p.status))).length;
    const delayedProjects = projects.filter((p) => DELAYED_STATUSES.includes(norm(p.status))).length;

    const totalRevenue = projects.reduce((sum, p) => sum + num(p.budgetAllocated), 0);
    const totalCost = projects.reduce((sum, p) => sum + num(p.budgetSpent), 0);
    const profitMargin =
      totalRevenue > 0 ? Math.round(((totalRevenue - totalCost) / totalRevenue) * 1000) / 10 : 0;
    const onTimeDelivery =
      totalProjects > 0
        ? Math.round(((totalProjects - delayedProjects) / totalProjects) * 100)
        : 0;

    // Group by project type
    const typeMap = new Map<string, { count: number; revenue: number; cost: number }>();
    for (const p of projects) {
      const key = p.projectType || 'Uncategorized';
      const entry = typeMap.get(key) || { count: 0, revenue: 0, cost: 0 };
      entry.count += 1;
      entry.revenue += num(p.budgetAllocated);
      entry.cost += num(p.budgetSpent);
      typeMap.set(key, entry);
    }
    const palette = ['bg-blue-500', 'bg-cyan-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500'];
    const projectTypeMetrics = Array.from(typeMap.entries()).map(([type, v], i) => ({
      type,
      count: v.count,
      revenue: v.revenue,
      cost: v.cost,
      avgDuration: 0,
      successRate:
        v.revenue > 0 ? Math.round(((v.revenue - v.cost) / v.revenue) * 100) : 0,
      color: palette[i % palette.length],
    }));

    // Top projects by allocated budget (revenue)
    const topProjects = [...projects]
      .sort((a, b) => num(b.budgetAllocated) - num(a.budgetAllocated))
      .slice(0, 5)
      .map((p) => {
        const revenue = num(p.budgetAllocated);
        const cost = num(p.budgetSpent);
        const profit = revenue - cost;
        return {
          name: p.name,
          revenue,
          profit,
          margin: revenue > 0 ? Math.round((profit / revenue) * 100) : 0,
          status: p.status,
        };
      });

    return {
      metrics: {
        totalProjects,
        activeProjects,
        completedProjects,
        delayedProjects,
        totalRevenue,
        totalCost,
        profitMargin,
        onTimeDelivery,
      },
      projectTypeMetrics,
      topProjects,
    };
  }
}
