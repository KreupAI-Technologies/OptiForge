import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectResource } from '../entities/project-resource.entity';
import {
    CreateProjectResourceDto,
    UpdateProjectResourceDto,
    TransferResourceDto,
    BalanceWorkloadDto,
} from '../dto/project-resource.dto';

@Injectable()
export class ProjectResourcesService {
    constructor(
        @InjectRepository(ProjectResource)
        private resourceRepository: Repository<ProjectResource>,
    ) { }

    async create(createResourceDto: CreateProjectResourceDto): Promise<ProjectResource> {
        const resource = this.resourceRepository.create(createResourceDto);
        return this.resourceRepository.save(resource);
    }

    async findAll(projectId: string): Promise<ProjectResource[]> {
        return this.resourceRepository.find({
            where: { projectId },
            order: { createdAt: 'ASC' }
        });
    }

    async findOne(id: string): Promise<ProjectResource> {
        const resource = await this.resourceRepository.findOne({ where: { id } });
        if (!resource) {
            throw new NotFoundException(`Resource with ID ${id} not found`);
        }
        return resource;
    }

    async update(id: string, updateResourceDto: UpdateProjectResourceDto): Promise<ProjectResource> {
        const resource = await this.findOne(id);
        Object.assign(resource, updateResourceDto);
        return this.resourceRepository.save(resource);
    }

    async remove(id: string): Promise<void> {
        const result = await this.resourceRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Resource with ID ${id} not found`);
        }
    }

    /**
     * Transfer a resource allocation from one project to another. Locates the
     * source allocation (by allocation id, or by userId + fromProject), then
     * re-points it to the target project. Returns the updated allocation.
     */
    async transfer(dto: TransferResourceDto): Promise<ProjectResource> {
        if (!dto.toProject) {
            throw new BadRequestException('toProject is required');
        }

        let allocation: ProjectResource | null = null;
        if (dto.resourceId) {
            allocation = await this.resourceRepository.findOne({
                where: { id: dto.resourceId },
            });
        }
        if (!allocation && dto.userId && dto.fromProject) {
            allocation = await this.resourceRepository.findOne({
                where: { userId: dto.userId, projectId: dto.fromProject },
            });
        }

        if (!allocation) {
            // No existing allocation found — create one on the target project so the
            // transfer still produces a persisted allocation.
            if (!dto.userId) {
                throw new NotFoundException(
                    'Source allocation not found and no userId provided to create one.',
                );
            }
            allocation = this.resourceRepository.create({
                projectId: dto.toProject,
                userId: dto.userId,
                role: dto.role,
                allocationPercentage: dto.allocation ?? 100,
            });
            return this.resourceRepository.save(allocation);
        }

        allocation.projectId = dto.toProject;
        if (dto.role) allocation.role = dto.role;
        if (dto.allocation != null) allocation.allocationPercentage = dto.allocation;
        return this.resourceRepository.save(allocation);
    }

    /**
     * Compute workload-balancing recommendations from current allocations.
     * Groups allocations by user, sums their allocation %, and flags who is
     * over- or under-utilised. Read-only — does not mutate allocations.
     */
    async balanceWorkload(dto: BalanceWorkloadDto): Promise<{
        method: string;
        department: string | null;
        recommendations: Array<{
            userId: string;
            utilization: number;
            status: string;
            recommendation: string;
        }>;
    }> {
        const where: Record<string, any> = {};
        if (dto.projectId) where.projectId = dto.projectId;
        const rows = await this.resourceRepository.find({ where });

        const byUser = new Map<string, number>();
        rows.forEach((r) => {
            const cur = byUser.get(r.userId) ?? 0;
            byUser.set(r.userId, cur + Number(r.allocationPercentage ?? 0));
        });

        const recommendations = Array.from(byUser.entries())
            .map(([userId, utilization]) => {
                let status = 'balanced';
                let recommendation = 'No change needed';
                if (utilization > 100) {
                    status = 'over-allocated';
                    recommendation = `Reduce by ${utilization - 100}%`;
                } else if (utilization < 60) {
                    status = 'under-utilized';
                    recommendation = `Can take +${100 - utilization}%`;
                }
                return { userId, utilization, status, recommendation };
            })
            .sort((a, b) => b.utilization - a.utilization);

        return {
            method: dto.method ?? 'auto',
            department: dto.department ?? null,
            recommendations,
        };
    }
}
