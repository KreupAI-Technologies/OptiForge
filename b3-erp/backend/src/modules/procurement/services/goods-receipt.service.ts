import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GoodsReceipt, GRNStatus } from '../entities/goods-receipt.entity';
import { GoodsReceiptItem, GRNItemStatus } from '../entities/goods-receipt-item.entity';
import { PurchaseInvoice } from '../entities/purchase-invoice.entity';
import { CreateGoodsReceiptDto, UpdateGoodsReceiptDto, GoodsReceiptResponseDto } from '../dto';
import { EventBusService } from '../../workflow/services/event-bus.service';

@Injectable()
export class GoodsReceiptService {
  constructor(
    @InjectRepository(GoodsReceipt)
    private readonly grnRepository: Repository<GoodsReceipt>,
    @InjectRepository(GoodsReceiptItem)
    private readonly grnItemRepository: Repository<GoodsReceiptItem>,
    @InjectRepository(PurchaseInvoice)
    private readonly invoiceRepository: Repository<PurchaseInvoice>,
    private readonly eventBus: EventBusService,
  ) { }

  async create(createDto: CreateGoodsReceiptDto): Promise<GoodsReceiptResponseDto> {
    const grnNumber = await this.generateGRNNumber();

    const grn = this.grnRepository.create({
      ...createDto,
      grnNumber,
      receiptDateTime: new Date(),
      status: GRNStatus.DRAFT,
    });

    const savedGRN = await this.grnRepository.save(grn);

    // Create GRN items
    const grnItems = createDto.items.map((item: any) =>
      this.grnItemRepository.create({
        goodsReceiptId: savedGRN.id,
        ...item,
        status: GRNItemStatus.PENDING_INSPECTION,
      } as any) as unknown as GoodsReceiptItem
    );

    await this.grnItemRepository.save(grnItems);

    // Emit goods received event
    await this.eventBus.emitGoodsReceived({
      receiptId: savedGRN.id,
      receiptNumber: savedGRN.grnNumber,
      purchaseOrderId: savedGRN.purchaseOrderId,
      poNumber: savedGRN.purchaseOrderNumber,
      vendorId: savedGRN.vendorId,
      warehouseId: savedGRN.warehouseId,
      items: grnItems.map(item => ({
        itemId: item.itemId,
        itemName: item.itemName,
        orderedQty: item.orderedQuantity,
        receivedQty: item.receivedQuantity,
        unit: item.uom,
        batchNumber: item.batchNumber,
        inspectionRequired: item.requiresQualityCheck !== false,
      })),
      userId: savedGRN.createdBy || 'system',
    });

    return this.mapToResponse(savedGRN);
  }

  async findAll(filters?: any): Promise<GoodsReceiptResponseDto[]> {
    const grns = await this.grnRepository.find({
      order: { createdAt: 'DESC' },
    });
    return grns.map(grn => this.mapToResponse(grn));
  }

  async findOne(id: string): Promise<GoodsReceiptResponseDto> {
    const grn = await this.grnRepository.findOne({
      where: { id },
      relations: ['items'],
    });

    if (!grn) {
      throw new NotFoundException(`Goods Receipt with ID ${id} not found`);
    }

    return this.mapToResponse(grn);
  }

  async update(id: string, updateDto: UpdateGoodsReceiptDto): Promise<GoodsReceiptResponseDto> {
    const grn = await this.grnRepository.findOne({ where: { id } });
    if (!grn) {
      throw new NotFoundException(`Goods Receipt with ID ${id} not found`);
    }

    Object.assign(grn, updateDto);
    const updated = await this.grnRepository.save(grn);
    return this.mapToResponse(updated);
  }

  async remove(id: string): Promise<void> {
    await this.grnRepository.delete(id);
  }

  async qualityCheck(id: string, checkData: any): Promise<GoodsReceiptResponseDto> {
    const grn = await this.grnRepository.findOne({ where: { id } });
    if (!grn) {
      throw new NotFoundException(`Goods Receipt with ID ${id} not found`);
    }

    grn.qualityCheckCompleted = true;
    grn.qualityCheckPassed = checkData.passed;
    grn.qualityCheckRemarks = checkData.remarks;
    grn.qualityCheckResults = checkData.results;
    grn.status = checkData.passed ? GRNStatus.QUALITY_CHECK_PASSED : GRNStatus.QUALITY_CHECK_FAILED;

    const updated = await this.grnRepository.save(grn);
    return this.mapToResponse(updated);
  }

  async postToInventory(id: string): Promise<GoodsReceiptResponseDto> {
    const grn = await this.grnRepository.findOne({ where: { id } });
    if (!grn) {
      throw new NotFoundException(`Goods Receipt with ID ${id} not found`);
    }

    if (!grn.qualityCheckPassed) {
      throw new BadRequestException('Quality check must pass before posting to inventory');
    }

    grn.isPostedToInventory = true;
    grn.inventoryPostedAt = new Date();
    grn.status = GRNStatus.POSTED;

    const updated = await this.grnRepository.save(grn);
    return this.mapToResponse(updated);
  }

  async matchInvoice(
    id: string,
    matchData: { invoiceId?: string; invoiceNumber?: string; matchedBy?: string; notes?: string },
  ): Promise<GoodsReceiptResponseDto> {
    const grn = await this.grnRepository.findOne({ where: { id } });
    if (!grn) {
      throw new NotFoundException(`Goods Receipt with ID ${id} not found`);
    }

    if (!matchData?.invoiceId && !matchData?.invoiceNumber) {
      throw new BadRequestException('invoiceId or invoiceNumber is required to match an invoice');
    }

    let invoice: PurchaseInvoice | null = null;
    if (matchData.invoiceId) {
      invoice = await this.invoiceRepository.findOne({ where: { id: matchData.invoiceId } });
    } else if (matchData.invoiceNumber) {
      invoice =
        (await this.invoiceRepository.findOne({
          where: { internalInvoiceNumber: matchData.invoiceNumber },
        })) ??
        (await this.invoiceRepository.findOne({
          where: { vendorInvoiceNumber: matchData.invoiceNumber },
        }));
    }

    if (!invoice) {
      throw new NotFoundException('Referenced purchase invoice not found');
    }

    grn.isInvoiceMatched = true;
    grn.matchedInvoiceId = invoice.id;
    grn.matchedInvoiceNumber = invoice.internalInvoiceNumber || invoice.vendorInvoiceNumber;
    grn.invoiceMatchedAt = new Date();
    grn.invoiceMatchedBy = matchData.matchedBy || '';
    grn.invoiceMatchNotes = matchData.notes || '';

    const updated = await this.grnRepository.save(grn);
    return this.mapToResponse(updated);
  }

  async getPendingReceipts(): Promise<any[]> {
    const grns = await this.grnRepository.find({
      where: [
        { status: GRNStatus.QUALITY_CHECK_PENDING },
        { status: GRNStatus.DRAFT },
      ],
    });

    return grns.map(grn => ({
      id: grn.id,
      grnNumber: grn.grnNumber,
      grnDate: grn.grnDate,
      vendorName: grn.vendorName,
      poNumber: grn.purchaseOrderNumber,
      totalReceivedAmount: grn.totalReceivedAmount,
      status: grn.status,
    }));
  }

  private async generateGRNNumber(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const count = await this.grnRepository.count();
    const sequence = String(count + 1).padStart(5, '0');
    return `GRN-${year}${month}-${sequence}`;
  }

  private mapToResponse(grn: GoodsReceipt): GoodsReceiptResponseDto {
    return {
      id: grn.id,
      grnNumber: grn.grnNumber,
      grnDate: grn.grnDate,
      status: grn.status,
      grnType: grn.grnType,
      vendorName: grn.vendorName,
      warehouseName: grn.warehouseName,
      totalReceivedAmount: grn.totalReceivedAmount,
      totalAcceptedAmount: grn.totalAcceptedAmount,
      isPostedToInventory: grn.isPostedToInventory,
      createdAt: grn.createdAt,
    };
  }
}
