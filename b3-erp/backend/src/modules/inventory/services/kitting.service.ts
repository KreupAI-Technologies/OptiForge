import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

const COMPANY = 'default-company-id';

@Injectable()
export class KittingService {
    constructor(private readonly prisma: PrismaService) {}

    // ---- Kits ----
    async findAllKits(filters?: { status?: string; search?: string }) {
        const where: any = { companyId: COMPANY };
        if (filters?.status) where.status = filters.status;
        if (filters?.search) {
            where.OR = [
                { kitName: { contains: filters.search, mode: 'insensitive' } },
                { kitNumber: { contains: filters.search, mode: 'insensitive' } },
            ];
        }
        return this.prisma.inventoryKit.findMany({ where, orderBy: { createdAt: 'desc' } });
    }

    async findKit(id: string) {
        const row = await this.prisma.inventoryKit.findUnique({ where: { id } });
        if (!row) throw new NotFoundException(`Kit ${id} not found`);
        return row;
    }

    async createKit(data: any) {
        const components = data.components ?? [];
        return this.prisma.inventoryKit.create({
            data: {
                kitNumber: data.kitNumber ?? `KIT-${Date.now()}`,
                kitName: data.kitName,
                category: data.category ?? null,
                components,
                componentCount: data.componentCount ?? (Array.isArray(components) ? components.length : 0),
                outputQuantity: data.outputQuantity ?? 1,
                outputUOM: data.outputUOM ?? null,
                status: data.status ?? 'active',
                createdBy: data.createdBy ?? null,
                companyId: COMPANY,
            },
        });
    }

    async updateKit(id: string, data: any) {
        await this.findKit(id);
        return this.prisma.inventoryKit.update({
            where: { id },
            data: {
                kitNumber: data.kitNumber,
                kitName: data.kitName,
                category: data.category,
                components: data.components,
                componentCount: data.componentCount,
                outputQuantity: data.outputQuantity,
                outputUOM: data.outputUOM,
                status: data.status,
            },
        });
    }

    async removeKit(id: string) {
        await this.findKit(id);
        await this.prisma.inventoryKit.delete({ where: { id } });
        return { success: true };
    }

    // ---- Kitting orders (assembly / disassembly) ----
    async findAllOrders(orderType?: string, filters?: { status?: string; search?: string }) {
        const where: any = { companyId: COMPANY };
        if (orderType) where.orderType = orderType;
        if (filters?.status) where.status = filters.status;
        if (filters?.search) {
            where.OR = [
                { orderNumber: { contains: filters.search, mode: 'insensitive' } },
                { kitName: { contains: filters.search, mode: 'insensitive' } },
            ];
        }
        return this.prisma.kittingOrder.findMany({ where, orderBy: { orderDate: 'desc' } });
    }

    async findOrder(id: string) {
        const row = await this.prisma.kittingOrder.findUnique({ where: { id } });
        if (!row) throw new NotFoundException(`Kitting order ${id} not found`);
        return row;
    }

    async createOrder(data: any) {
        return this.prisma.kittingOrder.create({
            data: {
                orderNumber: data.orderNumber ?? `${(data.orderType ?? 'ASM').slice(0, 3).toUpperCase()}-${Date.now()}`,
                orderType: data.orderType ?? 'assembly',
                orderDate: data.orderDate ? new Date(data.orderDate) : new Date(),
                kitNumber: data.kitNumber ?? null,
                kitName: data.kitName ?? null,
                quantityOrdered: data.quantityOrdered ?? 0,
                quantityDone: data.quantityDone ?? 0,
                handledBy: data.handledBy ?? null,
                warehouse: data.warehouse ?? null,
                reason: data.reason ?? null,
                status: data.status ?? 'pending',
                priority: data.priority ?? 'normal',
                expectedDate: data.expectedDate ? new Date(data.expectedDate) : null,
                companyId: COMPANY,
            },
        });
    }

    async updateOrder(id: string, data: any) {
        await this.findOrder(id);
        return this.prisma.kittingOrder.update({
            where: { id },
            data: {
                status: data.status,
                priority: data.priority,
                quantityDone: data.quantityDone,
                handledBy: data.handledBy,
                warehouse: data.warehouse,
                reason: data.reason,
                startDate: data.startDate ? new Date(data.startDate) : undefined,
                completionDate: data.completionDate ? new Date(data.completionDate) : undefined,
                expectedDate: data.expectedDate ? new Date(data.expectedDate) : undefined,
            },
        });
    }

    async removeOrder(id: string) {
        await this.findOrder(id);
        await this.prisma.kittingOrder.delete({ where: { id } });
        return { success: true };
    }
}
