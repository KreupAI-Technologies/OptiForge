import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { EventBusService } from '../../workflow/services/event-bus.service';
import { WorkflowEventType } from '../../workflow/events/event-types';
import { VendorContract, ContractStatus, ContractType } from '../entities/vendor-contract.entity';

export interface ContractItem {
  id: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  unitPrice: number;
  currency: string;
  minimumQuantity?: number;
  maximumQuantity?: number;
  unitOfMeasure: string;
  leadTimeDays: number;
  qualitySpecs?: string;
}

export interface ContractSLA {
  id: string;
  metric: string;
  target: string;
  measurement: string;
  penalty?: string;
  bonus?: string;
}

export interface PriceRevision {
  id: string;
  revisionDate: string;
  previousPrice: number;
  newPrice: number;
  percentageChange: number;
  reason: string;
  approvedBy?: string;
  approvedAt?: string;
}

@Injectable()
export class ContractService {
  constructor(
    private readonly eventBusService: EventBusService,
    @InjectRepository(VendorContract)
    private readonly contractRepository: Repository<VendorContract>,
  ) { }

  async create(createDto: Partial<VendorContract>): Promise<VendorContract> {
    const contractNumber = await this.generateContractNumber();

    const contract = this.contractRepository.create({
      contractNumber,
      status: ContractStatus.DRAFT,
      totalOrdered: 0,
      totalDelivered: 0,
      utilizationPercentage: 0,
      createdBy: createDto.createdBy || 'system',
      updatedBy: createDto.updatedBy || 'system',
      ...createDto,
    });

    const saved = await this.contractRepository.save(contract);

    await this.eventBusService.emit<any>(WorkflowEventType.CONTRACT_CREATED, {
      contractId: saved.id,
      contractNumber: saved.contractNumber,
      userId: saved.createdBy,
    });

    return saved;
  }

  async findAll(filters?: {
    status?: ContractStatus;
    vendorId?: string;
    contractType?: ContractType;
    expiringWithinDays?: number;
  }): Promise<VendorContract[]> {
    const query = this.contractRepository.createQueryBuilder('contract');

    if (filters?.status) {
      query.andWhere('contract.status = :status', { status: filters.status });
    }
    if (filters?.vendorId) {
      query.andWhere('contract.vendorId = :vendorId', { vendorId: filters.vendorId });
    }
    if (filters?.contractType) {
      query.andWhere('contract.contractType = :contractType', { contractType: filters.contractType });
    }
    if (filters?.expiringWithinDays) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() + filters.expiringWithinDays);
      query.andWhere('contract.status = :activeStatus', { activeStatus: ContractStatus.ACTIVE });
      query.andWhere('contract.endDate <= :cutoffDate', { cutoffDate });
    }

    query.orderBy('contract.createdAt', 'DESC');
    return await query.getMany();
  }

  async findOne(id: string): Promise<VendorContract> {
    const contract = await this.contractRepository.findOne({ where: { id } });
    if (!contract) {
      throw new NotFoundException(`Contract with ID ${id} not found`);
    }
    return contract;
  }

  async update(id: string, updateDto: Partial<VendorContract>): Promise<VendorContract> {
    const contract = await this.findOne(id);
    Object.assign(contract, updateDto);
    return await this.contractRepository.save(contract);
  }

  async delete(id: string): Promise<void> {
    const contract = await this.findOne(id);
    await this.contractRepository.remove(contract);
  }

  async submitForApproval(id: string, submittedBy: string): Promise<VendorContract> {
    const contract = await this.findOne(id);

    if (contract.status !== ContractStatus.DRAFT) {
      throw new BadRequestException('Only draft contracts can be submitted for approval');
    }

    contract.status = ContractStatus.PENDING_APPROVAL;
    contract.updatedBy = submittedBy;
    const updated = await this.contractRepository.save(contract);

    await this.eventBusService.emit<any>(WorkflowEventType.CONTRACT_SUBMITTED_FOR_APPROVAL, {
      contractId: id,
      contractNumber: contract.contractNumber,
      userId: submittedBy,
    });

    return updated;
  }

  async approve(id: string, approvedBy: string, notes?: string): Promise<VendorContract> {
    const contract = await this.findOne(id);

    if (contract.status !== ContractStatus.PENDING_APPROVAL) {
      throw new BadRequestException('Contract is not pending approval');
    }

    contract.status = ContractStatus.ACTIVE;
    contract.approvedBy = approvedBy;
    contract.approvedAt = new Date();
    contract.approvalNotes = notes || '';
    contract.effectiveDate = contract.startDate;
    contract.updatedBy = approvedBy;

    const updated = await this.contractRepository.save(contract);

    await this.eventBusService.emit<any>(WorkflowEventType.CONTRACT_APPROVED, {
      contractId: id,
      approvedBy,
      userId: approvedBy,
    });

    return updated;
  }

  async terminate(id: string, terminatedBy: string, reason: string): Promise<VendorContract> {
    const contract = await this.findOne(id);

    if (contract.status !== ContractStatus.ACTIVE) {
      throw new BadRequestException('Only active contracts can be terminated');
    }

    contract.status = ContractStatus.TERMINATED;
    contract.terminationDate = new Date();
    contract.description = `${contract.description || ''}\nTerminated by ${terminatedBy}: ${reason}`;
    contract.updatedBy = terminatedBy;

    const updated = await this.contractRepository.save(contract);

    await this.eventBusService.emit<any>(WorkflowEventType.CONTRACT_TERMINATED, {
      contractId: id,
      reason,
      userId: terminatedBy,
    });

    return updated;
  }

  async renew(id: string, renewedBy: string, newEndDate: string): Promise<VendorContract> {
    const contract = await this.findOne(id);

    if (contract.status !== ContractStatus.ACTIVE && contract.status !== ContractStatus.EXPIRED) {
      throw new BadRequestException('Contract cannot be renewed in current status');
    }

    contract.status = ContractStatus.RENEWED;
    contract.endDate = new Date(newEndDate);
    contract.description = `${contract.description || ''}\nRenewed by ${renewedBy} until ${newEndDate}`;
    contract.updatedBy = renewedBy;

    const updated = await this.contractRepository.save(contract);

    // Reset to active after renewal record saved
    updated.status = ContractStatus.ACTIVE;
    await this.contractRepository.save(updated);

    await this.eventBusService.emit<any>(WorkflowEventType.CONTRACT_RENEWED, {
      contractId: id,
      newEndDate,
      userId: renewedBy,
    });

    return updated;
  }

  async checkContractAvailability(
    itemId: string,
    vendorId?: string
  ): Promise<VendorContract | null> {
    const now = new Date();

    const query = this.contractRepository.createQueryBuilder('contract')
      .where('contract.status = :status', { status: ContractStatus.ACTIVE })
      .andWhere('contract.startDate <= :now', { now })
      .andWhere('contract.endDate >= :now', { now });

    if (vendorId) {
      query.andWhere('contract.vendorId = :vendorId', { vendorId });
    }

    const contracts = await query.getMany();

    // Filter by item existence in JSON column
    const activeContracts = contracts.filter(c =>
      c.items && c.items.some(i => i.itemId === itemId)
    );

    if (activeContracts.length === 0) return null;

    return activeContracts.reduce((best, current) => {
      const currentItem = current.items.find(i => i.itemId === itemId);
      const bestItem = best.items.find(i => i.itemId === itemId);
      return (currentItem?.unitPrice || Infinity) < (bestItem?.unitPrice || Infinity)
        ? current
        : best;
    });
  }

  async getContractPrice(contractId: string, itemId: string): Promise<ContractItem | null> {
    const contract = await this.findOne(contractId);
    return contract.items?.find(i => i.itemId === itemId) || null;
  }

  async addPriceRevision(
    contractId: string,
    itemId: string,
    newPrice: number,
    reason: string,
    revisedBy: string
  ): Promise<VendorContract> {
    const contract = await this.findOne(contractId);
    const items = [...(contract.items || [])];
    const itemIndex = items.findIndex(i => i.itemId === itemId);

    if (itemIndex === -1) {
      throw new NotFoundException(`Item ${itemId} not found in contract`);
    }

    const previousPrice = items[itemIndex].unitPrice;
    const percentageChange = ((newPrice - previousPrice) / previousPrice) * 100;

    const revision: PriceRevision = {
      id: uuidv4(),
      revisionDate: new Date().toISOString(),
      previousPrice,
      newPrice,
      percentageChange,
      reason,
    };

    items[itemIndex].unitPrice = newPrice;
    const history = [...(contract.priceRevisionHistory || []), revision];

    await this.eventBusService.emit<any>(WorkflowEventType.CONTRACT_PRICE_REVISED, {
      contractId,
      itemId,
      previousPrice,
      newPrice,
      percentageChange,
      userId: revisedBy,
    });

    return await this.update(contractId, {
      items,
      priceRevisionHistory: history,
      updatedBy: revisedBy,
    });
  }

  async updateUtilization(
    contractId: string,
    orderedAmount: number,
    deliveredAmount: number
  ): Promise<VendorContract> {
    const contract = await this.findOne(contractId);

    const newTotalOrdered = Number(contract.totalOrdered) + orderedAmount;
    const newTotalDelivered = Number(contract.totalDelivered) + deliveredAmount;
    const utilizationPercentage = contract.totalValue
      ? (newTotalOrdered / Number(contract.totalValue)) * 100
      : 0;

    return await this.update(contractId, {
      totalOrdered: newTotalOrdered,
      totalDelivered: newTotalDelivered,
      utilizationPercentage,
    });
  }

  async checkExpiringContracts(days: number = 30): Promise<VendorContract[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + days);

    const expiring = await this.contractRepository.find({
      where: {
        status: ContractStatus.ACTIVE,
        endDate: LessThanOrEqual(cutoffDate),
      }
    });

    // Emit alerts for expiring contracts
    for (const contract of expiring) {
      const daysUntilExpiry = Math.ceil(
        (new Date(contract.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );

      await this.eventBusService.emit<any>(WorkflowEventType.CONTRACT_EXPIRING_SOON, {
        contractId: contract.id,
        contractNumber: contract.contractNumber,
        vendorName: contract.vendorName,
        daysUntilExpiry,
        userId: 'SYSTEM',
      });
    }

    return expiring;
  }

  async getContractStatistics(): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byType: Record<string, number>;
    totalValue: number;
    averageUtilization: number;
    expiringSoon: number;
  }> {
    const contracts = await this.contractRepository.find();

    const byStatus: Record<string, number> = {};
    const byType: Record<string, number> = {};
    let totalValue = 0;
    let totalUtilization = 0;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + 30);

    contracts.forEach(c => {
      byStatus[c.status] = (byStatus[c.status] || 0) + 1;
      byType[c.contractType] = (byType[c.contractType] || 0) + 1;
      totalValue += Number(c.totalValue || 0);
      totalUtilization += Number(c.utilizationPercentage);
    });

    const expiringSoon = contracts.filter(c =>
      c.status === ContractStatus.ACTIVE &&
      new Date(c.endDate) <= cutoffDate
    ).length;

    return {
      total: contracts.length,
      byStatus,
      byType,
      totalValue,
      averageUtilization: contracts.length > 0
        ? totalUtilization / contracts.length
        : 0,
      expiringSoon,
    };
  }

  private async generateContractNumber(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const count = await this.contractRepository.count();
    const sequence = String(count + 1).padStart(5, '0');
    return `CTR-${year}${month}-${sequence}`;
  }
}
