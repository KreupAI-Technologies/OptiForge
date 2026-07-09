import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  SerialNumber,
  SerialNumberStatus,
} from '../entities/serial-number.entity';

/** One parsed row of a bulk barcode import (already parsed on the client). */
export interface BarcodeImportRow {
  serialNumber?: string;
  barcode?: string;
  barcodeType?: string;
  itemId?: string;
  itemCode?: string;
  itemName?: string;
  warehouseId?: string;
  warehouseName?: string;
  locationId?: string;
  locationName?: string;
  batchNumber?: string;
}

export interface BarcodeImportResult {
  total: number;
  created: number;
  updated: number;
  skipped: number;
  errors: { row: number; reason: string }[];
}

@Injectable()
export class BarcodeService {
  constructor(
    @InjectRepository(SerialNumber)
    private readonly serialNumberRepository: Repository<SerialNumber>,
  ) {}

  /**
   * Bulk-import parsed barcode rows. Each row is matched to an existing
   * serial-number record by serialNumber (or barcode); matches are updated
   * with the incoming barcode/type/item/location fields, and unmatched rows
   * that carry enough item context create a new serial-number record. Rows
   * with neither a serial nor a barcode are skipped.
   */
  async bulkImport(rows: BarcodeImportRow[]): Promise<BarcodeImportResult> {
    const result: BarcodeImportResult = {
      total: Array.isArray(rows) ? rows.length : 0,
      created: 0,
      updated: 0,
      skipped: 0,
      errors: [],
    };

    if (!Array.isArray(rows) || rows.length === 0) {
      return result;
    }

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i] ?? {};
      const serial = (row.serialNumber ?? '').trim();
      const barcode = (row.barcode ?? '').trim();

      if (!serial && !barcode) {
        result.skipped++;
        result.errors.push({
          row: i + 1,
          reason: 'Row has neither a serial number nor a barcode',
        });
        continue;
      }

      try {
        // Prefer matching on serial number, then on barcode.
        let existing: SerialNumber | null = null;
        if (serial) {
          existing = await this.serialNumberRepository.findOne({
            where: { serialNumber: serial },
          });
        }
        if (!existing && barcode) {
          existing = await this.serialNumberRepository.findOne({
            where: { barcode },
          });
        }

        if (existing) {
          existing.barcode = barcode || existing.barcode;
          existing.barcodeType = row.barcodeType || existing.barcodeType;
          if (row.itemId) existing.itemId = row.itemId;
          if (row.itemCode) existing.itemCode = row.itemCode;
          if (row.itemName) existing.itemName = row.itemName;
          if (row.warehouseId) existing.warehouseId = row.warehouseId;
          if (row.warehouseName) existing.warehouseName = row.warehouseName;
          if (row.locationId) existing.locationId = row.locationId;
          if (row.locationName) existing.locationName = row.locationName;
          if (row.batchNumber) existing.batchNumber = row.batchNumber;
          await this.serialNumberRepository.save(existing);
          result.updated++;
          continue;
        }

        // No match — create a new record. A serial number is required as the
        // natural key; fall back to the barcode value when absent.
        const created = this.serialNumberRepository.create({
          serialNumber: serial || barcode,
          barcode: barcode || serial,
          barcodeType: row.barcodeType,
          itemId: row.itemId ?? '',
          itemCode: row.itemCode ?? '',
          itemName: row.itemName ?? '',
          warehouseId: row.warehouseId,
          warehouseName: row.warehouseName,
          locationId: row.locationId,
          locationName: row.locationName,
          batchNumber: row.batchNumber,
          status: SerialNumberStatus.IN_STORE,
          isUnderWarranty: false,
          isExpired: false,
        });
        await this.serialNumberRepository.save(created);
        result.created++;
      } catch (err) {
        result.skipped++;
        result.errors.push({
          row: i + 1,
          reason: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }

    return result;
  }

  /**
   * Load the serial-number/barcode records for the given ids, in the order
   * they will be rendered onto a label sheet.
   */
  async findForLabels(ids: string[]): Promise<SerialNumber[]> {
    if (!ids || ids.length === 0) return [];
    const rows = await this.serialNumberRepository.find({
      where: { id: In(ids) },
    });
    // Preserve the requested ordering.
    const byId = new Map(rows.map((r) => [r.id, r]));
    return ids.map((id) => byId.get(id)).filter((r): r is SerialNumber => !!r);
  }
}
