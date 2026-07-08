import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GstReturn } from '../entities/statutory-return.entity';
import {
  ReportDefinition,
  ReportFormat,
  renderReport,
} from '../../../common/utils/report-render.util';

export interface ImportGstr2aDto {
  period: string; // YYYY-MM
  rows: any[]; // parsed GSTR-2A rows (JSON)
  notes?: string;
  createdBy?: string;
}

export interface FileGstReturnDto {
  returnType: 'GSTR-1' | 'GSTR-3B' | string;
  period: string; // YYYY-MM
  dueDate?: string;
  totalSales?: number;
  totalPurchases?: number;
  outputTax?: number;
  inputTax?: number;
  netTax?: number;
  rows?: any[];
  notes?: string;
  createdBy?: string;
}

@Injectable()
export class GstReturnService {
  constructor(
    @InjectRepository(GstReturn)
    private readonly repo: Repository<GstReturn>,
  ) {}

  async findAll(filters?: {
    returnType?: string;
    period?: string;
    status?: string;
  }): Promise<GstReturn[]> {
    const qb = this.repo.createQueryBuilder('r');
    if (filters?.returnType) {
      qb.andWhere('r.returnType = :returnType', {
        returnType: filters.returnType,
      });
    }
    if (filters?.period) {
      qb.andWhere('r.period = :period', { period: filters.period });
    }
    if (filters?.status) {
      qb.andWhere('r.status = :status', { status: filters.status });
    }
    qb.orderBy('r.period', 'DESC').addOrderBy('r.createdAt', 'DESC');
    return qb.getMany();
  }

  async findOne(id: string): Promise<GstReturn> {
    const rec = await this.repo.findOne({ where: { id } });
    if (!rec) throw new NotFoundException(`GST return ${id} not found`);
    return rec;
  }

  /**
   * (a) Record / import a GSTR-2A dataset. Persists the raw rows and derives a
   * simple purchase/input-tax summary from the supplied rows.
   */
  async importGstr2a(dto: ImportGstr2aDto): Promise<GstReturn> {
    if (!dto.period) {
      throw new BadRequestException('period (YYYY-MM) is required');
    }
    const rows = Array.isArray(dto.rows) ? dto.rows : [];

    const num = (v: any): number => {
      const n = Number(v);
      return Number.isFinite(n) ? n : 0;
    };
    const totalPurchases = rows.reduce(
      (s, r) => s + num(r.taxableAmount ?? r.taxableValue ?? r.value),
      0,
    );
    const inputTax = rows.reduce(
      (s, r) =>
        s +
        num(r.cgst ?? r.cgstAmount) +
        num(r.sgst ?? r.sgstAmount) +
        num(r.igst ?? r.igstAmount) +
        num(r.cess ?? r.cessAmount),
      0,
    );

    const rec = this.repo.create({
      returnType: 'GSTR-2A',
      period: dto.period,
      status: 'Imported',
      totalPurchases,
      inputTax,
      rows,
      notes: dto.notes,
      createdBy: dto.createdBy,
    } as Partial<GstReturn>);
    return this.repo.save(rec);
  }

  /**
   * (b) File a return (GSTR-1 / GSTR-3B). Persists a GstReturn record with
   * status Filed + a locally-generated acknowledgement number.
   */
  async fileReturn(dto: FileGstReturnDto): Promise<GstReturn> {
    if (!dto.returnType || !dto.period) {
      throw new BadRequestException('returnType and period are required');
    }
    const output = Number(dto.outputTax ?? 0);
    const input = Number(dto.inputTax ?? 0);
    const netTax =
      dto.netTax !== undefined && dto.netTax !== null
        ? Number(dto.netTax)
        : output - input;

    const rec = this.repo.create({
      returnType: dto.returnType,
      period: dto.period,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      status: 'Filed',
      filedDate: new Date(),
      ackNo: this.generateAckNo(dto.returnType, dto.period),
      totalSales: Number(dto.totalSales ?? 0),
      totalPurchases: Number(dto.totalPurchases ?? 0),
      outputTax: output,
      inputTax: input,
      netTax,
      rows: Array.isArray(dto.rows) ? dto.rows : [],
      notes: dto.notes,
      createdBy: dto.createdBy,
    } as Partial<GstReturn>);
    return this.repo.save(rec);
  }

  /**
   * (c) Build a downloadable document (PDF / Excel) of a return's data.
   */
  async buildDocument(
    id: string,
    format: ReportFormat,
  ): Promise<{ buffer: Buffer; def: ReportDefinition }> {
    const rec = await this.findOne(id);
    const rows = Array.isArray(rec.rows) ? rec.rows : [];

    const def: ReportDefinition = {
      title: `${rec.returnType} — ${rec.period}`,
      subtitle: `Status: ${rec.status}${rec.ackNo ? `  ·  ARN/Ack: ${rec.ackNo}` : ''}`,
      companyLabel: 'ManufacturingOS',
      generatedAt: new Date(),
      columns: [
        { key: 'invoiceNumber', header: 'Invoice No.', width: 2 },
        { key: 'date', header: 'Date', width: 1.5 },
        { key: 'partyName', header: 'Party', width: 2.5 },
        { key: 'gstin', header: 'GSTIN', width: 2 },
        { key: 'taxableAmount', header: 'Taxable', width: 1.5, numeric: true },
        { key: 'cgst', header: 'CGST', width: 1, numeric: true },
        { key: 'sgst', header: 'SGST', width: 1, numeric: true },
        { key: 'igst', header: 'IGST', width: 1, numeric: true },
        { key: 'totalTax', header: 'Total Tax', width: 1.5, numeric: true },
        { key: 'totalAmount', header: 'Total', width: 1.5, numeric: true },
      ],
      rows: rows.map((r: any) => ({
        invoiceNumber: r.invoiceNumber ?? r.invoiceNo ?? '',
        date: r.date ?? r.invoiceDate ?? '',
        partyName: r.partyName ?? r.party ?? '',
        gstin: r.gstin ?? r.partyGSTIN ?? '',
        taxableAmount: r.taxableAmount ?? r.taxableValue ?? 0,
        cgst: r.cgst ?? r.cgstAmount ?? 0,
        sgst: r.sgst ?? r.sgstAmount ?? 0,
        igst: r.igst ?? r.igstAmount ?? 0,
        totalTax: r.totalTax ?? r.totalTaxAmount ?? 0,
        totalAmount: r.totalAmount ?? 0,
      })),
      summary: {
        'Total Sales': rec.totalSales,
        'Total Purchases': rec.totalPurchases,
        'Output Tax': rec.outputTax,
        'Input Tax': rec.inputTax,
        'Net Tax': rec.netTax,
        'Filed Date': rec.filedDate
          ? new Date(rec.filedDate).toISOString().slice(0, 10)
          : '—',
      },
    };

    const buffer = await renderReport(def, format);
    return { buffer, def };
  }

  private generateAckNo(returnType: string, period: string): string {
    const prefix = returnType.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    const stamp = period.replace(/[^0-9]/g, '');
    const rand = Math.floor(Math.random() * 1e9)
      .toString()
      .padStart(9, '0');
    return `${prefix}${stamp}${rand}`;
  }
}
