/**
 * Shared report-file renderer.
 * -----------------------------
 * Turns a generic tabular report definition (title + column defs + rows) into a
 * downloadable PDF (via pdfkit) or Excel workbook (via exceljs) as a Buffer.
 * Used by the estimation and reports modules to back their file-download
 * endpoints. No I/O to disk — everything is buffered in memory and streamed
 * back through a NestJS StreamableFile.
 */
import * as ExcelJS from 'exceljs';

// pdfkit ships no bundled types and @types/pdfkit is not installed, so require
// it through a minimal structural type instead of pulling in a global d.ts.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const PDFDocument = require('pdfkit') as PdfDocumentCtor;

interface PdfDoc {
  on(event: 'data', cb: (chunk: Buffer) => void): PdfDoc;
  on(event: 'end', cb: () => void): PdfDoc;
  on(event: 'error', cb: (err: Error) => void): PdfDoc;
  fontSize(size: number): PdfDoc;
  font(name: string): PdfDoc;
  fillColor(color: string): PdfDoc;
  text(text: string, options?: Record<string, unknown>): PdfDoc;
  text(text: string, x: number, y: number, options?: Record<string, unknown>): PdfDoc;
  moveDown(lines?: number): PdfDoc;
  moveTo(x: number, y: number): PdfDoc;
  lineTo(x: number, y: number): PdfDoc;
  stroke(): PdfDoc;
  addPage(): PdfDoc;
  end(): void;
  y: number;
  page: { width: number; height: number; margins: { left: number; right: number; top: number; bottom: number } };
}

type PdfDocumentCtor = new (opts?: Record<string, unknown>) => PdfDoc;

export interface ReportColumn {
  /** Key into each row object. */
  key: string;
  /** Column header label. */
  header: string;
  /** Optional width hint (Excel column width / relative PDF weight). */
  width?: number;
  /** Right-align numeric columns in the PDF/Excel output. */
  numeric?: boolean;
}

export interface ReportDefinition {
  title: string;
  subtitle?: string;
  columns: ReportColumn[];
  rows: Record<string, unknown>[];
  /** Optional summary key/value pairs rendered under the table. */
  summary?: Record<string, unknown>;
  /** Optional label shown in the document footer/header. */
  companyLabel?: string;
  generatedAt?: Date;
}

export type ReportFormat = 'pdf' | 'excel' | 'csv';

const EXCEL_CONTENT_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

export function contentTypeFor(format: ReportFormat): string {
  switch (format) {
    case 'excel':
      return EXCEL_CONTENT_TYPE;
    case 'csv':
      return 'text/csv';
    case 'pdf':
    default:
      return 'application/pdf';
  }
}

export function fileExtensionFor(format: ReportFormat): string {
  switch (format) {
    case 'excel':
      return 'xlsx';
    case 'csv':
      return 'csv';
    case 'pdf':
    default:
      return 'pdf';
  }
}

/** Normalise a requested format string into a supported ReportFormat. */
export function normalizeFormat(raw?: string): ReportFormat {
  const v = (raw || 'pdf').toLowerCase();
  if (v === 'xlsx' || v === 'excel' || v === 'xls') return 'excel';
  if (v === 'csv') return 'csv';
  return 'pdf';
}

function cellToString(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) return value.toISOString().split('T')[0];
  if (typeof value === 'number') {
    return Number.isInteger(value) ? String(value) : value.toFixed(2);
  }
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

/** Build an .xlsx workbook as a Buffer. */
export async function renderExcel(def: ReportDefinition): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = def.companyLabel || 'ManufacturingOS';
  workbook.created = def.generatedAt || new Date();

  const sheet = workbook.addWorksheet(def.title.slice(0, 31) || 'Report');

  // Title rows
  const titleRow = sheet.addRow([def.title]);
  titleRow.font = { bold: true, size: 14 };
  if (def.subtitle) {
    const subRow = sheet.addRow([def.subtitle]);
    subRow.font = { italic: true, size: 10, color: { argb: 'FF666666' } };
  }
  sheet.addRow([
    `Generated: ${(def.generatedAt || new Date()).toISOString().split('T')[0]}`,
  ]);
  sheet.addRow([]);

  // Header row
  const headerRow = sheet.addRow(def.columns.map((c) => c.header));
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2563EB' },
    };
    cell.alignment = { vertical: 'middle', horizontal: 'left' };
  });

  // Data rows
  for (const row of def.rows) {
    const values = def.columns.map((c) => {
      const raw = row[c.key];
      if (c.numeric && typeof raw === 'string' && raw.trim() !== '') {
        const n = Number(raw);
        return Number.isNaN(n) ? raw : n;
      }
      return raw ?? '';
    });
    sheet.addRow(values);
  }

  // Column widths
  def.columns.forEach((c, i) => {
    sheet.getColumn(i + 1).width = c.width ?? Math.max(12, c.header.length + 4);
  });

  // Summary
  if (def.summary && Object.keys(def.summary).length > 0) {
    sheet.addRow([]);
    const sumHeader = sheet.addRow(['Summary']);
    sumHeader.font = { bold: true, size: 12 };
    for (const [k, v] of Object.entries(def.summary)) {
      sheet.addRow([k, cellToString(v)]);
    }
  }

  const arrayBuffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(arrayBuffer as ArrayBuffer);
}

/** Build a CSV file as a Buffer. */
export function renderCsv(def: ReportDefinition): Buffer {
  const escape = (s: string) =>
    /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  const lines: string[] = [];
  lines.push(def.columns.map((c) => escape(c.header)).join(','));
  for (const row of def.rows) {
    lines.push(
      def.columns.map((c) => escape(cellToString(row[c.key]))).join(','),
    );
  }
  return Buffer.from(lines.join('\r\n'), 'utf-8');
}

/** Build a PDF document as a Buffer. */
export function renderPdf(def: ReportDefinition): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 40, layout: 'landscape' });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', (err) => reject(err));

    const pageLeft = doc.page.margins.left;
    const pageRight = doc.page.width - doc.page.margins.right;
    const usableWidth = pageRight - pageLeft;

    // Header
    doc.fontSize(18).font('Helvetica-Bold').fillColor('#111827').text(def.title);
    if (def.subtitle) {
      doc.moveDown(0.2);
      doc.fontSize(10).font('Helvetica').fillColor('#6B7280').text(def.subtitle);
    }
    doc
      .fontSize(9)
      .font('Helvetica')
      .fillColor('#6B7280')
      .text(
        `${def.companyLabel ? def.companyLabel + '  ·  ' : ''}Generated: ${(
          def.generatedAt || new Date()
        )
          .toISOString()
          .replace('T', ' ')
          .slice(0, 19)}`,
      );
    doc.moveDown(0.8);

    // Column geometry — weight by width hint (fallback: equal).
    const weights = def.columns.map((c) => c.width ?? 1);
    const weightSum = weights.reduce((a, b) => a + b, 0) || 1;
    const colWidths = weights.map((w) => (w / weightSum) * usableWidth);
    const colX: number[] = [];
    let acc = pageLeft;
    for (const w of colWidths) {
      colX.push(acc);
      acc += w;
    }

    const rowHeight = 18;

    const drawHeader = (): void => {
      const y = doc.y;
      doc.font('Helvetica-Bold').fontSize(9).fillColor('#111827');
      def.columns.forEach((c, i) => {
        doc.text(c.header, colX[i] + 2, y + 4, {
          width: colWidths[i] - 4,
          align: c.numeric ? 'right' : 'left',
          ellipsis: true,
        });
      });
      doc
        .moveTo(pageLeft, y + rowHeight)
        .lineTo(pageRight, y + rowHeight)
        .stroke();
      doc.y = y + rowHeight + 2;
    };

    drawHeader();

    doc.font('Helvetica').fontSize(8).fillColor('#374151');
    const bottomLimit = doc.page.height - doc.page.margins.bottom - rowHeight;

    if (def.rows.length === 0) {
      doc.moveDown(1);
      doc.fillColor('#9CA3AF').text('No data for the selected criteria.');
    }

    for (const row of def.rows) {
      if (doc.y > bottomLimit) {
        doc.addPage();
        doc.y = doc.page.margins.top;
        drawHeader();
        doc.font('Helvetica').fontSize(8).fillColor('#374151');
      }
      const y = doc.y;
      def.columns.forEach((c, i) => {
        doc.text(cellToString(row[c.key]), colX[i] + 2, y + 3, {
          width: colWidths[i] - 4,
          align: c.numeric ? 'right' : 'left',
          ellipsis: true,
        });
      });
      doc.y = y + rowHeight;
    }

    // Summary
    if (def.summary && Object.keys(def.summary).length > 0) {
      if (doc.y > bottomLimit - 60) {
        doc.addPage();
        doc.y = doc.page.margins.top;
      }
      doc.moveDown(1);
      doc.font('Helvetica-Bold').fontSize(11).fillColor('#111827').text('Summary');
      doc.moveDown(0.3);
      doc.font('Helvetica').fontSize(9).fillColor('#374151');
      for (const [k, v] of Object.entries(def.summary)) {
        doc.text(`${k}: ${cellToString(v)}`);
      }
    }

    doc.end();
  });
}

/** Render a report definition to the requested format as a Buffer. */
export async function renderReport(
  def: ReportDefinition,
  format: ReportFormat,
): Promise<Buffer> {
  switch (format) {
    case 'excel':
      return renderExcel(def);
    case 'csv':
      return renderCsv(def);
    case 'pdf':
    default:
      return renderPdf(def);
  }
}

/** Build a safe download filename (no extension) from a title. */
export function safeFileName(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80) || 'report'
  );
}
