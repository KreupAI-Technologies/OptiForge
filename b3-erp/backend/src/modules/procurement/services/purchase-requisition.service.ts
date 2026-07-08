import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PurchaseRequisition, PRStatus } from '../entities/purchase-requisition.entity';
import {
  CreatePurchaseRequisitionDto,
  UpdatePurchaseRequisitionDto,
  PurchaseRequisitionResponseDto,
} from '../dto';

@Injectable()
export class PurchaseRequisitionService {
  constructor(
    @InjectRepository(PurchaseRequisition)
    private readonly prRepository: Repository<PurchaseRequisition>,
  ) {}

  async create(createDto: CreatePurchaseRequisitionDto): Promise<PurchaseRequisitionResponseDto> {
    const prNumber = await this.generatePRNumber();

    // Calculate total amount
    const totalAmount = createDto.items.reduce(
      (sum, item) => sum + item.estimatedTotal,
      0
    );

    const pr = this.prRepository.create({
      ...createDto,
      prNumber,
      totalAmount,
      status: PRStatus.DRAFT,
    });

    const savedPR = await this.prRepository.save(pr);
    return this.mapToResponse(savedPR);
  }

  async findAll(filters?: any): Promise<PurchaseRequisitionResponseDto[]> {
    const query = this.prRepository.createQueryBuilder('pr');

    if (filters?.status) {
      query.andWhere('pr.status = :status', { status: filters.status });
    }

    if (filters?.requesterId) {
      query.andWhere('pr.requesterId = :requesterId', { requesterId: filters.requesterId });
    }

    if (filters?.department) {
      query.andWhere('pr.department = :department', { department: filters.department });
    }

    if (filters?.fromDate) {
      query.andWhere('pr.prDate >= :fromDate', { fromDate: filters.fromDate });
    }

    if (filters?.toDate) {
      query.andWhere('pr.prDate <= :toDate', { toDate: filters.toDate });
    }

    query.orderBy('pr.createdAt', 'DESC');

    const prs = await query.getMany();
    return prs.map(pr => this.mapToResponse(pr));
  }

  async findOne(id: string): Promise<PurchaseRequisitionResponseDto> {
    const pr = await this.prRepository.findOne({ where: { id } });
    if (!pr) {
      throw new NotFoundException(`Purchase Requisition with ID ${id} not found`);
    }
    return this.mapToResponse(pr);
  }

  async update(id: string, updateDto: UpdatePurchaseRequisitionDto): Promise<PurchaseRequisitionResponseDto> {
    const pr = await this.prRepository.findOne({ where: { id } });
    if (!pr) {
      throw new NotFoundException(`Purchase Requisition with ID ${id} not found`);
    }

    if (pr.status !== PRStatus.DRAFT) {
      throw new BadRequestException('Only draft PRs can be updated');
    }

    // Recalculate total if items changed
    if (updateDto.items) {
      const totalAmount = updateDto.items.reduce(
        (sum, item) => sum + item.estimatedTotal,
        0
      );
      (updateDto as any).totalAmount = totalAmount;
    }

    Object.assign(pr, updateDto);
    const updatedPR = await this.prRepository.save(pr);
    return this.mapToResponse(updatedPR);
  }

  async remove(id: string): Promise<void> {
    const pr = await this.prRepository.findOne({ where: { id } });
    if (!pr) {
      throw new NotFoundException(`Purchase Requisition with ID ${id} not found`);
    }

    if (pr.status !== PRStatus.DRAFT) {
      throw new BadRequestException('Only draft PRs can be deleted');
    }

    await this.prRepository.remove(pr);
  }

  async submit(id: string): Promise<PurchaseRequisitionResponseDto> {
    const pr = await this.prRepository.findOne({ where: { id } });
    if (!pr) {
      throw new NotFoundException(`Purchase Requisition with ID ${id} not found`);
    }

    if (pr.status !== PRStatus.DRAFT) {
      throw new BadRequestException('Only draft PRs can be submitted');
    }

    pr.status = PRStatus.SUBMITTED;
    const updatedPR = await this.prRepository.save(pr);
    return this.mapToResponse(updatedPR);
  }

  async approve(id: string, approverData: { approvedBy: string; approverName: string; notes?: string }): Promise<PurchaseRequisitionResponseDto> {
    const pr = await this.prRepository.findOne({ where: { id } });
    if (!pr) {
      throw new NotFoundException(`Purchase Requisition with ID ${id} not found`);
    }

    if (pr.status !== PRStatus.SUBMITTED) {
      throw new BadRequestException('Only submitted PRs can be approved');
    }

    pr.status = PRStatus.APPROVED;
    pr.isApproved = true;
    pr.approvedBy = approverData.approvedBy;
    pr.approverName = approverData.approverName;
    pr.approvedAt = new Date();
    pr.approvalNotes = approverData.notes || '';

    const updatedPR = await this.prRepository.save(pr);
    return this.mapToResponse(updatedPR);
  }

  async reject(id: string, rejectionData: { rejectedBy: string; reason: string }): Promise<PurchaseRequisitionResponseDto> {
    const pr = await this.prRepository.findOne({ where: { id } });
    if (!pr) {
      throw new NotFoundException(`Purchase Requisition with ID ${id} not found`);
    }

    if (pr.status !== PRStatus.SUBMITTED) {
      throw new BadRequestException('Only submitted PRs can be rejected');
    }

    pr.status = PRStatus.REJECTED;
    pr.rejectedBy = rejectionData.rejectedBy;
    pr.rejectedAt = new Date();
    pr.rejectionReason = rejectionData.reason;

    const updatedPR = await this.prRepository.save(pr);
    return this.mapToResponse(updatedPR);
  }

  async requestInfo(
    id: string,
    infoData: { message: string; requestedBy?: string },
  ): Promise<PurchaseRequisitionResponseDto> {
    const pr = await this.prRepository.findOne({ where: { id } });
    if (!pr) {
      throw new NotFoundException(`Purchase Requisition with ID ${id} not found`);
    }

    if (!infoData?.message) {
      throw new BadRequestException('message is required');
    }

    pr.infoRequested = true;
    pr.infoRequestedBy = infoData.requestedBy || '';
    pr.infoRequestMessage = infoData.message;
    pr.infoRequestedAt = new Date();

    const updatedPR = await this.prRepository.save(pr);
    return this.mapToResponse(updatedPR);
  }

  async convertToPO(id: string, poData: { poId: string; poNumber: string }): Promise<PurchaseRequisitionResponseDto> {
    const pr = await this.prRepository.findOne({ where: { id } });
    if (!pr) {
      throw new NotFoundException(`Purchase Requisition with ID ${id} not found`);
    }

    if (pr.status !== PRStatus.APPROVED) {
      throw new BadRequestException('Only approved PRs can be converted to PO');
    }

    if (!pr.purchaseOrders) {
      pr.purchaseOrders = [];
    }

    pr.purchaseOrders.push({
      poId: poData.poId,
      poNumber: poData.poNumber,
      createdAt: new Date(),
    });

    pr.status = PRStatus.FULLY_ORDERED;

    const updatedPR = await this.prRepository.save(pr);
    return this.mapToResponse(updatedPR);
  }

  private async generatePRNumber(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');

    const count = await this.prRepository.count();
    const sequence = String(count + 1).padStart(5, '0');

    return `PR-${year}${month}-${sequence}`;
  }

  private mapToResponse(pr: PurchaseRequisition): PurchaseRequisitionResponseDto {
    return {
      id: pr.id,
      prNumber: pr.prNumber,
      prDate: pr.prDate,
      requiredByDate: pr.requiredByDate,
      status: pr.status,
      priority: pr.priority,
      prType: pr.prType,
      requesterId: pr.requesterId,
      requesterName: pr.requesterName,
      department: pr.department,
      costCenter: pr.costCenter,
      project: pr.project,
      items: pr.items,
      totalAmount: pr.totalAmount,
      purpose: pr.purpose,
      justification: pr.justification,
      isApproved: pr.isApproved,
      approvedBy: pr.approvedBy,
      approverName: pr.approverName,
      approvedAt: pr.approvedAt,
      approvalNotes: pr.approvalNotes,
      notes: pr.notes,
      createdBy: pr.createdBy,
      updatedBy: pr.updatedBy,
      createdAt: pr.createdAt,
      updatedAt: pr.updatedAt,
    };
  }
}
