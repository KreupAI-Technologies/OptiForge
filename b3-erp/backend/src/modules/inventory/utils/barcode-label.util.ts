/**
 * Barcode label-sheet renderer.
 * ------------------------------
 * Renders a printable A4 PDF sheet of barcode labels (a 2-column grid of label
 * cells) via pdfkit. Each cell shows the item code/name, serial number,
 * location, a lightweight visual barcode representation and the human-readable
 * barcode value. Buffered fully in memory and returned as a Buffer so the
 * caller can stream it through a NestJS StreamableFile — mirrors the approach
 * of common/utils/report-render.util.ts.
 */

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
  text(text: string, x: number, y: number, options?: Record<string, unknown>): PdfDoc;
  rect(x: number, y: number, w: number, h: number): PdfDoc;
  lineWidth(w: number): PdfDoc;
  strokeColor(color: string): PdfDoc;
  stroke(): PdfDoc;
  fill(color?: string): PdfDoc;
  addPage(): PdfDoc;
  end(): void;
  page: {
    width: number;
    height: number;
    margins: { left: number; right: number; top: number; bottom: number };
  };
}

type PdfDocumentCtor = new (opts?: Record<string, unknown>) => PdfDoc;

export interface BarcodeLabel {
  barcode: string;
  barcodeType: string;
  itemCode: string;
  itemName: string;
  serialNumber: string;
  location: string;
}

/**
 * Draw a lightweight, deterministic bar pattern for a value. This is a visual
 * representation (not a scanner-grade Code-128 encoding — that would require a
 * dedicated barcode font/library); the human-readable value is always printed
 * beneath it so the label remains usable.
 */
function drawBars(
  doc: PdfDoc,
  value: string,
  x: number,
  y: number,
  width: number,
  height: number,
): void {
  const chars = value || ' ';
  // Build a pseudo-random-but-stable bar width sequence from the char codes.
  const widths: number[] = [];
  for (let i = 0; i < chars.length; i++) {
    const code = chars.charCodeAt(i);
    widths.push(1 + (code % 3)); // bar 1..3 units
    widths.push(1 + ((code >> 2) % 3)); // gap 1..3 units
  }
  const totalUnits = widths.reduce((a, b) => a + b, 0) || 1;
  const unit = width / totalUnits;

  let cursor = x;
  doc.fillColor('#111827');
  for (let i = 0; i < widths.length; i++) {
    const w = widths[i] * unit;
    // Even indices are bars, odd indices are gaps.
    if (i % 2 === 0) {
      doc.rect(cursor, y, Math.max(0.5, w - 0.3), height).fill('#111827');
    }
    cursor += w;
  }
}

export function renderBarcodeLabelsPdf(
  labels: BarcodeLabel[],
): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 36 });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', (err) => reject(err));

    const left = doc.page.margins.left;
    const top = doc.page.margins.top;
    const usableWidth =
      doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const usableHeight =
      doc.page.height - doc.page.margins.top - doc.page.margins.bottom;

    const cols = 2;
    const gutter = 12;
    const cellWidth = (usableWidth - gutter * (cols - 1)) / cols;
    const cellHeight = 120;
    const rowsPerPage = Math.max(1, Math.floor(usableHeight / cellHeight));
    const perPage = cols * rowsPerPage;

    if (!labels || labels.length === 0) {
      doc
        .fontSize(12)
        .font('Helvetica')
        .fillColor('#6B7280')
        .text('No barcodes selected for label printing.', left, top, {});
      doc.end();
      return;
    }

    labels.forEach((label, index) => {
      const posOnPage = index % perPage;
      if (index > 0 && posOnPage === 0) {
        doc.addPage();
      }
      const col = posOnPage % cols;
      const row = Math.floor(posOnPage / cols);
      const x = left + col * (cellWidth + gutter);
      const y = top + row * cellHeight;

      // Cell border
      doc
        .lineWidth(0.75)
        .strokeColor('#D1D5DB')
        .rect(x, y, cellWidth, cellHeight - 8)
        .stroke();

      const padX = x + 10;
      let cursorY = y + 10;

      doc
        .font('Helvetica-Bold')
        .fontSize(10)
        .fillColor('#111827')
        .text(label.itemCode || '(no code)', padX, cursorY, {
          width: cellWidth - 20,
        } as Record<string, unknown>);
      cursorY += 14;

      doc
        .font('Helvetica')
        .fontSize(8)
        .fillColor('#374151')
        .text(label.itemName || '', padX, cursorY, {
          width: cellWidth - 20,
          ellipsis: true,
        } as Record<string, unknown>);
      cursorY += 12;

      if (label.serialNumber) {
        doc
          .fontSize(7)
          .fillColor('#6B7280')
          .text(`S/N: ${label.serialNumber}`, padX, cursorY, {
            width: cellWidth - 20,
            ellipsis: true,
          } as Record<string, unknown>);
        cursorY += 10;
      }
      if (label.location) {
        doc
          .fontSize(7)
          .fillColor('#6B7280')
          .text(`Loc: ${label.location}`, padX, cursorY, {
            width: cellWidth - 20,
            ellipsis: true,
          } as Record<string, unknown>);
        cursorY += 10;
      }

      // Barcode bars + human-readable value
      const barsY = y + cellHeight - 8 - 34;
      drawBars(doc, label.barcode, padX, barsY, cellWidth - 20, 22);
      doc
        .font('Helvetica')
        .fontSize(8)
        .fillColor('#111827')
        .text(label.barcode || '', padX, barsY + 24, {
          width: cellWidth - 20,
          align: 'center',
        } as Record<string, unknown>);
    });

    doc.end();
  });
}
