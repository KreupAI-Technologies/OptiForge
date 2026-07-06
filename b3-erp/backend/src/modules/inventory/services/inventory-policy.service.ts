import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

const COMPANY = 'default-company-id';

@Injectable()
export class InventoryPolicyService {
    constructor(private readonly prisma: PrismaService) {}

    async findAll(filters?: { policyType?: string; status?: string; search?: string }) {
        const where: any = { companyId: COMPANY };
        if (filters?.policyType) where.policyType = filters.policyType;
        if (filters?.status) where.status = filters.status;
        if (filters?.search) {
            where.OR = [
                { policyName: { contains: filters.search, mode: 'insensitive' } },
                { policyCode: { contains: filters.search, mode: 'insensitive' } },
            ];
        }
        return this.prisma.inventoryPolicy.findMany({ where, orderBy: { createdAt: 'desc' } });
    }

    async findOne(id: string) {
        const row = await this.prisma.inventoryPolicy.findUnique({ where: { id } });
        if (!row) throw new NotFoundException(`Inventory policy ${id} not found`);
        return row;
    }

    async create(data: any) {
        return this.prisma.inventoryPolicy.create({
            data: {
                policyCode: data.policyCode ?? `POL-${Date.now()}`,
                policyName: data.policyName,
                policyType: data.policyType ?? 'reorder',
                category: data.category ?? null,
                description: data.description ?? null,
                parameters: data.parameters ?? {},
                appliesTo: data.appliesTo ?? null,
                status: data.status ?? 'active',
                companyId: COMPANY,
            },
        });
    }

    async update(id: string, data: any) {
        await this.findOne(id);
        return this.prisma.inventoryPolicy.update({
            where: { id },
            data: {
                policyCode: data.policyCode,
                policyName: data.policyName,
                policyType: data.policyType,
                category: data.category,
                description: data.description,
                parameters: data.parameters,
                appliesTo: data.appliesTo,
                status: data.status,
            },
        });
    }

    async remove(id: string) {
        await this.findOne(id);
        await this.prisma.inventoryPolicy.delete({ where: { id } });
        return { success: true };
    }
}
