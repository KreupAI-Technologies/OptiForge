import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vendor } from '../entities/vendor.entity';
import { PurchaseOrder } from '../entities/purchase-order.entity';
import { SupplierPortalMessage } from '../entities/supplier-portal-message.entity';
import { SupplierPortalDocument } from '../entities/supplier-portal-document.entity';

const DEFAULT_COMPANY = 'company-001';

// Supplier Portal domain service.
//  - suppliers[] is derived from the real Vendor table (+ live PO aggregates).
//  - messages/documents are backed by dedicated additive tables.
@Injectable()
export class SupplierPortalService {
  constructor(
    @InjectRepository(Vendor)
    private readonly vendorRepo: Repository<Vendor>,
    @InjectRepository(PurchaseOrder)
    private readonly poRepo: Repository<PurchaseOrder>,
    @InjectRepository(SupplierPortalMessage)
    private readonly messageRepo: Repository<SupplierPortalMessage>,
    @InjectRepository(SupplierPortalDocument)
    private readonly documentRepo: Repository<SupplierPortalDocument>,
  ) {}

  private vendorName(v: Vendor): string {
    return v.tradeName || v.legalName || v.vendorCode || 'Unknown Vendor';
  }

  private vendorCategory(v: Vendor): string {
    const cats = v.categories;
    if (Array.isArray(cats) && cats.length) {
      const first = cats[0];
      return typeof first === 'string' ? first : first?.name || 'General';
    }
    return 'General';
  }

  private firstContact(v: Vendor): {
    name: string;
    email: string;
    phone: string;
  } {
    const cp = v.contactPersons;
    if (Array.isArray(cp) && cp.length) {
      const c = cp[0] || {};
      return {
        name: c.name || c.contactName || '',
        email: c.email || '',
        phone: c.phone || c.mobile || '',
      };
    }
    return { name: '', email: '', phone: '' };
  }

  // ---- suppliers derived from real vendor rows + live PO aggregates ----
  async getSuppliers() {
    const vendors = await this.vendorRepo.find({ order: { legalName: 'ASC' } });

    // Live active-order + spend aggregates per vendor from real PO rows.
    const openStatuses = [
      'draft',
      'submitted',
      'approved',
      'in progress',
      'partially received',
    ];
    const rows = await this.poRepo
      .createQueryBuilder('po')
      .select('po.vendorId', 'vendorId')
      .addSelect('COUNT(po.id)', 'orders')
      .addSelect('COALESCE(SUM(po.totalAmount), 0)', 'spend')
      .addSelect(
        `SUM(CASE WHEN LOWER(po.status) IN (:...openStatuses) THEN 1 ELSE 0 END)`,
        'activeOrders',
      )
      .setParameter('openStatuses', openStatuses)
      .groupBy('po.vendorId')
      .getRawMany();
    const byVendor = new Map(
      rows.map((r) => [
        String(r.vendorId),
        {
          orders: Number(r.orders) || 0,
          spend: Number(r.spend) || 0,
          activeOrders: Number(r.activeOrders) || 0,
        },
      ]),
    );

    const statusMap: Record<string, string> = {
      active: 'active',
      inactive: 'inactive',
      blacklisted: 'suspended',
      on_hold: 'pending',
    };

    return vendors.map((v) => {
      const agg = byVendor.get(v.id);
      return {
        id: v.id,
        name: this.vendorName(v),
        code: v.vendorCode || '',
        status: statusMap[String(v.status).toLowerCase()] || 'inactive',
        category: this.vendorCategory(v),
        rating: Number(v.rating) || 0,
        totalSpend: agg?.spend ?? Number(v.totalSpendYTD) ?? 0,
        activeOrders: agg?.activeOrders ?? 0,
        // On-time delivery / quality score aren't stored on the vendor row;
        // returned as 0 (not fabricated). Sourced from evaluations elsewhere.
        onTimeDelivery: 0,
        qualityScore: 0,
        paymentTerms: this.paymentTerms(v),
        contact: this.firstContact(v),
        lastActivity: v.lastOrderDate
          ? new Date(v.lastOrderDate).toISOString().slice(0, 10)
          : '',
      };
    });
  }

  private paymentTerms(v: Vendor): string {
    const pt = v.paymentTerms;
    if (pt && typeof pt === 'object') {
      return pt.terms || pt.description || pt.name || '';
    }
    return typeof pt === 'string' ? pt : '';
  }

  // ---- messages (real additive table) ----
  async getMessages(companyId: string, supplierId?: string) {
    const where: Record<string, any> = { companyId: companyId || DEFAULT_COMPANY };
    if (supplierId) where.supplierId = supplierId;
    return this.messageRepo.find({ where, order: { createdAt: 'DESC' } });
  }

  async createMessage(
    companyId: string,
    data: Partial<SupplierPortalMessage>,
  ) {
    const entity = this.messageRepo.create({
      companyId: companyId || DEFAULT_COMPANY,
      supplierId: data.supplierId ?? '',
      supplierName: data.supplierName ?? '',
      type: data.type ?? 'general',
      subject: data.subject ?? '',
      message: data.message ?? '',
      status: data.status ?? 'unread',
      priority: data.priority ?? 'medium',
      attachments: data.attachments ?? 0,
    });
    return this.messageRepo.save(entity);
  }

  // ---- documents (real additive table) ----
  async getDocuments(companyId: string, supplierId?: string) {
    const where: Record<string, any> = { companyId: companyId || DEFAULT_COMPANY };
    if (supplierId) where.supplierId = supplierId;
    return this.documentRepo.find({ where, order: { createdAt: 'DESC' } });
  }

  async createDocument(
    companyId: string,
    data: Partial<SupplierPortalDocument>,
  ) {
    const entity = this.documentRepo.create({
      companyId: companyId || DEFAULT_COMPANY,
      supplierId: data.supplierId ?? '',
      supplierName: data.supplierName ?? '',
      documentType: data.documentType ?? '',
      fileName: data.fileName ?? '',
      fileUrl: data.fileUrl ?? undefined,
      size: data.size ?? undefined,
      expiryDate: data.expiryDate ?? undefined,
      status: data.status ?? 'valid',
    });
    return this.documentRepo.save(entity);
  }
}
