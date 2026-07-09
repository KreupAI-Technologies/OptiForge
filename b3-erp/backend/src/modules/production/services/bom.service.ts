import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BOM, BOMStatus, BOMType } from '../entities/bom.entity';
import { BOMItem, BOMItemType, SupplyType } from '../entities/bom-item.entity';
import { QualityPlan } from '../entities/quality-plan.entity';
import { WorkOrder } from '../entities/work-order.entity';
import { Item } from '../../core/entities/item.entity';
import { CreateBOMDto, UpdateBOMDto, BOMResponseDto } from '../dto';

@Injectable()
export class BOMService {
  constructor(
    @InjectRepository(BOM)
    private readonly bomRepository: Repository<BOM>,
    @InjectRepository(BOMItem)
    private readonly bomItemRepository: Repository<BOMItem>,
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
    @InjectRepository(QualityPlan)
    private readonly qualityPlanRepository: Repository<QualityPlan>,
    @InjectRepository(WorkOrder)
    private readonly workOrderRepository: Repository<WorkOrder>,
  ) {}

  async create(createDto: CreateBOMDto): Promise<BOMResponseDto> {
    // Check if BOM code already exists
    const existing = await this.bomRepository.findOne({
      where: { bomCode: createDto.bomCode },
    });

    if (existing) {
      throw new BadRequestException(
        `BOM code ${createDto.bomCode} already exists`,
      );
    }

    const bom = this.bomRepository.create({
      ...createDto,
      status: BOMStatus.DRAFT,
    });

    const savedBOM = await this.bomRepository.save(bom);
    return this.mapToResponseDto(savedBOM);
  }

  async findAll(filters?: {
    itemId?: string;
    status?: BOMStatus;
    isActive?: boolean;
  }): Promise<BOMResponseDto[]> {
    const query = this.bomRepository.createQueryBuilder('bom');

    if (filters?.itemId) {
      query.andWhere('bom.itemId = :itemId', { itemId: filters.itemId });
    }

    if (filters?.status) {
      query.andWhere('bom.status = :status', { status: filters.status });
    }

    if (filters?.isActive !== undefined) {
      query.andWhere('bom.isActive = :isActive', {
        isActive: filters.isActive,
      });
    }

    query.orderBy('bom.createdAt', 'DESC');

    const boms = await query.getMany();
    return boms.map((bom) => this.mapToResponseDto(bom));
  }

  async findOne(id: string): Promise<BOMResponseDto> {
    const bom = await this.bomRepository.findOne({
      where: { id },
      relations: ['items'],
    });

    if (!bom) {
      throw new NotFoundException(`BOM with ID ${id} not found`);
    }

    return this.mapToResponseDto(bom);
  }

  async update(id: string, updateDto: UpdateBOMDto): Promise<BOMResponseDto> {
    const bom = await this.bomRepository.findOne({ where: { id } });

    if (!bom) {
      throw new NotFoundException(`BOM with ID ${id} not found`);
    }

    // Check if BOM is in editable status
    if (bom.status === BOMStatus.ACTIVE && updateDto.status !== BOMStatus.INACTIVE) {
      throw new BadRequestException(
        'Cannot modify active BOM. Please create a new version.',
      );
    }

    // If changing BOM code, check uniqueness
    if (updateDto.bomCode && updateDto.bomCode !== bom.bomCode) {
      const existing = await this.bomRepository.findOne({
        where: { bomCode: updateDto.bomCode },
      });

      if (existing) {
        throw new BadRequestException(
          `BOM code ${updateDto.bomCode} already exists`,
        );
      }
    }

    Object.assign(bom, updateDto);
    const updatedBOM = await this.bomRepository.save(bom);
    return this.mapToResponseDto(updatedBOM);
  }

  async remove(id: string): Promise<void> {
    const bom = await this.bomRepository.findOne({ where: { id } });

    if (!bom) {
      throw new NotFoundException(`BOM with ID ${id} not found`);
    }

    if (bom.status === BOMStatus.ACTIVE) {
      throw new BadRequestException('Cannot delete active BOM');
    }

    await this.bomRepository.remove(bom);
  }

  // Special operations
  async submit(id: string, submittedBy: string): Promise<BOMResponseDto> {
    const bom = await this.bomRepository.findOne({ where: { id } });

    if (!bom) {
      throw new NotFoundException(`BOM with ID ${id} not found`);
    }

    if (bom.status !== BOMStatus.DRAFT) {
      throw new BadRequestException('Only draft BOMs can be submitted');
    }

    bom.status = BOMStatus.SUBMITTED;
    bom.submittedBy = submittedBy;
    bom.submittedAt = new Date();

    const updatedBOM = await this.bomRepository.save(bom);
    return this.mapToResponseDto(updatedBOM);
  }

  async approve(
    id: string,
    approvedBy: string,
    comments?: string,
  ): Promise<BOMResponseDto> {
    const bom = await this.bomRepository.findOne({ where: { id } });

    if (!bom) {
      throw new NotFoundException(`BOM with ID ${id} not found`);
    }

    if (bom.status !== BOMStatus.SUBMITTED) {
      throw new BadRequestException('Only submitted BOMs can be approved');
    }

    bom.status = BOMStatus.ACTIVE;
    bom.approvedBy = approvedBy;
    bom.approvedAt = new Date();
    bom.approvalComments = comments ?? '';

    const updatedBOM = await this.bomRepository.save(bom);
    return this.mapToResponseDto(updatedBOM);
  }

  async explodeBOM(id: string): Promise<any> {
    const bom = await this.bomRepository.findOne({
      where: { id },
      relations: ['items'],
    });

    if (!bom) {
      throw new NotFoundException(`BOM with ID ${id} not found`);
    }

    // Build multi-level BOM explosion
    const explodedItems = [];

    for (const item of bom.items || []) {
      explodedItems.push({
        level: item.level,
        itemId: item.itemId,
        itemCode: item.itemCode,
        itemName: item.itemName,
        quantity: item.quantity,
        netQuantity: item.netQuantity,
        uom: item.uom,
        unitCost: item.unitCost,
        totalCost: item.totalCost,
      });

      // If item has its own BOM, recursively explode it
      if (item.itemType === 'Sub-Assembly') {
        const subBOM = await this.bomRepository.findOne({
          where: { itemId: item.itemId, isDefault: true, isActive: true },
          relations: ['items'],
        });

        if (subBOM) {
          for (const subItem of subBOM.items || []) {
            explodedItems.push({
              level: item.level + 1,
              itemId: subItem.itemId,
              itemCode: subItem.itemCode,
              itemName: subItem.itemName,
              quantity: subItem.quantity * item.quantity,
              netQuantity: subItem.netQuantity * item.quantity,
              uom: subItem.uom,
              unitCost: subItem.unitCost,
              totalCost: subItem.totalCost * item.quantity,
            });
          }
        }
      }
    }

    return {
      bomId: bom.id,
      bomCode: bom.bomCode,
      itemCode: bom.itemCode,
      itemName: bom.itemName,
      quantity: bom.quantity,
      explodedItems,
      totalComponents: explodedItems.length,
    };
  }

  async costRollup(id: string): Promise<BOMResponseDto> {
    const bom = await this.bomRepository.findOne({
      where: { id },
      relations: ['items'],
    });

    if (!bom) {
      throw new NotFoundException(`BOM with ID ${id} not found`);
    }

    // Calculate material cost from items
    let materialCost = 0;
    for (const item of bom.items || []) {
      materialCost += item.totalCost;
    }

    bom.materialCost = materialCost;
    bom.totalCost = bom.materialCost + bom.operationCost + bom.overheadCost;
    bom.costPerUnit = bom.quantity > 0 ? bom.totalCost / bom.quantity : 0;
    bom.lastCostRollupDate = new Date();

    const updatedBOM = await this.bomRepository.save(bom);
    return this.mapToResponseDto(updatedBOM);
  }

  async whereUsed(itemId: string): Promise<any[]> {
    // Find all BOMs that use this item
    const bomItems = await this.bomItemRepository.find({
      where: { itemId },
      relations: ['bom'],
    });

    return bomItems.map((bomItem) => ({
      bomId: bomItem.bom.id,
      bomCode: bomItem.bom.bomCode,
      bomName: bomItem.bom.bomName,
      itemCode: bomItem.bom.itemCode,
      itemName: bomItem.bom.itemName,
      quantity: bomItem.quantity,
      status: bomItem.bom.status,
      isActive: bomItem.bom.isActive,
    }));
  }

  /**
   * Resolve a BOM by either its UUID id or its human bomCode, then run the
   * multi-level explosion. Backs GET production/bom/:ref/explosion.
   * `quantity` optionally scales all component quantities to a build size.
   */
  async explodeByRef(ref: string, quantity?: number): Promise<any> {
    const bom = await this.findBomByRef(ref);
    const exploded = await this.explodeBOM(bom.id);

    if (quantity && quantity > 0 && bom.quantity > 0) {
      const factor = quantity / Number(bom.quantity);
      exploded.explodedItems = exploded.explodedItems.map((it: any) => ({
        ...it,
        extendedQuantity: Number(it.quantity) * factor,
        extendedNetQuantity: Number(it.netQuantity) * factor,
        extendedCost: Number(it.totalCost) * factor,
      }));
      exploded.buildQuantity = quantity;
    }

    return exploded;
  }

  private async findBomByRef(ref: string): Promise<BOM> {
    const uuidRe =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    let bom: BOM | null = null;
    if (uuidRe.test(ref)) {
      bom = await this.bomRepository.findOne({ where: { id: ref } });
    }
    if (!bom) {
      bom = await this.bomRepository.findOne({ where: { bomCode: ref } });
    }
    if (!bom) {
      throw new NotFoundException(`BOM ${ref} not found`);
    }
    return bom;
  }

  /**
   * Resolve a list of item codes to their master item ids/names. Backs the
   * PR-create flow on the work-order/add page, which collects itemCode but
   * needs the itemId the procurement DTO requires.
   */
  async resolveItems(codes: string[]): Promise<
    {
      itemCode: string;
      resolved: boolean;
      itemId: string | null;
      itemName: string | null;
      uom: string | null;
      standardCost: number | null;
    }[]
  > {
    const unique = Array.from(
      new Set((codes || []).map((c) => (c || '').trim()).filter(Boolean)),
    );
    if (unique.length === 0) return [];

    const items = await this.itemRepository
      .createQueryBuilder('i')
      .where('i.itemCode IN (:...codes)', { codes: unique })
      .getMany();

    const byCode = new Map(items.map((i) => [i.itemCode, i]));
    return unique.map((code) => {
      const item = byCode.get(code);
      return {
        itemCode: code,
        resolved: !!item,
        itemId: item?.id ?? null,
        itemName: item?.itemName ?? null,
        uom: (item as any)?.baseUom ?? null,
        standardCost: (item as any)?.standardCost ?? null,
      };
    });
  }

  /**
   * Create a BOM from a JSON array of parsed component rows (NOT a file
   * upload). Backs the import / assembly-template flows on /production/bom/add.
   */
  async importBOM(payload: {
    bomCode: string;
    bomName: string;
    itemId?: string;
    itemCode: string;
    itemName: string;
    bomType?: string;
    uom?: string;
    quantity?: number;
    description?: string;
    createdBy?: string;
    components: {
      itemId?: string;
      itemCode: string;
      itemName: string;
      description?: string;
      quantity: number;
      uom?: string;
      itemType?: string;
      supplyType?: string;
      scrapPercentage?: number;
      unitCost?: number;
      level?: number;
      sequenceNumber?: number;
      makeOrBuy?: string;
    }[];
  }): Promise<BOMResponseDto> {
    if (!payload.components || payload.components.length === 0) {
      throw new BadRequestException('At least one component is required for import');
    }

    const existing = await this.bomRepository.findOne({
      where: { bomCode: payload.bomCode },
    });
    if (existing) {
      throw new BadRequestException(`BOM code ${payload.bomCode} already exists`);
    }

    // Resolve missing item ids for header + components from the item master.
    const codesToResolve = [
      ...(payload.itemId ? [] : [payload.itemCode]),
      ...payload.components.filter((c) => !c.itemId).map((c) => c.itemCode),
    ];
    const resolved = await this.resolveItems(codesToResolve);
    const resolvedByCode = new Map(resolved.map((r) => [r.itemCode, r]));

    let materialCost = 0;
    const items = payload.components.map((c, index) => {
      const scrap = c.scrapPercentage ?? 0;
      const qty = Number(c.quantity) || 0;
      const netQuantity = qty * (1 + scrap / 100);
      const unitCost = c.unitCost ?? 0;
      const totalCost = netQuantity * unitCost;
      materialCost += totalCost;

      const supply =
        c.supplyType ||
        (c.makeOrBuy === 'make' ? SupplyType.MANUFACTURE : SupplyType.PURCHASE);

      return this.bomItemRepository.create({
        itemId: c.itemId || resolvedByCode.get(c.itemCode)?.itemId || c.itemCode,
        itemCode: c.itemCode,
        itemName: c.itemName,
        description: c.description ?? undefined,
        itemType: (c.itemType as BOMItemType) ?? BOMItemType.COMPONENT,
        supplyType: supply as SupplyType,
        sequenceNumber: c.sequenceNumber ?? index + 1,
        level: c.level ?? 1,
        quantity: qty,
        uom: c.uom ?? 'PCS',
        scrapPercentage: scrap,
        netQuantity,
        unitCost,
        totalCost,
        createdBy: payload.createdBy ?? undefined,
      }) as BOMItem;
    });

    const headerItemId =
      payload.itemId || resolvedByCode.get(payload.itemCode)?.itemId || payload.itemCode;

    const bom = this.bomRepository.create({
      bomCode: payload.bomCode,
      bomName: payload.bomName,
      description: payload.description ?? undefined,
      itemId: headerItemId,
      itemCode: payload.itemCode,
      itemName: payload.itemName,
      bomType: (payload.bomType as BOMType) ?? BOMType.MANUFACTURE,
      status: BOMStatus.DRAFT,
      uom: payload.uom ?? 'PCS',
      quantity: payload.quantity ?? 1,
      materialCost,
      totalCost: materialCost,
      costPerUnit: (payload.quantity ?? 1) > 0 ? materialCost / (payload.quantity ?? 1) : materialCost,
      createdBy: payload.createdBy ?? undefined,
      items,
    }) as BOM;

    const saved = await this.bomRepository.save(bom);
    const full = await this.bomRepository.findOne({
      where: { id: saved.id },
      relations: ['items'],
    });
    return this.mapToResponseDto(full ?? saved);
  }

  /**
   * Quality specifications (test parameters / acceptance criteria) for a
   * product or a work order. Backs GET production/quality-specs used by the
   * /production/quality/add "Load specs from product master" action.
   *
   * Resolution order:
   *  1. If workOrderId is supplied, resolve its itemCode.
   *  2. Look up an active QualityPlan for the product code and surface its
   *     inspection points / acceptance criteria as test parameters.
   */
  async getQualitySpecs(params: {
    productCode?: string;
    workOrderId?: string;
  }): Promise<{
    productCode: string | null;
    productName: string | null;
    workOrderId: string | null;
    workOrderNumber: string | null;
    planNumber: string | null;
    planName: string | null;
    qualityStandard: string | null;
    samplingSize: number | null;
    testingFrequency: string | null;
    parameters: {
      parameterName: string;
      type: string;
      specification: string;
      nominalValue: number | null;
      upperTolerance: number | null;
      lowerTolerance: number | null;
      unit: string | null;
      testMethod: string | null;
      acceptanceCriteria: string | null;
    }[];
  }> {
    let productCode = params.productCode ?? null;
    let productName: string | null = null;
    let workOrderNumber: string | null = null;

    if (params.workOrderId) {
      const wo = await this.workOrderRepository.findOne({
        where: { id: params.workOrderId },
      });
      if (wo) {
        productCode = productCode || wo.itemCode;
        productName = wo.itemName;
        workOrderNumber = wo.workOrderNumber;
      }
    }

    if (!productCode) {
      throw new BadRequestException(
        'A productCode or a workOrderId (resolving to a product) is required',
      );
    }

    const plan = await this.qualityPlanRepository
      .createQueryBuilder('q')
      .where('q.product_code = :code', { code: productCode })
      .orderBy('q.updated_at', 'DESC')
      .getOne();

    const parameters = this.mapInspectionPoints(plan?.inspectionPoints ?? null);

    return {
      productCode,
      productName: productName ?? plan?.productName ?? null,
      workOrderId: params.workOrderId ?? null,
      workOrderNumber,
      planNumber: plan?.planNumber ?? null,
      planName: plan?.planName ?? null,
      qualityStandard: plan?.qualityStandard ?? null,
      samplingSize: plan?.samplingSize ?? null,
      testingFrequency: plan?.testingFrequency ?? null,
      parameters,
    };
  }

  private mapInspectionPoints(points: any[] | null): {
    parameterName: string;
    type: string;
    specification: string;
    nominalValue: number | null;
    upperTolerance: number | null;
    lowerTolerance: number | null;
    unit: string | null;
    testMethod: string | null;
    acceptanceCriteria: string | null;
  }[] {
    if (!Array.isArray(points)) return [];
    return points.map((p: any) => ({
      parameterName: p?.parameterName ?? p?.name ?? p?.parameter ?? '',
      type: p?.type ?? p?.parameterType ?? 'Dimensional',
      specification: p?.specification ?? p?.spec ?? '',
      nominalValue: p?.nominalValue ?? p?.nominal ?? null,
      upperTolerance: p?.upperTolerance ?? p?.upperTol ?? null,
      lowerTolerance: p?.lowerTolerance ?? p?.lowerTol ?? null,
      unit: p?.unit ?? null,
      testMethod: p?.testMethod ?? p?.method ?? null,
      acceptanceCriteria: p?.acceptanceCriteria ?? p?.criteria ?? null,
    }));
  }

  private mapToResponseDto(bom: BOM): BOMResponseDto {
    return {
      id: bom.id,
      bomCode: bom.bomCode,
      bomName: bom.bomName,
      description: bom.description,
      itemId: bom.itemId,
      itemCode: bom.itemCode,
      itemName: bom.itemName,
      bomType: bom.bomType,
      status: bom.status,
      version: bom.version,
      isActive: bom.isActive,
      isDefault: bom.isDefault,
      effectiveFrom: bom.effectiveFrom,
      effectiveTo: bom.effectiveTo,
      quantity: bom.quantity,
      uom: bom.uom,
      materialCost: bom.materialCost,
      operationCost: bom.operationCost,
      overheadCost: bom.overheadCost,
      totalCost: bom.totalCost,
      costPerUnit: bom.costPerUnit,
      lastCostRollupDate: bom.lastCostRollupDate,
      leadTimeDays: bom.leadTimeDays,
      scrapPercentage: bom.scrapPercentage,
      batchSize: bom.batchSize,
      allowAlternativeItems: bom.allowAlternativeItems,
      requiresQualityInspection: bom.requiresQualityInspection,
      defaultRoutingId: bom.defaultRoutingId,
      defaultRoutingCode: bom.defaultRoutingCode,
      drawingNumber: bom.drawingNumber,
      revision: bom.revision,
      submittedBy: bom.submittedBy,
      submittedAt: bom.submittedAt,
      approvedBy: bom.approvedBy,
      approvedAt: bom.approvedAt,
      notes: bom.notes,
      customFields: bom.customFields,
      createdBy: bom.createdBy,
      updatedBy: bom.updatedBy,
      createdAt: bom.createdAt,
      updatedAt: bom.updatedAt,
    };
  }
}
