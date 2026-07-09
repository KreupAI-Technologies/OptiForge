-- Additive column for barcode tracking / bulk-import / label printing.
-- Backs inventory/tracking/barcode: barcodes are stored on serial-number
-- records; this adds the barcode symbology field (EAN-13, Code-128, QR Code,
-- Data Matrix …) shown on the tracking table and the label sheet.
-- ADDITIVE ONLY: never DROP or ALTER existing columns.
-- Column name is quoted to match the TypeORM entity column name exactly.

ALTER TABLE "serial_numbers"
  ADD COLUMN IF NOT EXISTS "barcodeType" character varying(50);
