'use client';

import React, { useState, useEffect } from 'react';
import { inventoryService } from '@/services/InventoryService';
import {
  Scan,
  Package,
  CheckCircle,
  AlertCircle,
  Save,
  Send,
  Camera,
  BarChart3,
  MapPin,
  Hash,
  Plus,
  Minus
} from 'lucide-react';

interface CountItem {
  id: number;
  itemCode: string;
  itemName: string;
  location: string;
  systemQty: number;
  physicalQty: number | null;
  uom: string;
  batchNumber: string;
  serialNumber: string;
  variance: number;
  status: 'pending' | 'counted' | 'variance';
}

export default function PhysicalCountPage() {
  const [scanMode, setScanMode] = useState<'barcode' | 'manual'>('manual');
  const [barcodeInput, setBarcodeInput] = useState('');

  const [countItems, setCountItems] = useState<CountItem[]>([]);

  const loadCounts = async () => {
    try {
      const rows = await inventoryService.getCycleCounts();
      if (!Array.isArray(rows)) {
        setCountItems([]);
        return;
      }
      // Physical inventory page: focus on full/physical count types when present.
      const physical = rows.filter(r =>
        typeof r?.countType === 'string' &&
        /full|physical/i.test(r.countType)
      );
      const source = physical.length > 0 ? physical : rows;

      const mapped: CountItem[] = source.map((r, idx) => {
        const systemQty = Number(r?.itemsToCount) || 0;
        const physicalQty = r?.itemsCounted != null ? Number(r.itemsCounted) : null;
        const variance = physicalQty !== null ? physicalQty - systemQty : 0;
        const variancesFound = Number(r?.variancesFound) || 0;
        let status: CountItem['status'] = 'pending';
        if (physicalQty !== null && physicalQty > 0) {
          status = variancesFound > 0 || variance !== 0 ? 'variance' : 'counted';
        }
        return {
          id: idx + 1,
          itemCode: r?.countNumber ?? `CC-${idx + 1}`,
          itemName: r?.title ?? r?.countNumber ?? 'Cycle Count',
          location: [r?.warehouse, r?.zone].filter(Boolean).join(' / ') || '-',
          systemQty,
          physicalQty,
          uom: 'Items',
          batchNumber: '',
          serialNumber: '',
          variance,
          status,
        };
      });
      setCountItems(mapped);
    } catch (err) {
      console.error('Failed to load cycle counts', err);
      setCountItems([]);
    }
  };

  useEffect(() => {
    loadCounts();
  }, []);

  const updatePhysicalQty = (id: number, qty: number) => {
    setCountItems(prev =>
      prev.map(item => {
        if (item.id === id) {
          const variance = qty - item.systemQty;
          const status = variance === 0 ? 'counted' : 'variance';
          return { ...item, physicalQty: qty, variance, status };
        }
        return item;
      })
    );
  };

  const incrementQty = (id: number) => {
    const item = countItems.find(i => i.id === id);
    if (item) {
      updatePhysicalQty(id, (item.physicalQty || 0) + 1);
    }
  };

  const decrementQty = (id: number) => {
    const item = countItems.find(i => i.id === id);
    if (item && (item.physicalQty || 0) > 0) {
      updatePhysicalQty(id, (item.physicalQty || 0) - 1);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      case 'counted':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'variance':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const totalItems = countItems.length;
  const countedItems = countItems.filter(item => item.status !== 'pending').length;
  const varianceItems = countItems.filter(item => item.status === 'variance').length;
  const completionRate = totalItems > 0 ? (countedItems / totalItems) * 100 : 0;

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <Scan className="w-8 h-8 text-blue-600" />
            <span>Physical Count - CC-2025-002</span>
          </h1>
          <p className="text-gray-600 mt-1">Zone B - Components | Assigned to: Sarah Johnson</p>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={() => loadCounts()} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
            <Save className="w-4 h-4" />
            <span>Save Progress</span>
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
            <Send className="w-4 h-4" />
            <span>Submit Count</span>
          </button>
        </div>
      </div>

      {/* Progress Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <Package className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-blue-900">{totalItems}</span>
          </div>
          <div className="text-sm font-medium text-blue-700">Total Items</div>
          <div className="text-xs text-blue-600 mt-1">To Count</div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <span className="text-2xl font-bold text-green-900">{countedItems}</span>
          </div>
          <div className="text-sm font-medium text-green-700">Items Counted</div>
          <div className="text-xs text-green-600 mt-1">{completionRate.toFixed(0)}% Complete</div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3 border border-red-200">
          <div className="flex items-center justify-between mb-2">
            <AlertCircle className="w-8 h-8 text-red-600" />
            <span className="text-2xl font-bold text-red-900">{varianceItems}</span>
          </div>
          <div className="text-sm font-medium text-red-700">Variances Found</div>
          <div className="text-xs text-red-600 mt-1">Needs Review</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <BarChart3 className="w-8 h-8 text-purple-600" />
            <span className="text-2xl font-bold text-purple-900">
              {((countedItems - varianceItems) / countedItems * 100 || 0).toFixed(0)}%
            </span>
          </div>
          <div className="text-sm font-medium text-purple-700">Accuracy Rate</div>
          <div className="text-xs text-purple-600 mt-1">Match Rate</div>
        </div>
      </div>

      {/* Scan Mode Toggle */}
      <div className="bg-white rounded-lg shadow p-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">Count Mode</h3>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setScanMode('barcode')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                scanMode === 'barcode'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Scan className="w-4 h-4 inline mr-2" />
              Barcode Scan
            </button>
            <button
              onClick={() => setScanMode('manual')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                scanMode === 'manual'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Hash className="w-4 h-4 inline mr-2" />
              Manual Entry
            </button>
          </div>
        </div>

        {scanMode === 'barcode' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center space-x-3">
              <Scan className="w-8 h-8 text-blue-600" />
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Scan barcode or enter item code..."
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  autoFocus
                />
              </div>
              <Camera className="w-6 h-6 text-blue-600 cursor-pointer hover:text-blue-800" />
            </div>
            <p className="text-sm text-blue-700 mt-2">
              Scan the barcode or type the item code to quickly locate and count items
            </p>
          </div>
        )}
      </div>

      {/* Count Items Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-3 py-2 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Items to Count</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Code</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch/Serial</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">System Qty</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Physical Count</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variance</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {countItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.itemCode}
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-900">{item.itemName}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>{item.location}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-600">
                    {item.batchNumber && <div className="text-xs">Batch: {item.batchNumber}</div>}
                    {item.serialNumber && <div className="text-xs">S/N: {item.serialNumber}</div>}
                    {!item.batchNumber && !item.serialNumber && <span className="text-gray-400">-</span>}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-semibold text-gray-900">
                    {item.systemQty} {item.uom}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => decrementQty(item.id)}
                        className="p-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <input
                        type="number"
                        value={item.physicalQty ?? ''}
                        onChange={(e) => updatePhysicalQty(item.id, parseInt(e.target.value) || 0)}
                        className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center font-semibold focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0"
                      />
                      <button
                        onClick={() => incrementQty(item.id)}
                        className="p-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <span className="text-xs text-gray-500">{item.uom}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {item.physicalQty !== null ? (
                      <span className={`text-sm font-semibold ${
                        item.variance === 0 ? 'text-green-600' :
                        item.variance > 0 ? 'text-blue-600' : 'text-red-600'
                      }`}>
                        {item.variance > 0 ? '+' : ''}{item.variance} {item.uom}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                      {item.status === 'pending' && 'Pending'}
                      {item.status === 'counted' && 'Counted'}
                      {item.status === 'variance' && 'Variance'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h4 className="font-semibold text-blue-900 mb-2">Counting Instructions:</h4>
        <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
          <li>Count all items in the assigned zone carefully</li>
          <li>Enter the physical quantity for each item</li>
          <li>Verify batch/serial numbers match the system records</li>
          <li>Note any damaged or expired items in comments</li>
          <li>Save progress regularly to avoid data loss</li>
          <li>Submit the count once all items are verified</li>
        </ul>
      </div>
    </div>
  );
}
