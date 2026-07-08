import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import {
  existsSync,
  mkdirSync,
  writeFileSync,
  unlinkSync,
} from 'fs';
import { extname, join, resolve } from 'path';
import * as ExcelJS from 'exceljs';
import { Attachment } from '../entities/attachment.entity';

/**
 * Local-disk storage directory (relative to the backend process cwd). Files are
 * written here keyed by a generated uuid; the DB row holds the original name.
 */
const UPLOAD_DIR = 'uploads';

/** Shape produced by Multer's memory/disk storage (subset we rely on). */
export interface UploadedFileLike {
  originalname: string;
  mimetype: string;
  size: number;
  buffer?: Buffer;
  path?: string;
}

@Injectable()
export class AttachmentsService {
  constructor(
    @InjectRepository(Attachment)
    private readonly repo: Repository<Attachment>,
  ) {
    this.ensureUploadDir();
  }

  private ensureUploadDir(): void {
    const abs = resolve(process.cwd(), UPLOAD_DIR);
    if (!existsSync(abs)) {
      mkdirSync(abs, { recursive: true });
    }
  }

  private toBuffer(file: UploadedFileLike): Buffer {
    if (file.buffer) return file.buffer;
    if (file.path) {
      // Disk storage: read the temp file back so we can key it by uuid.
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      return require('fs').readFileSync(file.path);
    }
    return Buffer.alloc(0);
  }

  /** Persist an uploaded file to disk and record it. */
  async store(
    file: UploadedFileLike,
    entityType: string,
    entityId: string,
    uploadedBy?: string | null,
  ): Promise<Attachment> {
    this.ensureUploadDir();
    const ext = extname(file.originalname || '') || '';
    const storageKey = join(UPLOAD_DIR, `${randomUUID()}${ext}`);
    const absPath = resolve(process.cwd(), storageKey);
    writeFileSync(absPath, this.toBuffer(file));

    const row = this.repo.create({
      entityType,
      entityId,
      fileName: file.originalname,
      mimeType: file.mimetype || 'application/octet-stream',
      size: file.size ?? 0,
      storageKey,
      uploadedBy: uploadedBy ?? null,
    });
    return this.repo.save(row);
  }

  /** List attachments for an owning record. */
  async list(entityType: string, entityId: string): Promise<Attachment[]> {
    try {
      return await this.repo.find({
        where: { entityType, entityId },
        order: { createdAt: 'DESC' },
      });
    } catch {
      // Table not yet created — degrade gracefully like sibling modules.
      return [];
    }
  }

  /** Fetch one row plus its absolute on-disk path (for streaming). */
  async getOne(
    id: string,
  ): Promise<{ attachment: Attachment; absolutePath: string }> {
    const attachment = await this.repo.findOne({ where: { id } });
    if (!attachment) {
      throw new NotFoundException(`Attachment ${id} not found`);
    }
    const absolutePath = resolve(process.cwd(), attachment.storageKey);
    return { attachment, absolutePath };
  }

  /** Delete the DB row and its file from disk. */
  async remove(id: string): Promise<void> {
    const attachment = await this.repo.findOne({ where: { id } });
    if (!attachment) {
      throw new NotFoundException(`Attachment ${id} not found`);
    }
    const absPath = resolve(process.cwd(), attachment.storageKey);
    try {
      if (existsSync(absPath)) unlinkSync(absPath);
    } catch {
      /* best-effort file cleanup; still remove the row */
    }
    await this.repo.delete(id);
  }

  /**
   * Parse an uploaded spreadsheet (xlsx/xls/csv) into rows of plain objects.
   * The first row is treated as the header; each subsequent row becomes an
   * object keyed by the header cell values. No rows are fabricated — an empty
   * sheet yields an empty array.
   */
  async parseSpreadsheet(
    file: UploadedFileLike,
  ): Promise<{ headers: string[]; rows: Record<string, unknown>[] }> {
    const workbook = new ExcelJS.Workbook();
    const buffer = this.toBuffer(file);
    const name = (file.originalname || '').toLowerCase();

    if (name.endsWith('.csv')) {
      const { Readable } = require('stream');
      await workbook.csv.read(Readable.from(buffer));
    } else {
      await workbook.xlsx.load(buffer as any);
    }

    const sheet = workbook.worksheets[0];
    if (!sheet) return { headers: [], rows: [] };

    const cellText = (v: ExcelJS.CellValue): string => {
      if (v === null || v === undefined) return '';
      if (typeof v === 'object') {
        const anyV = v as any;
        if (anyV.text) return String(anyV.text);
        if (anyV.result !== undefined) return String(anyV.result);
        if (anyV.richText)
          return anyV.richText.map((r: any) => r.text).join('');
        if (anyV instanceof Date) return anyV.toISOString();
      }
      return String(v);
    };

    const headerRow = sheet.getRow(1);
    const headers: string[] = [];
    headerRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      headers[colNumber - 1] = cellText(cell.value).trim();
    });

    const rows: Record<string, unknown>[] = [];
    for (let r = 2; r <= sheet.rowCount; r++) {
      const row = sheet.getRow(r);
      const obj: Record<string, unknown> = {};
      let hasValue = false;
      headers.forEach((h, idx) => {
        if (!h) return;
        const val = cellText(row.getCell(idx + 1).value).trim();
        if (val !== '') hasValue = true;
        obj[h] = val;
      });
      if (hasValue) rows.push(obj);
    }

    return { headers: headers.filter(Boolean), rows };
  }
}
