import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
    AutoReplenishmentConfig,
    ReorderRule,
    ReplenishmentRequest,
} from '../entities/replenishment.entity';
import {
    CreateAutoReplenishmentConfigDto,
    UpdateAutoReplenishmentConfigDto,
    CreateReorderRuleDto,
    CreateReplenishmentRequestDto,
} from '../dto/replenishment.dto';

@Injectable()
export class ReplenishmentService {
    constructor(
        @InjectRepository(AutoReplenishmentConfig)
        private readonly configRepo: Repository<AutoReplenishmentConfig>,
        @InjectRepository(ReorderRule)
        private readonly ruleRepo: Repository<ReorderRule>,
        @InjectRepository(ReplenishmentRequest)
        private readonly requestRepo: Repository<ReplenishmentRequest>,
    ) {}

    // ---- Auto-replenishment configs ----

    async findAllConfigs(): Promise<AutoReplenishmentConfig[]> {
        return this.configRepo.find({ order: { createdAt: 'DESC' } });
    }

    async findConfig(id: string): Promise<AutoReplenishmentConfig> {
        const config = await this.configRepo.findOne({ where: { id } });
        if (!config) {
            throw new NotFoundException(`Auto-replenishment config ${id} not found`);
        }
        return config;
    }

    async createConfig(
        dto: CreateAutoReplenishmentConfigDto,
    ): Promise<AutoReplenishmentConfig> {
        const config = this.configRepo.create({
            ...dto,
            enabled: dto.enabled ?? true,
            schedule: dto.schedule ?? 'daily',
            autoApprove: dto.autoApprove ?? false,
            maxOrderValue: dto.maxOrderValue ?? 0,
            notifyUsers: dto.notifyUsers ?? [],
        });
        return this.configRepo.save(config);
    }

    async updateConfig(
        id: string,
        dto: UpdateAutoReplenishmentConfigDto,
    ): Promise<AutoReplenishmentConfig> {
        const config = await this.findConfig(id);
        Object.assign(config, dto);
        return this.configRepo.save(config);
    }

    async toggleConfig(
        id: string,
        enabled: boolean,
    ): Promise<AutoReplenishmentConfig> {
        const config = await this.findConfig(id);
        config.enabled = enabled;
        return this.configRepo.save(config);
    }

    async deleteConfig(id: string): Promise<void> {
        const result = await this.configRepo.delete(id);
        if (!result.affected) {
            throw new NotFoundException(`Auto-replenishment config ${id} not found`);
        }
    }

    // ---- Reorder rules ----

    async findAllRules(): Promise<ReorderRule[]> {
        return this.ruleRepo.find({ order: { createdAt: 'DESC' } });
    }

    async createRule(dto: CreateReorderRuleDto): Promise<ReorderRule> {
        const rule = this.ruleRepo.create({
            ...dto,
            method: dto.method ?? 'reorder-point',
            priority: dto.priority ?? 'medium',
            autoApprove: dto.autoApprove ?? false,
            leadTimeDays: dto.leadTimeDays ?? 0,
            safetyStockDays: dto.safetyStockDays ?? 0,
            isActive: dto.isActive ?? true,
        });
        return this.ruleRepo.save(rule);
    }

    async deleteRule(id: string): Promise<void> {
        const result = await this.ruleRepo.delete(id);
        if (!result.affected) {
            throw new NotFoundException(`Reorder rule ${id} not found`);
        }
    }

    // ---- Replenishment requests ----

    async findAllRequests(): Promise<ReplenishmentRequest[]> {
        return this.requestRepo.find({ order: { createdAt: 'DESC' } });
    }

    async createRequest(
        dto: CreateReplenishmentRequestDto,
    ): Promise<ReplenishmentRequest> {
        const requestNumber = `RPL-${Date.now()}`;
        const request = this.requestRepo.create({
            ...dto,
            requestNumber,
            priority: dto.priority ?? 'medium',
            status: 'pending',
        });
        return this.requestRepo.save(request);
    }
}
