'use client';

import React, { useState, useEffect } from 'react';
import { inventoryService } from '@/services/InventoryService';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  Filter,
  Package,
  PackageCheck,
  PackageMinus,
  Warehouse,
  FileText
} from 'lucide-react';

interface MovementReport {
  warehouse: string;
  receipts: number;
  issues: number;
  transfers: number;
  netMovement: number;
  openingStock: number;
  closingStock: number;
}

export default function MovementReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('this-month');
  const [selectedWarehouse, setSelectedWarehouse] = useState('all');
  const [selectedMovementType, setSelectedMovementType] = useState('all');

  const [warehouseData, setWarehouseData] = useState<MovementReport[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await inventoryService.getStockLedger();
        const entries = Array.isArray(res) ? res : [];

        // Aggregate flat ledger entries into per-warehouse movement summary
        const byWarehouse = new Map<string, MovementReport>();
        for (const e of entries) {
          const warehouse = e?.warehouseName ?? e?.warehouse ?? 'Unknown';
          const type = String(e?.entryType ?? e?.movementType ?? '').toLowerCase();
          const qty = Math.abs(Number(e?.quantity ?? 0));

          const bucket = byWarehouse.get(warehouse) ?? {
            warehouse,
            receipts: 0,
            issues: 0,
            transfers: 0,
            netMovement: 0,
            openingStock: 0,
            closingStock: 0,
          };

          if (type.includes('receipt') || type.includes('in') || type.includes('purchase')) {
            bucket.receipts += qty;
            bucket.netMovement += qty;
            bucket.closingStock += qty;
          } else if (type.includes('issue') || type.includes('out') || type.includes('consumption')) {
            bucket.issues += qty;
            bucket.netMovement -= qty;
            bucket.closingStock -= qty;
          } else if (type.includes('transfer')) {
            bucket.transfers += qty;
          } else {
            // Fallback: use sign of raw quantity to classify
            const raw = Number(e?.quantity ?? 0);
            if (raw >= 0) {
              bucket.receipts += qty;
              bucket.netMovement += qty;
              bucket.closingStock += qty;
            } else {
              bucket.issues += qty;
              bucket.netMovement -= qty;
              bucket.closingStock -= qty;
            }
          }

          byWarehouse.set(warehouse, bucket);
        }

        setWarehouseData(Array.from(byWarehouse.values()));
      } catch (err) {
        console.error('Failed to load stock ledger', err);
      }
    })();
  }, []);

  const totalReceipts = warehouseData.reduce((sum, w) => sum + w.receipts, 0);
  const totalIssues = warehouseData.reduce((sum, w) => sum + w.issues, 0);
  const totalTransfers = warehouseData.reduce((sum, w) => sum + w.transfers, 0);
  const totalClosingStock = warehouseData.reduce((sum, w) => sum + w.closingStock, 0);

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <BarChart3 className="w-8 h-8 text-purple-600" />
            <span>Inventory Movement Reports</span>
          </h1>
          <p className="text-gray-600 mt-1">Analyze inventory movements and stock trends</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <PackageCheck className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-blue-900">{totalReceipts}</span>
          </div>
          <div className="text-sm font-medium text-blue-700">Total Receipts</div>
          <div className="text-xs text-blue-600 mt-1">All Warehouses</div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <PackageMinus className="w-8 h-8 text-orange-600" />
            <span className="text-2xl font-bold text-orange-900">{totalIssues}</span>
          </div>
          <div className="text-sm font-medium text-orange-700">Total Issues</div>
          <div className="text-xs text-orange-600 mt-1">All Warehouses</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-purple-600" />
            <span className="text-2xl font-bold text-purple-900">{totalTransfers}</span>
          </div>
          <div className="text-sm font-medium text-purple-700">Total Transfers</div>
          <div className="text-xs text-purple-600 mt-1">Inter-Warehouse</div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <Package className="w-8 h-8 text-green-600" />
            <span className="text-2xl font-bold text-green-900">{totalClosingStock.toLocaleString()}</span>
          </div>
          <div className="text-sm font-medium text-green-700">Closing Stock</div>
          <div className="text-xs text-green-600 mt-1">Total Units</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="today">Today</option>
            <option value="this-week">This Week</option>
            <option value="this-month">This Month</option>
            <option value="last-month">Last Month</option>
            <option value="this-quarter">This Quarter</option>
            <option value="this-year">This Year</option>
          </select>

          <select
            value={selectedWarehouse}
            onChange={(e) => setSelectedWarehouse(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Warehouses</option>
            <option value="main">Main Warehouse</option>
            <option value="rm">RM Store</option>
            <option value="fg">FG Store</option>
            <option value="assembly">Assembly Plant</option>
            <option value="spares">Spares Store</option>
          </select>

          <select
            value={selectedMovementType}
            onChange={(e) => setSelectedMovementType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Movement Types</option>
            <option value="receipts">Receipts Only</option>
            <option value="issues">Issues Only</option>
            <option value="transfers">Transfers Only</option>
          </select>
        </div>
      </div>

      {/* Movement Summary by Warehouse */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-3 py-2 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Movement Summary by Warehouse</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Warehouse</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receipts</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issues</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transfers</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Movement</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Opening Stock</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Closing Stock</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {warehouseData.map((data, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                    <div className="flex items-center space-x-2">
                      <Warehouse className="w-5 h-5 text-gray-400" />
                      <span>{data.warehouse}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm">
                    <div className="flex items-center space-x-1 text-blue-600">
                      <PackageCheck className="w-4 h-4" />
                      <span className="font-medium">{data.receipts}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm">
                    <div className="flex items-center space-x-1 text-orange-600">
                      <PackageMinus className="w-4 h-4" />
                      <span className="font-medium">{data.issues}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm">
                    <div className="flex items-center space-x-1 text-purple-600">
                      <TrendingUp className="w-4 h-4" />
                      <span className="font-medium">{data.transfers}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm">
                    <div className={`flex items-center space-x-1 font-bold ${data.netMovement >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {data.netMovement >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                      <span>{data.netMovement >= 0 ? '+' : ''}{data.netMovement}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {data.openingStock.toLocaleString()}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 font-bold">
                    {data.closingStock.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td className="px-3 py-2 whitespace-nowrap text-sm font-bold text-gray-900">
                  Total
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm font-bold text-blue-600">
                  {totalReceipts}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm font-bold text-orange-600">
                  {totalIssues}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm font-bold text-purple-600">
                  {totalTransfers}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm font-bold text-green-600">
                  {totalReceipts - totalIssues >= 0 ? '+' : ''}{totalReceipts - totalIssues}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm font-bold text-gray-900">
                  {warehouseData.reduce((sum, w) => sum + w.openingStock, 0).toLocaleString()}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm font-bold text-gray-900">
                  {totalClosingStock.toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Movement Type Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900">Receipt Breakdown</h3>
            <PackageCheck className="w-6 h-6 text-blue-600" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Purchase Orders</span>
              <span className="text-sm font-medium text-gray-900">450 units</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Production Output</span>
              <span className="text-sm font-medium text-gray-900">312 units</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Customer Returns</span>
              <span className="text-sm font-medium text-gray-900">85 units</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Transfers In</span>
              <span className="text-sm font-medium text-gray-900">140 units</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900">Issue Breakdown</h3>
            <PackageMinus className="w-6 h-6 text-orange-600" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Production</span>
              <span className="text-sm font-medium text-gray-900">520 units</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Sales Orders</span>
              <span className="text-sm font-medium text-gray-900">285 units</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Projects</span>
              <span className="text-sm font-medium text-gray-900">96 units</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Maintenance</span>
              <span className="text-sm font-medium text-gray-900">20 units</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900">Top Movers</h3>
            <BarChart3 className="w-6 h-6 text-purple-600" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Steel Plates</span>
              <span className="text-sm font-medium text-gray-900">245 movements</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Hydraulic Pumps</span>
              <span className="text-sm font-medium text-gray-900">180 movements</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Control Panels</span>
              <span className="text-sm font-medium text-gray-900">156 movements</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Bearing Assemblies</span>
              <span className="text-sm font-medium text-gray-900">142 movements</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
