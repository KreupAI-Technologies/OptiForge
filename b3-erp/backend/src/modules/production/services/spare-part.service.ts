import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SparePart } from '../entities/spare-part.entity';
import { PurchaseRequisitionService } from '../../procurement/services/purchase-requisition.service';
import { PRPriority, PRType } from '../../procurement/entities/purchase-requisition.entity';

@Injectable()
export class SparePartService {
  constructor(
    @InjectRepository(SparePart)
    private readonly repo: Repository<SparePart>,
    private readonly purchaseRequisitionService: PurchaseRequisitionService,
  ) {}

  async create(createDto: Partial<SparePart>): Promise<SparePart> {
    const entity = this.repo.create(createDto);
    return this.repo.save(entity);
  }

  async findAll(filters?: { status?: string; category?: string }): Promise<SparePart[]> {
    const query = this.repo.createQueryBuilder('s');
    if (filters?.status) {
      query.andWhere('s.status = :status', { status: filters.status });
    }
    if (filters?.category) {
      query.andWhere('s.category = :category', { category: filters.category });
    }
    query.orderBy('s.createdAt', 'DESC');
    return query.getMany();
  }

  async findOne(id: string): Promise<SparePart> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`Spare part with ID ${id} not found`);
    }
    return entity;
  }

  async update(id: string, updateDto: Partial<SparePart>): Promise<SparePart> {
    const entity = await this.findOne(id);
    Object.assign(entity, updateDto);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }

  /**
   * Create a Purchase Requisition for a spare part by delegating to the
   * Procurement module (no duplicate procurement schema). Backs the
   * "Create PO" action on /production/maintenance/spares. The PR is the
   * document that later converts to a PO in procurement.
   */
  async createPurchaseRequisition(
    id: string,
    body?: {
      quantity?: number;
      requesterId?: string;
      requesterName?: string;
      priority?: string;
      requiredByDate?: string;
      notes?: string;
    },
  ): Promise<any> {
    const part = await this.findOne(id);

    // Default order quantity: reorder up to reorder point, else 1.
    const shortfall = (part.reorderPoint || 0) - (part.quantityInStock || 0);
    const quantity =
      body?.quantity && body.quantity > 0
        ? body.quantity
        : shortfall > 0
          ? shortfall
          : Math.max(part.minimumStock || 0, 1);

    if (quantity <= 0) {
      throw new BadRequestException('Order quantity must be greater than zero');
    }

    const unitCost = Number(part.unitCost) || 0;
    const today = new Date().toISOString().split('T')[0];
    const leadDays = part.leadTime || 7;
    const requiredBy =
      body?.requiredByDate ||
      new Date(Date.now() + leadDays * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];

    const priorityMap: Record<string, PRPriority> = {
      low: PRPriority.LOW,
      medium: PRPriority.MEDIUM,
      high: PRPriority.HIGH,
      urgent: PRPriority.URGENT,
      critical: PRPriority.URGENT,
    };
    const priority =
      priorityMap[(body?.priority || '').toLowerCase()] ||
      (part.status === 'critical' || part.status === 'out-of-stock'
        ? PRPriority.URGENT
        : PRPriority.MEDIUM);

    const pr = await this.purchaseRequisitionService.create({
      prDate: today,
      requiredByDate: requiredBy,
      priority,
      prType: PRType.STANDARD,
      requesterId: body?.requesterId || 'maintenance',
      requesterName: body?.requesterName || 'Maintenance',
      department: 'Maintenance',
      items: [
        {
          lineNumber: 1,
          itemId: part.id,
          itemCode: part.partNumber || part.id,
          itemName: part.partName || 'Spare Part',
          description: `Spare part replenishment (${part.category})`,
          uom: part.unit || 'PCS',
          quantity,
          estimatedUnitPrice: unitCost,
          estimatedTotal: unitCost * quantity,
          requiredDate: requiredBy,
        },
      ],
      purpose: `Spare part replenishment for ${part.partName || part.partNumber}`,
      notes: body?.notes,
    } as any);

    // Reflect that a replenishment order was raised.
    part.lastPurchaseDate = today;
    await this.repo.save(part);

    return {
      sparePartId: part.id,
      purchaseRequisition: pr,
    };
  }
}
