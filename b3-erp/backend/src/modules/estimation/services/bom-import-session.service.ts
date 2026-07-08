import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  BomImportRow,
  EstimationBomImportSession,
} from '../entities/bom-import-session.entity';

export interface BomImportInput {
  fileName?: string;
  estimateId?: string;
  csv?: string;
  rows?: Partial<BomImportRow>[];
}

@Injectable()
export class BomImportSessionService {
  constructor(
    @InjectRepository(EstimationBomImportSession)
    private bomImportRepository: Repository<EstimationBomImportSession>,
  ) {}

  private parseCsv(csv: string): { rows: BomImportRow[]; errors: string[] } {
    const rows: BomImportRow[] = [];
    const errors: string[] = [];
    const lines = csv.split(/\r?\n/);

    lines.forEach((rawLine, index) => {
      const line = rawLine.trim();
      if (!line) {
        return; // tolerate blank lines
      }

      const cells = line.split(',').map((c) => c.trim());
      const [code = '', description = '', quantityRaw = '', unitCostRaw = ''] =
        cells;

      const quantity = Number(quantityRaw);
      const unitCost = Number(unitCostRaw);

      // Skip a header row: first data line whose quantity cell is non-numeric.
      if (index === 0 && (quantityRaw === '' || Number.isNaN(quantity))) {
        return;
      }

      if (Number.isNaN(quantity) || Number.isNaN(unitCost)) {
        errors.push(`Line ${index + 1}: invalid number in "${line}"`);
        return;
      }

      const lineTotal = quantity * unitCost;
      rows.push({ code, description, quantity, unitCost, lineTotal });
    });

    return { rows, errors };
  }

  async create(
    companyId: string,
    input: BomImportInput,
  ): Promise<EstimationBomImportSession> {
    let rows: BomImportRow[] = [];
    let errors: string[] = [];

    if (input.csv && input.csv.trim().length > 0) {
      const parsed = this.parseCsv(input.csv);
      rows = parsed.rows;
      errors = parsed.errors;
    } else if (Array.isArray(input.rows)) {
      rows = input.rows.map((r) => {
        const quantity = Number(r?.quantity) || 0;
        const unitCost = Number(r?.unitCost) || 0;
        return {
          code: r?.code ?? '',
          description: r?.description ?? '',
          quantity,
          unitCost,
          lineTotal:
            r?.lineTotal !== undefined
              ? Number(r.lineTotal)
              : quantity * unitCost,
        };
      });
    }

    const totalValue = rows.reduce((sum, r) => sum + (Number(r.lineTotal) || 0), 0);

    const entity = this.bomImportRepository.create({
      companyId,
      estimateId: input.estimateId,
      fileName: input.fileName ?? 'bom-import.csv',
      status: 'completed',
      rowCount: rows.length,
      rows,
      errors,
      totalValue,
    });
    return this.bomImportRepository.save(entity);
  }

  async findAll(
    companyId: string,
    estimateId?: string,
  ): Promise<EstimationBomImportSession[]> {
    const query = this.bomImportRepository
      .createQueryBuilder('session')
      .where('session.companyId = :companyId', { companyId })
      .orderBy('session.createdAt', 'DESC');

    if (estimateId) {
      query.andWhere('session.estimateId = :estimateId', { estimateId });
    }
    return query.getMany();
  }

  async findOne(
    companyId: string,
    id: string,
  ): Promise<EstimationBomImportSession> {
    const entity = await this.bomImportRepository.findOne({
      where: { id, companyId },
    });
    if (!entity) {
      throw new NotFoundException(
        `BOM Import Session with ID ${id} not found`,
      );
    }
    return entity;
  }

  async delete(companyId: string, id: string): Promise<void> {
    const entity = await this.findOne(companyId, id);
    await this.bomImportRepository.remove(entity);
  }
}
