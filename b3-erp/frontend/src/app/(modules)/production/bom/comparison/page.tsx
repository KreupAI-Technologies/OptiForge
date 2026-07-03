'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { exportToCsv } from '@/lib/export';
import {
  ArrowLeft,
  GitCompare,
  TrendingUp,
  TrendingDown,
  Equal,
  Plus,
  Minus,
  AlertCircle,
  CheckCircle2,
  Download,
  Package
} from 'lucide-react';
import { ExportComparisonModal } from '@/components/production/bom/BOMExportModals';

interface BOMVersion {
  code: string;
  version: string;
  revision: number;
  date: string;
}

interface ComponentComparison {
  id: string;
  itemCode: string;
  itemName: string;
  category: string;
  changeType: 'unchanged' | 'added' | 'removed' | 'quantity-changed' | 'cost-changed' | 'both-changed';
  version1Quantity: number | null;
  version2Quantity: number | null;
  version1UnitCost: number | null;
  version2UnitCost: number | null;
  version1TotalCost: number | null;
  version2TotalCost: number | null;
  quantityChange: number;
  quantityChangePercent: number;
  costChange: number;
  costChangePercent: number;
  unit: string;
}

export default function BOMComparisonPage() {
  const router = useRouter();

  const [selectedVersion1, setSelectedVersion1] = useState('v2.1-r3');
  const [selectedVersion2, setSelectedVersion2] = useState('v2.0-r2');
  const [filterChanges, setFilterChanges] = useState<'all' | 'changes-only'>('all');
  const [isExportOpen, setIsExportOpen] = useState(false);

  const availableVersions: BOMVersion[] = [
    { code: 'v2.1-r3', version: 'v2.1', revision: 3, date: '2025-09-20' },
    { code: 'v2.0-r2', version: 'v2.0', revision: 2, date: '2025-06-10' },
    { code: 'v1.5-r1', version: 'v1.5', revision: 1, date: '2024-12-01' },
    { code: 'v1.0-r0', version: 'v1.0', revision: 0, date: '2024-06-15' }
  ];

  const productInfo = {
    code: 'KIT-SINK-001',
    name: 'Premium SS304 Kitchen Sink - Double Bowl'
  };

  const comparisons: ComponentComparison[] = [
    {
      id: '1',
      itemCode: 'RM-SS304-18G',
      itemName: 'SS304 Steel Sheet - 18 Gauge',
      category: 'Raw Material',
      changeType: 'cost-changed',
      version1Quantity: 2.5,
      version2Quantity: 2.5,
      version1UnitCost: 195,
      version2UnitCost: 215,
      version1TotalCost: 487.5,
      version2TotalCost: 537.5,
      quantityChange: 0,
      quantityChangePercent: 0,
      costChange: -50,
      costChangePercent: -9.3,
      unit: 'Sq.Ft'
    },
    {
      id: '2',
      itemCode: 'RM-GASKET',
      itemName: 'Silicone Gasket - Food Grade',
      category: 'Raw Material',
      changeType: 'both-changed',
      version1Quantity: 4,
      version2Quantity: 3.5,
      version1UnitCost: 25,
      version2UnitCost: 22,
      version1TotalCost: 100,
      version2TotalCost: 77,
      quantityChange: 0.5,
      quantityChangePercent: 14.3,
      costChange: -23,
      costChangePercent: -23.0,
      unit: 'Meter'
    },
    {
      id: '3',
      itemCode: 'COMP-STRAINER',
      itemName: 'Stainless Steel Strainer Basket',
      category: 'Component',
      changeType: 'unchanged',
      version1Quantity: 2,
      version2Quantity: 2,
      version1UnitCost: 145,
      version2UnitCost: 145,
      version1TotalCost: 290,
      version2TotalCost: 290,
      quantityChange: 0,
      quantityChangePercent: 0,
      costChange: 0,
      costChangePercent: 0,
      unit: 'PC'
    },
    {
      id: '4',
      itemCode: 'COMP-DRAIN-PIPE',
      itemName: 'PVC Drain Pipe - 40mm',
      category: 'Component',
      changeType: 'quantity-changed',
      version1Quantity: 2,
      version2Quantity: 2.5,
      version1UnitCost: 85,
      version2UnitCost: 85,
      version1TotalCost: 170,
      version2TotalCost: 212.5,
      quantityChange: -0.5,
      quantityChangePercent: -20.0,
      costChange: -42.5,
      costChangePercent: -20.0,
      unit: 'Meter'
    },
    {
      id: '5',
      itemCode: 'COMP-DRAIN-VALVE',
      itemName: 'Drain Control Valve - SS',
      category: 'Component',
      changeType: 'unchanged',
      version1Quantity: 2,
      version2Quantity: 2,
      version1UnitCost: 180,
      version2UnitCost: 180,
      version1TotalCost: 360,
      version2TotalCost: 360,
      quantityChange: 0,
      quantityChangePercent: 0,
      costChange: 0,
      costChangePercent: 0,
      unit: 'PC'
    },
    {
      id: '6',
      itemCode: 'COMP-COUPLING',
      itemName: 'Pipe Coupling - Brass',
      category: 'Component',
      changeType: 'cost-changed',
      version1Quantity: 4,
      version2Quantity: 4,
      version1UnitCost: 35,
      version2UnitCost: 38,
      version1TotalCost: 140,
      version2TotalCost: 152,
      quantityChange: 0,
      quantityChangePercent: 0,
      costChange: -12,
      costChangePercent: -7.9,
      unit: 'PC'
    },
    {
      id: '7',
      itemCode: 'COMP-BRACKET',
      itemName: 'SS Mounting Bracket',
      category: 'Component',
      changeType: 'unchanged',
      version1Quantity: 4,
      version2Quantity: 4,
      version1UnitCost: 45,
      version2UnitCost: 45,
      version1TotalCost: 180,
      version2TotalCost: 180,
      quantityChange: 0,
      quantityChangePercent: 0,
      costChange: 0,
      costChangePercent: 0,
      unit: 'PC'
    },
    {
      id: '8',
      itemCode: 'COMP-SCREW-M6',
      itemName: 'SS Screw M6x40mm',
      category: 'Component',
      changeType: 'quantity-changed',
      version1Quantity: 16,
      version2Quantity: 12,
      version1UnitCost: 5,
      version2UnitCost: 5,
      version1TotalCost: 80,
      version2TotalCost: 60,
      quantityChange: 4,
      quantityChangePercent: 33.3,
      costChange: -20,
      costChangePercent: -25.0,
      unit: 'PC'
    },
    {
      id: '9',
      itemCode: 'COMP-WASHER',
      itemName: 'Rubber Washer - 6mm',
      category: 'Component',
      changeType: 'quantity-changed',
      version1Quantity: 16,
      version2Quantity: 12,
      version1UnitCost: 3,
      version2UnitCost: 3,
      version1TotalCost: 48,
      version2TotalCost: 36,
      quantityChange: 4,
      quantityChangePercent: 33.3,
      costChange: -12,
      costChangePercent: -25.0,
      unit: 'PC'
    },
    {
      id: '10',
      itemCode: 'FINISH-CHROME',
      itemName: 'Chrome Plating Finish',
      category: 'Finishing',
      changeType: 'cost-changed',
      version1Quantity: 8,
      version2Quantity: 8,
      version1UnitCost: 120,
      version2UnitCost: 135,
      version1TotalCost: 960,
      version2TotalCost: 1080,
      quantityChange: 0,
      quantityChangePercent: 0,
      costChange: -120,
      costChangePercent: -11.1,
      unit: 'Sq.Ft'
    },
    {
      id: '11',
      itemCode: 'PKG-SINK',
      itemName: 'Sink Packaging Material',
      category: 'Packaging',
      changeType: 'unchanged',
      version1Quantity: 1,
      version2Quantity: 1,
      version1UnitCost: 180,
      version2UnitCost: 180,
      version1TotalCost: 180,
      version2TotalCost: 180,
      quantityChange: 0,
      quantityChangePercent: 0,
      costChange: 0,
      costChangePercent: 0,
      unit: 'SET'
    },
    {
      id: '12',
      itemCode: 'COMP-SEAL-RING',
      itemName: 'Rubber Seal Ring - Premium',
      category: 'Component',
      changeType: 'added',
      version1Quantity: 2,
      version2Quantity: null,
      version1UnitCost: 45,
      version2UnitCost: null,
      version1TotalCost: 90,
      version2TotalCost: null,
      quantityChange: 2,
      quantityChangePercent: 100,
      costChange: 90,
      costChangePercent: 100,
      unit: 'PC'
    },
    {
      id: '13',
      itemCode: 'COMP-OLD-GASKET',
      itemName: 'Standard Gasket - Old Model',
      category: 'Component',
      changeType: 'removed',
      version1Quantity: null,
      version2Quantity: 2,
      version1UnitCost: null,
      version2UnitCost: 28,
      version1TotalCost: null,
      version2TotalCost: 56,
      quantityChange: -2,
      quantityChangePercent: -100,
      costChange: -56,
      costChangePercent: -100,
      unit: 'PC'
    }
  ];

  const filteredComparisons = filterChanges === 'changes-only'
    ? comparisons.filter(c => c.changeType !== 'unchanged')
    : comparisons;

  // Handler functions
  const handleExport = () => {
    setIsExportOpen(true);
  };

  const handleExportSubmit = (_exportConfig: any) => {
    exportToCsv('bom-comparison', filteredComparisons as unknown as Record<string, unknown>[]);
    setIsExportOpen(false);
  };

  const getChangeTypeInfo = (changeType: string) => {
    const types = {
      'unchanged': { color: 'bg-gray-100 text-gray-800', icon: Equal, label: 'Unchanged' },
      'added': { color: 'bg-green-100 text-green-800', icon: Plus, label: 'Added' },
      'removed': { color: 'bg-red-100 text-red-800', icon: Minus, label: 'Removed' },
      'quantity-changed': { color: 'bg-blue-100 text-blue-800', icon: AlertCircle, label: 'Qty Changed' },
      'cost-changed': { color: 'bg-orange-100 text-orange-800', icon: AlertCircle, label: 'Cost Changed' },
      'both-changed': { color: 'bg-purple-100 text-purple-800', icon: AlertCircle, label: 'Both Changed' }
    };
    return types[changeType as keyof typeof types] || types.unchanged;
  };

  const renderChangeIndicator = (change: number, changePercent: number, type: 'quantity' | 'cost') => {
    if (change === 0) return <span className="text-gray-500 text-sm">-</span>;

    const isIncrease = change > 0;
    const Icon = isIncrease ? TrendingUp : TrendingDown;
    const colorClass = isIncrease ? 'text-red-600' : 'text-green-600';

    return (
      <div className={`flex items-center gap-1 ${colorClass}`}>
        <Icon className="h-3 w-3" />
        <span className="text-xs font-medium">
          {isIncrease ? '+' : ''}{type === 'cost' ? '₹' : ''}{Math.abs(change).toLocaleString()}
          {type === 'quantity' ? '' : ''} ({isIncrease ? '+' : ''}{changePercent.toFixed(1)}%)
        </span>
      </div>
    );
  };

  // Calculate summary
  const version1Total = comparisons.reduce((sum, c) => sum + (c.version1TotalCost || 0), 0);
  const version2Total = comparisons.reduce((sum, c) => sum + (c.version2TotalCost || 0), 0);
  const totalCostChange = version1Total - version2Total;
  const totalCostChangePercent = ((totalCostChange / version2Total) * 100);

  const changedComponents = comparisons.filter(c => c.changeType !== 'unchanged').length;
  const addedComponents = comparisons.filter(c => c.changeType === 'added').length;
  const removedComponents = comparisons.filter(c => c.changeType === 'removed').length;

  return (
    <div className="w-full px-3 py-2">
      {/* Inline Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back</span>
          </button>
          <div className="h-6 w-px bg-gray-300" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">BOM Version Comparison</h1>
            <p className="text-sm text-gray-600">Compare components and costs between versions</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
          >
            <Download className="h-4 w-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex items-center gap-3">
          <Package className="h-8 w-8 text-blue-600" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{productInfo.name}</h2>
            <p className="text-sm text-gray-600">{productInfo.code}</p>
          </div>
        </div>
      </div>

      {/* Version Selection */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Version 1 (Newer)</label>
            <select
              value={selectedVersion1}
              onChange={(e) => setSelectedVersion1(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {availableVersions.map(v => (
                <option key={v.code} value={v.code}>
                  {v.version} Rev {v.revision} - {v.date}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-center">
            <GitCompare className="h-8 w-8 text-gray-400" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Version 2 (Older)</label>
            <select
              value={selectedVersion2}
              onChange={(e) => setSelectedVersion2(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {availableVersions.map(v => (
                <option key={v.code} value={v.code}>
                  {v.version} Rev {v.revision} - {v.date}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="changesOnly"
              checked={filterChanges === 'changes-only'}
              onChange={(e) => setFilterChanges(e.target.checked ? 'changes-only' : 'all')}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="changesOnly" className="text-sm text-gray-700">Show changes only</label>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-900">Total Changes</span>
            <AlertCircle className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-900">{changedComponents}</div>
          <div className="text-xs text-blue-700 mt-1">Components modified</div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-green-900">Added</span>
            <Plus className="h-5 w-5 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-900">{addedComponents}</div>
          <div className="text-xs text-green-700 mt-1">New components</div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-red-900">Removed</span>
            <Minus className="h-5 w-5 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-red-900">{removedComponents}</div>
          <div className="text-xs text-red-700 mt-1">Components removed</div>
        </div>

        <div className={`bg-gradient-to-br ${totalCostChange >= 0 ? 'from-green-50 to-green-100' : 'from-red-50 to-red-100'} rounded-lg p-3`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-medium ${totalCostChange >= 0 ? 'text-green-900' : 'text-red-900'}`}>Cost Impact</span>
            {totalCostChange >= 0 ? <TrendingDown className="h-5 w-5 text-green-600" /> : <TrendingUp className="h-5 w-5 text-red-600" />}
          </div>
          <div className={`text-2xl font-bold ${totalCostChange >= 0 ? 'text-green-900' : 'text-red-900'}`}>
            {totalCostChange >= 0 ? '-' : '+'}₹{Math.abs(totalCostChange).toLocaleString()}
          </div>
          <div className={`text-xs ${totalCostChange >= 0 ? 'text-green-700' : 'text-red-700'} mt-1`}>
            {totalCostChange >= 0 ? '' : '+'}{totalCostChangePercent.toFixed(1)}% change
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Component
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Change Type
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" colSpan={2}>
                  Version 1 ({selectedVersion1})
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" colSpan={2}>
                  Version 2 ({selectedVersion2})
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Qty Change
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost Change
                </th>
              </tr>
              <tr className="bg-gray-50">
                <th></th>
                <th></th>
                <th className="px-4 py-2 text-xs font-medium text-gray-500">Quantity</th>
                <th className="px-4 py-2 text-xs font-medium text-gray-500">Total Cost</th>
                <th className="px-4 py-2 text-xs font-medium text-gray-500">Quantity</th>
                <th className="px-4 py-2 text-xs font-medium text-gray-500">Total Cost</th>
                <th></th>
                <th></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredComparisons.map((comp) => {
                const typeInfo = getChangeTypeInfo(comp.changeType);
                const TypeIcon = typeInfo.icon;
                return (
                  <tr key={comp.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{comp.itemName}</div>
                        <div className="text-xs text-gray-500">{comp.itemCode} - {comp.category}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${typeInfo.color}`}>
                        <TypeIcon className="h-3 w-3" />
                        {typeInfo.label}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      {comp.version1Quantity !== null ? (
                        <span className="text-sm text-gray-900">{comp.version1Quantity} {comp.unit}</span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-center">
                      {comp.version1TotalCost !== null ? (
                        <span className="text-sm font-medium text-gray-900">₹{comp.version1TotalCost.toLocaleString()}</span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-center">
                      {comp.version2Quantity !== null ? (
                        <span className="text-sm text-gray-900">{comp.version2Quantity} {comp.unit}</span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-center">
                      {comp.version2TotalCost !== null ? (
                        <span className="text-sm font-medium text-gray-900">₹{comp.version2TotalCost.toLocaleString()}</span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      {renderChangeIndicator(comp.quantityChange, comp.quantityChangePercent, 'quantity')}
                    </td>
                    <td className="px-4 py-4">
                      {renderChangeIndicator(comp.costChange, comp.costChangePercent, 'cost')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-gray-50 border-t-2 border-gray-300">
              <tr>
                <td colSpan={3} className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                  Total Manufacturing Cost:
                </td>
                <td className="px-4 py-3 text-center text-sm font-bold text-blue-900">
                  ₹{version1Total.toLocaleString()}
                </td>
                <td className="px-4 py-3"></td>
                <td className="px-4 py-3 text-center text-sm font-bold text-blue-900">
                  ₹{version2Total.toLocaleString()}
                </td>
                <td className="px-4 py-3"></td>
                <td className="px-4 py-3">
                  <div className={`flex items-center gap-1 ${totalCostChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {totalCostChange >= 0 ? <TrendingDown className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
                    <span className="text-sm font-bold">
                      {totalCostChange >= 0 ? '-' : '+'}₹{Math.abs(totalCostChange).toLocaleString()}
                    </span>
                  </div>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-4 text-sm text-gray-600">
        Showing {filteredComparisons.length} of {comparisons.length} components
      </div>

      {/* Modal */}
      <ExportComparisonModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        onExport={handleExportSubmit}
        dateRange={{
          from: availableVersions.find(v => v.code === selectedVersion2)?.date || '',
          to: availableVersions.find(v => v.code === selectedVersion1)?.date || ''
        }}
      />
    </div>
  );
}
