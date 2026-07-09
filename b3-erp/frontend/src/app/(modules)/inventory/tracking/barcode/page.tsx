'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Search, QrCode, Scan, Package, MapPin, Calendar, Download, Upload, Printer, CheckCircle } from 'lucide-react';
import { inventoryService } from '@/services/InventoryService';
import { exportToCsv } from '@/lib/export';

interface BarcodeItem {
  id: string;
  itemCode: string;
  itemName: string;
  barcode: string;
  barcodeType: 'EAN-13' | 'Code-128' | 'QR Code' | 'Data Matrix';
  quantity: number;
  uom: string;
  location: string;
  batchNumber: string;
  serialNumber: string;
  lastScanned: string;
  scanCount: number;
  status: 'active' | 'inactive' | 'damaged';
}

export default function BarcodeTrackingPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [scanInput, setScanInput] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [scanMode, setScanMode] = useState(false);
  const [barcodeItems, setBarcodeItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<
    { status: 'found'; item: any } | { status: 'not-found'; code: string } | null
  >(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [actionMsg, setActionMsg] = useState<
    { type: 'success' | 'error'; text: string } | null
  >(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        // Barcodes are backed by serial-numbers (each carries barcode + serialNumber
        // + location + status). Map ORM shape to the fields the table reads.
        const raw = await inventoryService.getSerialNumbers();
        const mapped = raw.map((s: any, idx: number) => {
          const location = s.locationName || s.warehouseName || s.locationId || s.warehouseId || '';
          return {
            id: s.id ?? String(idx),
            itemCode: s.itemCode ?? '',
            itemName: s.itemName ?? '',
            barcode: s.barcode || s.serialNumber || '',
            barcodeType: s.barcodeType ?? 'Code-128',
            quantity: Number(s.quantity ?? 1),
            uom: s.uom ?? 'Nos',
            location,
            batchNumber: s.batchNumber ?? '',
            serialNumber: s.serialNumber ?? '',
            lastScanned: s.lastMovementDate ?? s.updatedAt ?? s.createdAt ?? '',
            scanCount: Number(s.serviceCount ?? 0),
            status:
              s.status === 'Scrapped' || s.status === 'Quarantine'
                ? 'damaged'
                : s.status === 'Available' || s.status === 'In Store' || s.status === 'Installed'
                ? 'active'
                : 'inactive',
          };
        });
        if (!cancelled) setBarcodeItems(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load barcodes');
          setBarcodeItems([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredItems = barcodeItems.filter(item => {
    const matchesSearch = item.barcode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.itemCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.itemName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || item.barcodeType === filterType;
    return matchesSearch && matchesType;
  });

  const handleScan = () => {
    const code = scanInput.trim();
    if (!code) return;

    // Look the scanned code up against the real, already-loaded barcode data
    // (backed by /inventory/serial-numbers). Match on barcode OR serial number.
    const lower = code.toLowerCase();
    const foundItem = barcodeItems.find(
      (item) =>
        item.barcode?.toLowerCase() === lower ||
        item.serialNumber?.toLowerCase() === lower
    );

    if (foundItem) {
      setScanResult({ status: 'found', item: foundItem });
      // Also surface the match in the table by filtering to it.
      setSearchQuery(foundItem.barcode || code);
    } else {
      setScanResult({ status: 'not-found', code });
    }
    setScanInput('');
  };

  // Parse an uploaded CSV or JSON file into barcode import rows.
  const parseImportFile = async (file: File): Promise<any[]> => {
    const text = await file.text();
    const trimmed = text.trim();
    if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
      const json = JSON.parse(trimmed);
      const arr = Array.isArray(json) ? json : json.rows ?? [];
      return Array.isArray(arr) ? arr : [];
    }
    // CSV: first line is the header.
    const lines = trimmed.split(/\r?\n/).filter((l) => l.trim() !== '');
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map((h) => h.trim());
    return lines.slice(1).map((line) => {
      const cells = line.split(',');
      const row: Record<string, string> = {};
      headers.forEach((h, i) => {
        row[h] = (cells[i] ?? '').trim();
      });
      return row;
    });
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Reset the input so the same file can be selected again later.
    e.target.value = '';
    if (!file) return;
    setActionMsg(null);
    setImporting(true);
    try {
      const rows = await parseImportFile(file);
      if (rows.length === 0) {
        setActionMsg({ type: 'error', text: 'No rows found in the selected file.' });
        return;
      }
      const result = await inventoryService.bulkImportBarcodes(rows);
      setActionMsg({
        type: 'success',
        text: `Imported ${result.total} row(s): ${result.created} created, ${result.updated} updated, ${result.skipped} skipped.`,
      });
      // Refresh the table from the backend.
      const raw = await inventoryService.getSerialNumbers();
      const mapped = raw.map((s: any, idx: number) => {
        const location = s.locationName || s.warehouseName || s.locationId || s.warehouseId || '';
        return {
          id: s.id ?? String(idx),
          itemCode: s.itemCode ?? '',
          itemName: s.itemName ?? '',
          barcode: s.barcode || s.serialNumber || '',
          barcodeType: s.barcodeType ?? 'Code-128',
          quantity: Number(s.quantity ?? 1),
          uom: s.uom ?? 'Nos',
          location,
          batchNumber: s.batchNumber ?? '',
          serialNumber: s.serialNumber ?? '',
          lastScanned: s.lastMovementDate ?? s.updatedAt ?? s.createdAt ?? '',
          scanCount: Number(s.serviceCount ?? 0),
          status:
            s.status === 'Scrapped' || s.status === 'Quarantine'
              ? 'damaged'
              : s.status === 'Available' || s.status === 'In Store' || s.status === 'Installed'
              ? 'active'
              : 'inactive',
        };
      });
      setBarcodeItems(mapped);
    } catch (err) {
      setActionMsg({
        type: 'error',
        text: err instanceof Error ? err.message : 'Bulk import failed',
      });
    } finally {
      setImporting(false);
    }
  };

  const handlePrintLabels = async () => {
    const ids = filteredItems.map((i) => i.id).filter(Boolean);
    if (ids.length === 0) return;
    setActionMsg(null);
    setPrinting(true);
    try {
      const blob = await inventoryService.downloadBarcodeLabels(ids, 'pdf');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'barcode-labels.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setActionMsg({
        type: 'error',
        text: err instanceof Error ? err.message : 'Label generation failed',
      });
    } finally {
      setPrinting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 border-green-200';
      case 'inactive': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'damaged': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getBarcodeTypeColor = (type: string) => {
    switch (type) {
      case 'EAN-13': return 'bg-blue-100 text-blue-700';
      case 'Code-128': return 'bg-purple-100 text-purple-700';
      case 'QR Code': return 'bg-indigo-100 text-indigo-700';
      case 'Data Matrix': return 'bg-teal-100 text-teal-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-3 py-2">
      <div className="mb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-2">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Barcode Tracking</h1>
            <p className="text-sm text-gray-500 mt-1">Scan and manage inventory barcodes</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() =>
              exportToCsv(
                'barcodes',
                filteredItems as unknown as Record<string, unknown>[]
              )
            }
            disabled={filteredItems.length === 0}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          {/* Bulk barcode import — parses the selected CSV/JSON file client-side
              and POSTs the rows to /inventory/barcodes/bulk-import. */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.json,application/json,text/csv"
            className="hidden"
            onChange={handleImportFile}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            title="Import barcodes from a CSV or JSON file"
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload className="w-4 h-4" />
            <span>{importing ? 'Importing…' : 'Import'}</span>
          </button>
          <button
            onClick={handlePrintLabels}
            disabled={printing || filteredItems.length === 0}
            title="Generate a printable PDF label sheet for the listed barcodes"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Printer className="w-4 h-4" />
            <span>{printing ? 'Generating…' : 'Print Labels'}</span>
          </button>
        </div>
      </div>

      {actionMsg && (
        <div
          className={`mb-3 flex items-center justify-between rounded-lg border px-4 py-3 text-sm ${
            actionMsg.type === 'success'
              ? 'border-green-200 bg-green-50 text-green-700'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          <span>{actionMsg.text}</span>
          <button
            onClick={() => setActionMsg(null)}
            className="text-gray-400 hover:text-gray-600"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Barcodes</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">{barcodeItems.length}</p>
            </div>
            <QrCode className="w-6 h-6 text-blue-700" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Active</p>
              <p className="text-3xl font-bold text-green-900 mt-1">
                {barcodeItems.filter(i => i.status === 'active').length}
              </p>
            </div>
            <CheckCircle className="w-6 h-6 text-green-700" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-3 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Total Scans</p>
              <p className="text-3xl font-bold text-purple-900 mt-1">
                {barcodeItems.reduce((sum, item) => sum + item.scanCount, 0)}
              </p>
            </div>
            <Scan className="w-6 h-6 text-purple-700" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-3 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Damaged</p>
              <p className="text-3xl font-bold text-red-900 mt-1">
                {barcodeItems.filter(i => i.status === 'damaged').length}
              </p>
            </div>
            <Package className="w-6 h-6 text-red-700" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-3 mb-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Scan className="w-5 h-5 text-blue-600" />
            Quick Scan
          </h3>
          <button
            onClick={() => setScanMode(!scanMode)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              scanMode
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {scanMode ? 'Scanner Active' : 'Activate Scanner'}
          </button>
        </div>

        {scanMode && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-3">
              <QrCode className="w-8 h-8 text-blue-600" />
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  placeholder="Scan or enter barcode..."
                  value={scanInput}
                  onChange={(e) => setScanInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleScan()}
                  className="flex-1 px-4 py-3 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-mono"
                  autoFocus
                />
                <button
                  onClick={handleScan}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Lookup
                </button>
              </div>
            </div>
            <p className="text-sm text-blue-700 mt-3">
              Scan the barcode using a scanner or manually enter the barcode number to lookup item details
            </p>

            {scanResult?.status === 'found' && (
              <div className="mt-3 bg-white border border-green-200 rounded-lg p-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-green-800">Item Found</span>
                  </div>
                  <button
                    onClick={() => setScanResult(null)}
                    className="text-gray-400 hover:text-gray-600 text-sm"
                  >
                    Clear
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500">Item</p>
                    <p className="font-medium text-gray-900">{scanResult.item.itemName || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Code</p>
                    <p className="font-medium text-gray-900">{scanResult.item.itemCode || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Location</p>
                    <p className="font-medium text-gray-900">{scanResult.item.location || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Quantity</p>
                    <p className="font-medium text-gray-900">
                      {scanResult.item.quantity} {scanResult.item.uom}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {scanResult?.status === 'not-found' && (
              <div className="mt-3 bg-white border border-red-200 rounded-lg p-3 flex items-center justify-between">
                <span className="text-sm text-red-700">
                  Barcode <span className="font-mono font-semibold">{scanResult.code}</span> not found in the system.
                </span>
                <button
                  onClick={() => setScanResult(null)}
                  className="text-gray-400 hover:text-gray-600 text-sm"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-3 mb-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by barcode, item code, or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Barcode Types</option>
            <option value="EAN-13">EAN-13</option>
            <option value="Code-128">Code-128</option>
            <option value="QR Code">QR Code</option>
            <option value="Data Matrix">Data Matrix</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Barcode</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Quantity</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Batch/Serial</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Scanned</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Scan Count</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-mono font-bold text-gray-900">{item.barcode}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getBarcodeTypeColor(item.barcodeType)}`}>
                      {item.barcodeType}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-semibold text-gray-900">{item.itemCode}</div>
                    <div className="text-xs text-gray-500">{item.itemName}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right font-semibold">
                    {item.quantity} {item.uom}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-gray-400" />
                      {item.location}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">
                    {item.batchNumber && <div>Batch: {item.batchNumber}</div>}
                    {item.serialNumber && <div>S/N: {item.serialNumber}</div>}
                    {!item.batchNumber && !item.serialNumber && <span className="text-gray-400">-</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      {new Date(item.lastScanned).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right font-semibold">
                    {item.scanCount}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-3 text-gray-500">Loading barcodes...</p>
          </div>
        )}

        {!isLoading && loadError && (
          <div className="text-center py-12">
            <p className="text-red-600">{loadError}</p>
          </div>
        )}

        {!isLoading && !loadError && filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No barcodes found matching your criteria</p>
          </div>
        )}
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-3">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Barcode Management Tips:</h3>
        <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
          <li>Ensure barcodes are clearly visible and undamaged for accurate scanning</li>
          <li>Use appropriate barcode types based on data requirements (EAN-13 for products, QR for complex data)</li>
          <li>Regularly verify barcode accuracy to prevent inventory discrepancies</li>
          <li>Replace damaged barcode labels immediately to maintain tracking integrity</li>
          <li>Maintain a backup database of all barcode assignments</li>
        </ul>
      </div>
    </div>
  );
}
