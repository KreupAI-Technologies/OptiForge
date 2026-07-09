import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Quote,
  QuoteItem,
  QuoteStatus,
  QuoteTemplate,
  QuoteVersion,
} from '../entities/quote.entity';

@Injectable()
export class QuoteService {
  constructor(
    @InjectRepository(Quote)
    private quoteRepository: Repository<Quote>,
    @InjectRepository(QuoteItem)
    private quoteItemRepository: Repository<QuoteItem>,
    @InjectRepository(QuoteTemplate)
    private templateRepository: Repository<QuoteTemplate>,
    @InjectRepository(QuoteVersion)
    private versionRepository: Repository<QuoteVersion>,
  ) {}

  // Quotes
  async create(
    companyId: string,
    data: Partial<Quote>,
    items?: Partial<QuoteItem>[],
  ): Promise<Quote> {
    const quoteNumber = await this.generateQuoteNumber(companyId);

    const quote = this.quoteRepository.create({
      ...data,
      companyId,
      quoteNumber,
      quoteDate: data.quoteDate || new Date(),
    });

    const savedQuote = await this.quoteRepository.save(quote);

    if (items && items.length > 0) {
      const quoteItems = items.map((item, index) =>
        this.quoteItemRepository.create({
          ...item,
          quoteId: savedQuote.id,
          lineNumber: index + 1,
        }),
      );
      await this.quoteItemRepository.save(quoteItems);
      await this.recalculateTotals(savedQuote.id);
    }

    return this.findOne(companyId, savedQuote.id);
  }

  async findAll(
    companyId: string,
    filters?: {
      status?: QuoteStatus;
      customerId?: string;
      fromDate?: string;
      toDate?: string;
      assignedTo?: string;
    },
  ): Promise<Quote[]> {
    const query = this.quoteRepository
      .createQueryBuilder('quote')
      .where('quote.companyId = :companyId', { companyId })
      .orderBy('quote.createdAt', 'DESC');

    if (filters?.status) {
      query.andWhere('quote.status = :status', { status: filters.status });
    }
    if (filters?.customerId) {
      query.andWhere('quote.customerId = :customerId', {
        customerId: filters.customerId,
      });
    }
    if (filters?.fromDate) {
      query.andWhere('quote.quoteDate >= :fromDate', { fromDate: filters.fromDate });
    }
    if (filters?.toDate) {
      query.andWhere('quote.quoteDate <= :toDate', { toDate: filters.toDate });
    }
    if (filters?.assignedTo) {
      query.andWhere('quote.assignedTo = :assignedTo', {
        assignedTo: filters.assignedTo,
      });
    }

    return query.getMany();
  }

  async findOne(companyId: string, id: string): Promise<Quote> {
    const quote = await this.quoteRepository.findOne({
      where: { id, companyId },
    });
    if (!quote) {
      throw new NotFoundException(`Quote with ID ${id} not found`);
    }
    return quote;
  }

  async findItems(quoteId: string): Promise<QuoteItem[]> {
    return this.quoteItemRepository.find({
      where: { quoteId },
      order: { lineNumber: 'ASC' },
    });
  }

  async update(
    companyId: string,
    id: string,
    data: Partial<Quote>,
  ): Promise<Quote> {
    const quote = await this.findOne(companyId, id);
    Object.assign(quote, data);
    await this.quoteRepository.save(quote);
    return this.findOne(companyId, id);
  }

  async updateItems(
    quoteId: string,
    items: Partial<QuoteItem>[],
  ): Promise<QuoteItem[]> {
    await this.quoteItemRepository.delete({ quoteId });

    const newItems = items.map((item, index) =>
      this.quoteItemRepository.create({
        ...item,
        quoteId,
        lineNumber: index + 1,
      }),
    );

    const savedItems = await this.quoteItemRepository.save(newItems);
    await this.recalculateTotals(quoteId);
    return savedItems;
  }

  async delete(companyId: string, id: string): Promise<void> {
    const quote = await this.findOne(companyId, id);
    await this.quoteRepository.remove(quote);
  }

  // Status Workflow
  async submitForApproval(
    companyId: string,
    id: string,
  ): Promise<Quote> {
    const quote = await this.findOne(companyId, id);
    quote.status = QuoteStatus.PENDING_APPROVAL;
    return this.quoteRepository.save(quote);
  }

  async approve(
    companyId: string,
    id: string,
    approvedBy: string,
    notes?: string,
  ): Promise<Quote> {
    const quote = await this.findOne(companyId, id);
    quote.status = QuoteStatus.APPROVED;
    quote.approvedBy = approvedBy;
    quote.approvedAt = new Date();
    if (notes !== undefined) quote.approvalNotes = notes;
    return this.quoteRepository.save(quote);
  }

  async reject(
    companyId: string,
    id: string,
    notes?: string,
  ): Promise<Quote> {
    const quote = await this.findOne(companyId, id);
    quote.status = QuoteStatus.REJECTED;
    if (notes !== undefined) quote.approvalNotes = notes;
    return this.quoteRepository.save(quote);
  }

  async sendToCustomer(
    companyId: string,
    id: string,
    sentBy: string,
  ): Promise<Quote> {
    const quote = await this.findOne(companyId, id);
    quote.status = QuoteStatus.SENT;
    quote.sentAt = new Date();
    quote.sentBy = sentBy;
    return this.quoteRepository.save(quote);
  }

  async recordCustomerResponse(
    companyId: string,
    id: string,
    accepted: boolean,
    feedback?: string,
  ): Promise<Quote> {
    const quote = await this.findOne(companyId, id);
    quote.status = accepted ? QuoteStatus.ACCEPTED : QuoteStatus.DECLINED;
    quote.customerResponseAt = new Date();
    if (feedback !== undefined) quote.customerFeedback = feedback;
    return this.quoteRepository.save(quote);
  }

  async convertToOrder(
    companyId: string,
    id: string,
    orderId: string,
  ): Promise<Quote> {
    const quote = await this.findOne(companyId, id);
    quote.status = QuoteStatus.CONVERTED;
    quote.convertedOrderId = orderId;
    quote.convertedAt = new Date();
    return this.quoteRepository.save(quote);
  }

  // Versioning
  async createVersion(
    companyId: string,
    id: string,
    createdBy: string,
    changeDescription?: string,
  ): Promise<Quote> {
    const original = await this.findOne(companyId, id);
    const items = await this.findItems(id);

    // Save version snapshot
    const version = this.versionRepository.create({
      companyId,
      quoteId: id,
      versionNumber: original.version,
      changeDescription,
      snapshot: { ...original } as Record<string, unknown>,
      itemsSnapshot: items.map((item) => ({ ...item })) as Record<string, unknown>[],
      previousTotal: original.totalAmount,
      createdBy,
    });
    await this.versionRepository.save(version);

    // Create new version
    const { id: _, quoteNumber, version: v, ...quoteData } = original;
    const newQuote = await this.create(
      companyId,
      {
        ...quoteData,
        version: v + 1,
        parentQuoteId: id,
        status: QuoteStatus.DRAFT,
        createdBy,
      },
      items.map(({ id: __, quoteId, ...itemData }) => itemData),
    );

    // Update version with new total
    version.newTotal = newQuote.totalAmount;
    version.changePercentage =
      Number(version.previousTotal) > 0
        ? ((Number(version.newTotal) - Number(version.previousTotal)) /
            Number(version.previousTotal)) *
          100
        : 0;
    await this.versionRepository.save(version);

    return newQuote;
  }

  async findVersions(
    companyId: string,
    quoteId: string,
  ): Promise<QuoteVersion[]> {
    return this.versionRepository.find({
      where: { companyId, quoteId },
      order: { versionNumber: 'DESC' },
    });
  }

  async compareVersions(
    companyId: string,
    versionId1: string,
    versionId2: string,
  ): Promise<{
    version1: QuoteVersion;
    version2: QuoteVersion;
    totalDifference: number;
    percentageChange: number;
    itemChanges: {
      type: 'added' | 'removed' | 'modified';
      item: unknown;
    }[];
  }> {
    const v1 = await this.versionRepository.findOne({
      where: { id: versionId1, companyId },
    });
    const v2 = await this.versionRepository.findOne({
      where: { id: versionId2, companyId },
    });

    if (!v1 || !v2) {
      throw new NotFoundException('Version not found');
    }

    const total1 = Number(v1.previousTotal) || 0;
    const total2 = Number(v2.newTotal) || 0;

    return {
      version1: v1,
      version2: v2,
      totalDifference: total2 - total1,
      percentageChange: total1 > 0 ? ((total2 - total1) / total1) * 100 : 0,
      itemChanges: [], // Simplified - would need more complex diff logic
    };
  }

  // Templates
  async createTemplate(
    companyId: string,
    data: Partial<QuoteTemplate>,
  ): Promise<QuoteTemplate> {
    if (data.isDefault) {
      await this.templateRepository.update(
        { companyId, isDefault: true },
        { isDefault: false },
      );
    }
    const template = this.templateRepository.create({
      ...data,
      companyId,
    });
    return this.templateRepository.save(template);
  }

  async findAllTemplates(
    companyId: string,
    filters?: { category?: string; isActive?: boolean },
  ): Promise<QuoteTemplate[]> {
    const query = this.templateRepository
      .createQueryBuilder('template')
      .where('template.companyId = :companyId', { companyId })
      .orderBy('template.isDefault', 'DESC')
      .addOrderBy('template.name', 'ASC');

    if (filters?.category) {
      query.andWhere('template.category = :category', { category: filters.category });
    }
    if (filters?.isActive !== undefined) {
      query.andWhere('template.isActive = :isActive', { isActive: filters.isActive });
    }

    return query.getMany();
  }

  async findTemplateById(companyId: string, id: string): Promise<QuoteTemplate> {
    const template = await this.templateRepository.findOne({
      where: { id, companyId },
    });
    if (!template) {
      throw new NotFoundException(`Template with ID ${id} not found`);
    }
    return template;
  }

  async createFromTemplate(
    companyId: string,
    templateId: string,
    data: Partial<Quote>,
  ): Promise<Quote> {
    const template = await this.findTemplateById(companyId, templateId);

    // Record template usage
    await this.templateRepository.update(
      { id: templateId },
      { usageCount: () => 'usageCount + 1', lastUsedAt: new Date() },
    );

    return this.create(
      companyId,
      {
        ...data,
        paymentTerms: data.paymentTerms || template.defaultPaymentTerms,
        deliveryTerms: data.deliveryTerms || template.defaultDeliveryTerms,
        termsAndConditions:
          data.termsAndConditions || template.defaultTermsAndConditions,
        validityDays: data.validityDays || template.defaultValidityDays,
      },
      template.defaultItems?.map((item) => ({
        productId: item.productId,
        sku: item.sku,
        name: item.name,
        quantity: item.quantity,
        discountPercentage: item.discountPercentage || 0,
      })),
    );
  }

  async updateTemplate(
    companyId: string,
    id: string,
    data: Partial<QuoteTemplate>,
  ): Promise<QuoteTemplate> {
    if (data.isDefault) {
      await this.templateRepository.update(
        { companyId, isDefault: true },
        { isDefault: false },
      );
    }
    const template = await this.findTemplateById(companyId, id);
    Object.assign(template, data);
    return this.templateRepository.save(template);
  }

  async deleteTemplate(companyId: string, id: string): Promise<void> {
    const template = await this.findTemplateById(companyId, id);
    await this.templateRepository.remove(template);
  }

  async toggleTemplateFavorite(
    companyId: string,
    id: string,
  ): Promise<QuoteTemplate> {
    const template = await this.findTemplateById(companyId, id);
    template.isFavorite = !template.isFavorite;
    return this.templateRepository.save(template);
  }

  // Quote Comparison
  async compareQuotes(
    companyId: string,
    quoteIds: string[],
  ): Promise<{
    quotes: Quote[];
    comparison: {
      field: string;
      values: { quoteId: string; value: unknown }[];
    }[];
  }> {
    const quotes = await Promise.all(
      quoteIds.map((id) => this.findOne(companyId, id)),
    );

    const comparisonFields = [
      'totalAmount',
      'discountPercentage',
      'marginPercentage',
      'validityDays',
    ];

    const comparison = comparisonFields.map((field) => ({
      field,
      values: quotes.map((q) => ({
        quoteId: q.id,
        value: (q as unknown as Record<string, unknown>)[field],
      })),
    }));

    return { quotes, comparison };
  }

  // Helpers
  private async recalculateTotals(quoteId: string): Promise<void> {
    const items = await this.quoteItemRepository.find({
      where: { quoteId },
    });

    let subtotal = 0;
    let totalDiscount = 0;
    let marginAmount = 0;

    for (const item of items) {
      const itemSubtotal = Number(item.listPrice) * Number(item.quantity);
      const itemDiscount = itemSubtotal * (Number(item.discountPercentage) / 100);
      subtotal += itemSubtotal;
      totalDiscount += itemDiscount;
      marginAmount += Number(item.marginAmount) || 0;
    }

    const quote = await this.quoteRepository.findOne({ where: { id: quoteId } });
    if (quote) {
      const subtotalAfterDiscount = subtotal - totalDiscount;
      const taxAmount =
        subtotalAfterDiscount * (Number(quote.taxPercentage) / 100);
      const totalAmount =
        subtotalAfterDiscount + taxAmount + Number(quote.shippingAmount || 0);

      await this.quoteRepository.update(quoteId, {
        subtotal,
        totalDiscount,
        taxAmount,
        totalAmount,
        marginAmount,
        marginPercentage:
          subtotal > 0 ? (marginAmount / subtotal) * 100 : 0,
        discountPercentage:
          subtotal > 0 ? (totalDiscount / subtotal) * 100 : 0,
      });
    }
  }

  private async generateQuoteNumber(companyId: string): Promise<string> {
    const count = await this.quoteRepository.count({ where: { companyId } });
    const year = new Date().getFullYear();
    return `QT-${year}-${String(count + 1).padStart(5, '0')}`;
  }
}
