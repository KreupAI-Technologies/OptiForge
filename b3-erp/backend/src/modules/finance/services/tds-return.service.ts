import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TdsReturn, TdsChallan } from '../entities/statutory-return.entity';
import {
  ReportDefinition,
  ReportFormat,
  renderReport,
} from '../../../common/utils/report-render.util';

export interface FileTdsReturnDto {
  formType: '24Q' | '26Q' | '27Q' | '27EQ' | string;
  quarter: string;
  dueDate?: string;
  totalDeductions?: number;
  totalDeposited?: number;
  deducteeCount?: number;
  rows?: any[];
  notes?: string;
  createdBy?: string;
}

export interface CreateTdsChallanDto {
  challanNumber?: string;
  challanDate?: string;
  amount: number;
  section: string;
  bankName?: string;
  bsrCode?: string;
  quarter?: string;
  status?: string;
  notes?: string;
  createdBy?: string;
}

export interface Form16aDto {
  // Deductor
  deductorName?: string;
  deductorTAN?: string;
  // Deductee
  deducteeName: string;
  deducteePAN: string;
  section?: string;
  // Payment / deduction
  paymentDate?: string;
  grossAmount?: number;
  tdsRate?: number;
  tdsAmount?: number;
  // Challan
  challanNumber?: string;
  challanDate?: string;
  bsrCode?: string;
  quarter?: string;
}

@Injectable()
export class TdsReturnService {
  constructor(
    @InjectRepository(TdsReturn)
    private readonly returnRepo: Repository<TdsReturn>,
    @InjectRepository(TdsChallan)
    private readonly challanRepo: Repository<TdsChallan>,
  ) {}

  // ------------------------------------------------------------------ returns
  async findReturns(filters?: {
    formType?: string;
    quarter?: string;
    status?: string;
  }): Promise<TdsReturn[]> {
    const qb = this.returnRepo.createQueryBuilder('r');
    if (filters?.formType) {
      qb.andWhere('r.formType = :formType', { formType: filters.formType });
    }
    if (filters?.quarter) {
      qb.andWhere('r.quarter = :quarter', { quarter: filters.quarter });
    }
    if (filters?.status) {
      qb.andWhere('r.status = :status', { status: filters.status });
    }
    qb.orderBy('r.createdAt', 'DESC');
    return qb.getMany();
  }

  async findReturn(id: string): Promise<TdsReturn> {
    const rec = await this.returnRepo.findOne({ where: { id } });
    if (!rec) throw new NotFoundException(`TDS return ${id} not found`);
    return rec;
  }

  async fileReturn(dto: FileTdsReturnDto): Promise<TdsReturn> {
    if (!dto.formType || !dto.quarter) {
      throw new BadRequestException('formType and quarter are required');
    }
    const rec = this.returnRepo.create({
      formType: dto.formType,
      quarter: dto.quarter,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      status: 'Filed',
      filedDate: new Date(),
      acknowledgementNumber: this.generateAckNo(),
      totalDeductions: Number(dto.totalDeductions ?? 0),
      totalDeposited: Number(dto.totalDeposited ?? 0),
      deducteeCount: Number(dto.deducteeCount ?? 0),
      rows: Array.isArray(dto.rows) ? dto.rows : [],
      notes: dto.notes,
      createdBy: dto.createdBy,
    } as Partial<TdsReturn>);
    return this.returnRepo.save(rec);
  }

  async buildReturnDocument(
    id: string,
    format: ReportFormat,
  ): Promise<{ buffer: Buffer; def: ReportDefinition }> {
    const rec = await this.findReturn(id);
    const rows = Array.isArray(rec.rows) ? rec.rows : [];

    const def: ReportDefinition = {
      title: `TDS Return ${rec.formType} — ${rec.quarter}`,
      subtitle: `Status: ${rec.status}${rec.acknowledgementNumber ? `  ·  Ack: ${rec.acknowledgementNumber}` : ''}`,
      companyLabel: 'ManufacturingOS',
      generatedAt: new Date(),
      columns: [
        { key: 'deductee', header: 'Deductee', width: 2.5 },
        { key: 'pan', header: 'PAN', width: 1.5 },
        { key: 'section', header: 'Section', width: 1 },
        { key: 'grossAmount', header: 'Gross', width: 1.5, numeric: true },
        { key: 'tdsRate', header: 'Rate %', width: 1, numeric: true },
        { key: 'tdsAmount', header: 'TDS', width: 1.5, numeric: true },
        { key: 'challanNumber', header: 'Challan', width: 2 },
      ],
      rows: rows.map((r: any) => ({
        deductee: r.deductee ?? r.partyName ?? '',
        pan: r.pan ?? r.partyPAN ?? '',
        section: r.section ?? r.tdsSection ?? '',
        grossAmount: r.grossAmount ?? 0,
        tdsRate: r.tdsRate ?? 0,
        tdsAmount: r.tdsAmount ?? r.totalTDSAmount ?? 0,
        challanNumber: r.challanNumber ?? '',
      })),
      summary: {
        'Total Deductions': rec.totalDeductions,
        'Total Deposited': rec.totalDeposited,
        Deductees: rec.deducteeCount,
        'Filed Date': rec.filedDate
          ? new Date(rec.filedDate).toISOString().slice(0, 10)
          : '—',
      },
    };
    const buffer = await renderReport(def, format);
    return { buffer, def };
  }

  // ----------------------------------------------------------------- challans
  async findChallans(filters?: {
    section?: string;
    quarter?: string;
    status?: string;
  }): Promise<TdsChallan[]> {
    const qb = this.challanRepo.createQueryBuilder('c');
    if (filters?.section) {
      qb.andWhere('c.section = :section', { section: filters.section });
    }
    if (filters?.quarter) {
      qb.andWhere('c.quarter = :quarter', { quarter: filters.quarter });
    }
    if (filters?.status) {
      qb.andWhere('c.status = :status', { status: filters.status });
    }
    qb.orderBy('c.challanDate', 'DESC');
    return qb.getMany();
  }

  async findChallan(id: string): Promise<TdsChallan> {
    const rec = await this.challanRepo.findOne({ where: { id } });
    if (!rec) throw new NotFoundException(`TDS challan ${id} not found`);
    return rec;
  }

  async createChallan(dto: CreateTdsChallanDto): Promise<TdsChallan> {
    if (!dto.section) {
      throw new BadRequestException('section is required');
    }
    const rec = this.challanRepo.create({
      challanNumber: dto.challanNumber || this.generateChallanNumber(),
      challanDate: dto.challanDate ? new Date(dto.challanDate) : new Date(),
      amount: Number(dto.amount ?? 0),
      section: dto.section,
      bankName: dto.bankName,
      bsrCode: dto.bsrCode,
      quarter: dto.quarter,
      status: dto.status || 'Paid',
      notes: dto.notes,
      createdBy: dto.createdBy,
    });
    return this.challanRepo.save(rec);
  }

  async buildChallanDocument(
    id: string,
    format: ReportFormat,
  ): Promise<{ buffer: Buffer; def: ReportDefinition }> {
    const rec = await this.findChallan(id);
    const def: ReportDefinition = {
      title: `TDS Challan ${rec.challanNumber}`,
      subtitle: `Section ${rec.section}  ·  ${rec.bankName ?? ''}`,
      companyLabel: 'ManufacturingOS',
      generatedAt: new Date(),
      columns: [
        { key: 'field', header: 'Field', width: 2 },
        { key: 'value', header: 'Value', width: 3 },
      ],
      rows: [
        { field: 'Challan Number', value: rec.challanNumber },
        {
          field: 'Challan Date',
          value: rec.challanDate
            ? new Date(rec.challanDate).toISOString().slice(0, 10)
            : '',
        },
        { field: 'Amount', value: rec.amount },
        { field: 'Section', value: rec.section },
        { field: 'Bank', value: rec.bankName ?? '' },
        { field: 'BSR Code', value: rec.bsrCode ?? '' },
        { field: 'Quarter', value: rec.quarter ?? '' },
        { field: 'Status', value: rec.status },
      ],
    };
    const buffer = await renderReport(def, format);
    return { buffer, def };
  }

  // ---------------------------------------------------------------- Form 16A
  /**
   * Generate a Form-16A TDS certificate as a PDF (pdfkit via renderReport).
   * Purely local generation of a certificate document — no TRACES contact.
   */
  async buildForm16a(dto: Form16aDto): Promise<{ buffer: Buffer; fileBase: string }> {
    if (!dto.deducteeName || !dto.deducteePAN) {
      throw new BadRequestException('deducteeName and deducteePAN are required');
    }
    const def: ReportDefinition = {
      title: 'FORM 16A — Certificate of Tax Deducted at Source',
      subtitle: '[Under section 203 of the Income-tax Act, 1961]',
      companyLabel: dto.deductorName || 'ManufacturingOS',
      generatedAt: new Date(),
      columns: [
        { key: 'field', header: 'Particulars', width: 2.5 },
        { key: 'value', header: 'Details', width: 3 },
      ],
      rows: [
        { field: 'Name of Deductor', value: dto.deductorName || 'ManufacturingOS' },
        { field: 'TAN of Deductor', value: dto.deductorTAN || '—' },
        { field: 'Name of Deductee', value: dto.deducteeName },
        { field: 'PAN of Deductee', value: dto.deducteePAN },
        { field: 'Section', value: dto.section || '—' },
        { field: 'Payment Date', value: dto.paymentDate || '—' },
        { field: 'Amount Paid/Credited', value: dto.grossAmount ?? 0 },
        { field: 'TDS Rate (%)', value: dto.tdsRate ?? 0 },
        { field: 'Tax Deducted (TDS)', value: dto.tdsAmount ?? 0 },
        { field: 'Challan Number', value: dto.challanNumber || '—' },
        { field: 'Challan Date', value: dto.challanDate || '—' },
        { field: 'BSR Code', value: dto.bsrCode || '—' },
        { field: 'Quarter', value: dto.quarter || '—' },
      ],
      summary: {
        Note: 'This is a system-generated Form-16A certificate.',
      },
    };
    const buffer = await renderReport(def, 'pdf');
    const fileBase = `Form16A_${dto.deducteePAN}_${(dto.quarter || 'Q').replace(/[^A-Z0-9-]/gi, '')}`;
    return { buffer, fileBase };
  }

  private generateAckNo(): string {
    const yr = new Date().getFullYear();
    const rand = Math.floor(Math.random() * 1e8)
      .toString()
      .padStart(8, '0');
    return `ACK${yr}${rand}`;
  }

  private generateChallanNumber(): string {
    const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.floor(Math.random() * 1e5)
      .toString()
      .padStart(5, '0');
    return `CH${stamp}${rand}`;
  }
}
