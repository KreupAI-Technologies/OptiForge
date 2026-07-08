import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CapacityPlan, CapacityPlanStatus } from '../entities/capacity-plan.entity';

@Injectable()
export class CapacityPlanService {
  constructor(
    @InjectRepository(CapacityPlan)
    private readonly capacityPlanRepository: Repository<CapacityPlan>,
  ) {}

  async create(createDto: Partial<CapacityPlan>): Promise<CapacityPlan> {
    const existing = await this.capacityPlanRepository.findOne({
      where: { planNumber: createDto.planNumber },
    });

    if (existing) {
      throw new BadRequestException(`Capacity Plan ${createDto.planNumber} already exists`);
    }

    const plan = this.capacityPlanRepository.create(createDto);
    return this.capacityPlanRepository.save(plan);
  }

  async findAll(filters?: {
    companyId?: string;
    status?: CapacityPlanStatus;
    workCenterId?: string;
  }): Promise<CapacityPlan[]> {
    const query = this.capacityPlanRepository.createQueryBuilder('plan');

    if (filters?.companyId) {
      query.andWhere('plan.companyId = :companyId', { companyId: filters.companyId });
    }

    if (filters?.status) {
      query.andWhere('plan.status = :status', { status: filters.status });
    }

    if (filters?.workCenterId) {
      query.andWhere('plan.workCenterId = :workCenterId', { workCenterId: filters.workCenterId });
    }

    query.orderBy('plan.createdAt', 'DESC');
    return query.getMany();
  }

  async findOne(id: string): Promise<CapacityPlan> {
    const plan = await this.capacityPlanRepository.findOne({ where: { id } });
    if (!plan) {
      throw new NotFoundException(`Capacity Plan with ID ${id} not found`);
    }
    return plan;
  }

  async update(id: string, updateDto: Partial<CapacityPlan>): Promise<CapacityPlan> {
    const plan = await this.findOne(id);
    Object.assign(plan, updateDto);
    return this.capacityPlanRepository.save(plan);
  }

  async remove(id: string): Promise<void> {
    const plan = await this.findOne(id);
    if (plan.status !== 'draft') {
      throw new BadRequestException('Only draft capacity plans can be deleted');
    }
    await this.capacityPlanRepository.remove(plan);
  }

  async calculateUtilization(id: string): Promise<any> {
    const plan = await this.findOne(id);
    const utilization = plan.availableCapacity > 0
      ? (plan.requiredCapacity / plan.availableCapacity) * 100
      : 0;

    plan.utilizationPercentage = utilization;
    await this.capacityPlanRepository.save(plan);

    return {
      planId: plan.id,
      requiredCapacity: plan.requiredCapacity,
      availableCapacity: plan.availableCapacity,
      utilization: utilization,
    };
  }

  /**
   * Deterministic level-load / optimize pass for a capacity plan. Recomputes
   * utilization, flags a bottleneck when over 100%, and derives an
   * optimization score (100 when perfectly balanced, decreasing as the plan
   * is over- or under-utilised). No external solver.
   */
  async optimize(id: string): Promise<CapacityPlan> {
    const plan = await this.findOne(id);

    const utilization =
      plan.availableCapacity > 0
        ? (Number(plan.requiredCapacity) / Number(plan.availableCapacity)) * 100
        : 0;
    plan.utilizationPercentage = Number(utilization.toFixed(2));
    plan.isBottleneck = utilization > 100;

    // Score peaks at 100 when utilisation is 100%, falls off either side.
    const score = Math.max(0, 100 - Math.abs(100 - utilization));
    plan.optimizationScore = Number(score.toFixed(2));
    plan.isOptimized = true;
    plan.optimizedAt = new Date();

    return this.capacityPlanRepository.save(plan);
  }

  /**
   * Overtime planning. Computes the capacity shortfall (required - available)
   * and persists an overtime allocation covering it. Shifts are 8h blocks and
   * cost is derived from an optional overtimeRate (default 1.5x a 50/hr base).
   */
  async planOvertime(
    id: string,
    options?: { overtimeRate?: number; maxOvertimeHours?: number; plannedFor?: string },
  ): Promise<CapacityPlan> {
    const plan = await this.findOne(id);

    const required = Number(plan.requiredCapacity) || 0;
    const available = Number(plan.availableCapacity) || 0;
    const rawShortfall = Math.max(0, required - available);
    const maxOvertime = options?.maxOvertimeHours ?? rawShortfall;
    const overtimeHours = Math.min(rawShortfall, maxOvertime);
    const rate = options?.overtimeRate ?? 75; // 1.5x a 50/hr base
    const shifts = Math.ceil(overtimeHours / 8);
    const estimatedCost = Number((overtimeHours * rate).toFixed(2));

    const allocation = {
      workCenterId: plan.workCenterId,
      workCenterName: plan.name,
      shortfallHours: Number(rawShortfall.toFixed(2)),
      overtimeHours: Number(overtimeHours.toFixed(2)),
      shifts,
      estimatedCost,
      plannedFor: options?.plannedFor ?? new Date().toISOString(),
    };

    plan.overtimePlans = [...(plan.overtimePlans ?? []), allocation];
    plan.totalOvertimeHours =
      Number(plan.totalOvertimeHours || 0) + allocation.overtimeHours;

    // Overtime adds to available capacity for planning purposes.
    plan.availableCapacity = Number(
      (available + allocation.overtimeHours).toFixed(2),
    );
    plan.utilizationPercentage =
      plan.availableCapacity > 0
        ? Number(((required / plan.availableCapacity) * 100).toFixed(2))
        : 0;

    return this.capacityPlanRepository.save(plan);
  }
}
