import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

const DEFAULT_COMPANY = 'default-company-id';

@Injectable()
export class OvertimeSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  // --- Rates ---
  findAllRates(companyId?: string) {
    return this.prisma.hrOvertimeRate.findMany({
      where: { company_id: companyId || DEFAULT_COMPANY },
      orderBy: { grade: 'asc' },
    });
  }

  createRate(data: {
    grade: string;
    designation?: string;
    hourlyRate?: number;
    multiplier?: number;
    effectiveFrom?: string;
    status?: string;
    companyId?: string;
  }) {
    return this.prisma.hrOvertimeRate.create({
      data: {
        company_id: data.companyId || DEFAULT_COMPANY,
        grade: data.grade,
        designation: data.designation,
        hourly_rate: new Prisma.Decimal(data.hourlyRate ?? 0),
        multiplier: new Prisma.Decimal(data.multiplier ?? 1),
        effective_from: data.effectiveFrom ? new Date(data.effectiveFrom) : undefined,
        status: data.status || 'active',
      },
    });
  }

  updateRate(id: string, data: {
    grade?: string;
    designation?: string;
    hourlyRate?: number;
    multiplier?: number;
    effectiveFrom?: string;
    status?: string;
  }) {
    return this.prisma.hrOvertimeRate.update({
      where: { id },
      data: {
        grade: data.grade,
        designation: data.designation,
        hourly_rate: data.hourlyRate != null ? new Prisma.Decimal(data.hourlyRate) : undefined,
        multiplier: data.multiplier != null ? new Prisma.Decimal(data.multiplier) : undefined,
        effective_from: data.effectiveFrom ? new Date(data.effectiveFrom) : undefined,
        status: data.status,
      },
    });
  }

  deleteRate(id: string) {
    return this.prisma.hrOvertimeRate.delete({ where: { id } });
  }

  // --- Settings (rules) ---
  async getSettings(companyId?: string) {
    const cid = companyId || DEFAULT_COMPANY;
    return this.prisma.hrOvertimeSetting.findUnique({ where: { company_id: cid } });
  }

  async upsertSettings(data: {
    otRules?: Prisma.InputJsonValue;
    compOffRules?: Prisma.InputJsonValue;
    companyId?: string;
  }) {
    const cid = data.companyId || DEFAULT_COMPANY;
    return this.prisma.hrOvertimeSetting.upsert({
      where: { company_id: cid },
      create: {
        company_id: cid,
        ot_rules: data.otRules,
        comp_off_rules: data.compOffRules,
      },
      update: {
        ot_rules: data.otRules,
        comp_off_rules: data.compOffRules,
      },
    });
  }
}
