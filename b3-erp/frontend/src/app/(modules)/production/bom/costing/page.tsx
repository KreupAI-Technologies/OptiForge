'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { exportToCsv } from '@/lib/export';
import {
  ArrowLeft,
  Search,
  IndianRupee,
  Package,
  Users,
  Settings,
  TrendingUp,
  Calculator,
  Layers,
  PieChart,
  Download,
  RefreshCw
} from 'lucide-react';
import { RecalculateCostsModal } from '@/components/production/bom/BOMCostingModals';
import { ExportCostingModal } from '@/components/production/bom/BOMExportModals';

interface CostComponent {
  id: string;
  itemCode: string;
  itemName: string;
  category: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
  costType: 'material' | 'labor' | 'overhead' | 'subcontract';
  percentage: number;
  supplier: string;
  lastUpdated: string;
}

interface CostSummary {
  totalMaterialCost: number;
  totalLaborCost: number;
  totalOverheadCost: number;
  totalSubcontractCost: number;
  totalManufacturingCost: number;
  targetMargin: number;
  sellingPrice: number;
}

export default function BOMCostingPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCostType, setFilterCostType] = useState<'all' | 'material' | 'labor' | 'overhead' | 'subcontract'>('all');
  const [selectedProduct, setSelectedProduct] = useState('KIT-SINK-001');
  const [isRecalculateOpen, setIsRecalculateOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  const products = [
    { code: 'KIT-SINK-001', name: 'Premium SS304 Kitchen Sink - Double Bowl' },
    { code: 'KIT-APPL-001', name: 'Auto-Clean Kitchen Chimney - 90cm' },
    { code: 'KIT-CAB-001', name: 'Modular Base Cabinet - 3 Drawer' },
    { code: 'KIT-FAUC-001', name: 'Chrome Finish Kitchen Faucet - Single Lever' }
  ];

  const costComponents: CostComponent[] = [
    // Materials
    {
      id: '1',
      itemCode: 'RM-SS304-18G',
      itemName: 'SS304 Steel Sheet - 18 Gauge',
      category: 'Raw Material',
      quantity: 2.5,
      unit: 'Sq.Ft',
      unitCost: 195,
      totalCost: 487.5,
      costType: 'material',
      percentage: 4.3,
      supplier: 'Steel India',
      lastUpdated: '2025-10-15'
    },
    {
      id: '2',
      itemCode: 'RM-GASKET',
      itemName: 'Silicone Gasket - Food Grade',
      category: 'Raw Material',
      quantity: 4,
      unit: 'Meter',
      unitCost: 25,
      totalCost: 100,
      costType: 'material',
      percentage: 0.9,
      supplier: 'Rubber Products Ltd',
      lastUpdated: '2025-10-12'
    },
    {
      id: '3',
      itemCode: 'COMP-STRAINER',
      itemName: 'Stainless Steel Strainer Basket',
      category: 'Component',
      quantity: 2,
      unit: 'PC',
      unitCost: 145,
      totalCost: 290,
      costType: 'material',
      percentage: 2.6,
      supplier: 'Kitchen Components Co',
      lastUpdated: '2025-10-10'
    },
    {
      id: '4',
      itemCode: 'COMP-DRAIN-PIPE',
      itemName: 'PVC Drain Pipe - 40mm',
      category: 'Component',
      quantity: 2,
      unit: 'Meter',
      unitCost: 85,
      totalCost: 170,
      costType: 'material',
      percentage: 1.5,
      supplier: 'PVC Suppliers',
      lastUpdated: '2025-10-08'
    },
    {
      id: '5',
      itemCode: 'COMP-DRAIN-VALVE',
      itemName: 'Drain Control Valve - SS',
      category: 'Component',
      quantity: 2,
      unit: 'PC',
      unitCost: 180,
      totalCost: 360,
      costType: 'material',
      percentage: 3.2,
      supplier: 'Valve Technologies',
      lastUpdated: '2025-10-05'
    },
    {
      id: '6',
      itemCode: 'COMP-BRACKET',
      itemName: 'SS Mounting Bracket',
      category: 'Component',
      quantity: 4,
      unit: 'PC',
      unitCost: 45,
      totalCost: 180,
      costType: 'material',
      percentage: 1.6,
      supplier: 'Metal Fabricators',
      lastUpdated: '2025-10-01'
    },
    {
      id: '7',
      itemCode: 'COMP-FASTENERS',
      itemName: 'Fasteners Kit (Screws, Washers)',
      category: 'Component',
      quantity: 1,
      unit: 'SET',
      unitCost: 128,
      totalCost: 128,
      costType: 'material',
      percentage: 1.1,
      supplier: 'Fasteners Direct',
      lastUpdated: '2025-09-28'
    },
    {
      id: '8',
      itemCode: 'PKG-SINK',
      itemName: 'Sink Packaging Material',
      category: 'Packaging',
      quantity: 1,
      unit: 'SET',
      unitCost: 180,
      totalCost: 180,
      costType: 'material',
      percentage: 1.6,
      supplier: 'Packaging Solutions',
      lastUpdated: '2025-09-25'
    },

    // Labor
    {
      id: '9',
      itemCode: 'LAB-WELD-SS',
      itemName: 'SS Welding - Bowl Assembly',
      category: 'Direct Labor',
      quantity: 2.5,
      unit: 'Hours',
      unitCost: 485,
      totalCost: 1212.5,
      costType: 'labor',
      percentage: 10.8,
      supplier: 'In-House',
      lastUpdated: '2025-10-15'
    },
    {
      id: '10',
      itemCode: 'LAB-POLISH',
      itemName: 'Surface Polishing & Finishing',
      category: 'Direct Labor',
      quantity: 1.5,
      unit: 'Hours',
      unitCost: 420,
      totalCost: 630,
      costType: 'labor',
      percentage: 5.6,
      supplier: 'In-House',
      lastUpdated: '2025-10-15'
    },

    // Overhead
    {
      id: '11',
      itemCode: 'OH-ELEC',
      itemName: 'Electricity - Production',
      category: 'Manufacturing Overhead',
      quantity: 3.2,
      unit: 'Units',
      unitCost: 180,
      totalCost: 576,
      costType: 'overhead',
      percentage: 5.1,
      supplier: 'Utility Provider',
      lastUpdated: '2025-10-01'
    },
    {
      id: '12',
      itemCode: 'OH-MAINT',
      itemName: 'Equipment Maintenance Allocation',
      category: 'Manufacturing Overhead',
      quantity: 1,
      unit: 'Unit',
      unitCost: 285,
      totalCost: 285,
      costType: 'overhead',
      percentage: 2.5,
      supplier: 'In-House',
      lastUpdated: '2025-10-01'
    },
    {
      id: '13',
      itemCode: 'OH-QC',
      itemName: 'Quality Control & Inspection',
      category: 'Manufacturing Overhead',
      quantity: 1,
      unit: 'Unit',
      unitCost: 195,
      totalCost: 195,
      costType: 'overhead',
      percentage: 1.7,
      supplier: 'In-House',
      lastUpdated: '2025-10-01'
    },

    // Subcontract
    {
      id: '14',
      itemCode: 'SUB-CHROME',
      itemName: 'Chrome Plating Service',
      category: 'Subcontract Work',
      quantity: 8,
      unit: 'Sq.Ft',
      unitCost: 120,
      totalCost: 960,
      costType: 'subcontract',
      percentage: 8.5,
      supplier: 'Chrome Solutions',
      lastUpdated: '2025-10-18'
    }
  ];

  const costSummary: CostSummary = {
    totalMaterialCost: costComponents.filter(c => c.costType === 'material').reduce((sum, c) => sum + c.totalCost, 0),
    totalLaborCost: costComponents.filter(c => c.costType === 'labor').reduce((sum, c) => sum + c.totalCost, 0),
    totalOverheadCost: costComponents.filter(c => c.costType === 'overhead').reduce((sum, c) => sum + c.totalCost, 0),
    totalSubcontractCost: costComponents.filter(c => c.costType === 'subcontract').reduce((sum, c) => sum + c.totalCost, 0),
    totalManufacturingCost: 0,
    targetMargin: 48.5,
    sellingPrice: 0
  };

  costSummary.totalManufacturingCost =
    costSummary.totalMaterialCost +
    costSummary.totalLaborCost +
    costSummary.totalOverheadCost +
    costSummary.totalSubcontractCost;

  costSummary.sellingPrice = costSummary.totalManufacturingCost * (1 + costSummary.targetMargin / 100);

  const filteredComponents = costComponents.filter(comp => {
    const matchesSearch =
      comp.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comp.itemName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCostType = filterCostType === 'all' || comp.costType === filterCostType;

    return matchesSearch && matchesCostType;
  });

  const getCostTypeBadge = (costType: string) => {
    const badges = {
      material: { color: 'bg-blue-100 text-blue-800', icon: Package },
      labor: { color: 'bg-green-100 text-green-800', icon: Users },
      overhead: { color: 'bg-purple-100 text-purple-800', icon: Settings },
      subcontract: { color: 'bg-orange-100 text-orange-800', icon: Layers }
    };
    return badges[costType as keyof typeof badges] || badges.material;
  };

  // Modal handlers
  const handleRecalculate = () => {
    setIsRecalculateOpen(true);
  };

  const handleExport = () => {
    setIsExportOpen(true);
  };

  const handleRecalculateSubmit = (options: any) => {
    console.log('Recalculate options:', options);
    // TODO: Implement API call to recalculate costs
    setIsRecalculateOpen(false);
  };

  const handleExportSubmit = (_config: any) => {
    exportToCsv('bom-costing', filteredComponents as unknown as Record<string, unknown>[]);
    setIsExportOpen(false);
  };

  const materialPercent = (costSummary.totalMaterialCost / costSummary.totalManufacturingCost) * 100;
  const laborPercent = (costSummary.totalLaborCost / costSummary.totalManufacturingCost) * 100;
  const overheadPercent = (costSummary.totalOverheadCost / costSummary.totalManufacturingCost) * 100;
  const subcontractPercent = (costSummary.totalSubcontractCost / costSummary.totalManufacturingCost) * 100;

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
            <h1 className="text-2xl font-bold text-gray-900">BOM Costing Analysis</h1>
            <p className="text-sm text-gray-600">Detailed cost breakdown and margin calculation</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRecalculate}
            className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
          >
            <RefreshCw className="h-4 w-4" />
            Recalculate
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Product Selection */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Product</label>
        <select
          value={selectedProduct}
          onChange={(e) => setSelectedProduct(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {products.map(product => (
            <option key={product.code} value={product.code}>
              {product.code} - {product.name}
            </option>
          ))}
        </select>
      </div>

      {/* Cost Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-900">Material Cost</span>
            <Package className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-900">₹{(costSummary.totalMaterialCost / 1000).toFixed(1)}K</div>
          <div className="text-xs text-blue-700 mt-1">{materialPercent.toFixed(1)}% of total</div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-green-900">Labor Cost</span>
            <Users className="h-5 w-5 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-900">₹{(costSummary.totalLaborCost / 1000).toFixed(1)}K</div>
          <div className="text-xs text-green-700 mt-1">{laborPercent.toFixed(1)}% of total</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-purple-900">Overhead Cost</span>
            <Settings className="h-5 w-5 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-900">₹{(costSummary.totalOverheadCost / 1000).toFixed(1)}K</div>
          <div className="text-xs text-purple-700 mt-1">{overheadPercent.toFixed(1)}% of total</div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-orange-900">Subcontract</span>
            <Layers className="h-5 w-5 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-orange-900">₹{(costSummary.totalSubcontractCost / 1000).toFixed(1)}K</div>
          <div className="text-xs text-orange-700 mt-1">{subcontractPercent.toFixed(1)}% of total</div>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-indigo-900">Total Mfg Cost</span>
            <Calculator className="h-5 w-5 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-indigo-900">₹{(costSummary.totalManufacturingCost / 1000).toFixed(1)}K</div>
          <div className="text-xs text-indigo-700 mt-1">Base cost</div>
        </div>
      </div>

      {/* Cost Breakdown Chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <PieChart className="h-5 w-5 text-blue-600" />
            Cost Distribution
          </h3>
          <div className="space-y-2">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-700">Material Cost</span>
                <span className="text-sm font-medium text-gray-900">{materialPercent.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-blue-600 h-3 rounded-full" style={{ width: `${materialPercent}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-700">Labor Cost</span>
                <span className="text-sm font-medium text-gray-900">{laborPercent.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-green-600 h-3 rounded-full" style={{ width: `${laborPercent}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-700">Overhead Cost</span>
                <span className="text-sm font-medium text-gray-900">{overheadPercent.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-purple-600 h-3 rounded-full" style={{ width: `${overheadPercent}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-700">Subcontract Cost</span>
                <span className="text-sm font-medium text-gray-900">{subcontractPercent.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-orange-600 h-3 rounded-full" style={{ width: `${subcontractPercent}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Pricing Calculation
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <span className="text-sm text-gray-700">Manufacturing Cost</span>
              <span className="text-sm font-medium text-gray-900">₹{costSummary.totalManufacturingCost.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <span className="text-sm text-gray-700">Target Margin</span>
              <span className="text-sm font-medium text-orange-900">{costSummary.targetMargin.toFixed(1)}%</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <span className="text-sm text-gray-700">Margin Amount</span>
              <span className="text-sm font-medium text-green-900">
                ₹{(costSummary.sellingPrice - costSummary.totalManufacturingCost).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between py-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg px-4 mt-4">
              <span className="text-base font-semibold text-blue-900">Suggested Selling Price</span>
              <span className="text-xl font-bold text-blue-900">₹{costSummary.sellingPrice.toLocaleString()}</span>
            </div>
            <div className="mt-4 text-xs text-gray-600">
              * Margin calculated on manufacturing cost
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search components..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterCostType}
            onChange={(e) => setFilterCostType(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Cost Types</option>
            <option value="material">Material</option>
            <option value="labor">Labor</option>
            <option value="overhead">Overhead</option>
            <option value="subcontract">Subcontract</option>
          </select>
        </div>
      </div>

      {/* Cost Components Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Component
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit Cost
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Cost
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  % of Total
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Supplier
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Updated
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredComponents.map((comp) => {
                const typeInfo = getCostTypeBadge(comp.costType);
                const TypeIcon = typeInfo.icon;
                return (
                  <tr key={comp.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{comp.itemName}</div>
                        <div className="text-xs text-gray-500">{comp.itemCode}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${typeInfo.color}`}>
                        <TypeIcon className="h-3 w-3" />
                        {comp.costType}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-900">{comp.quantity} {comp.unit}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-900">₹{comp.unitCost.toLocaleString()}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm font-medium text-blue-900">₹{comp.totalCost.toLocaleString()}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2" style={{ minWidth: '60px' }}>
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${Math.min(comp.percentage * 10, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-600">{comp.percentage.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-700">{comp.supplier}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs text-gray-600">{comp.lastUpdated}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-gray-50 border-t-2 border-gray-300">
              <tr>
                <td colSpan={4} className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                  Total Manufacturing Cost:
                </td>
                <td className="px-4 py-3 text-sm font-bold text-indigo-900">
                  ₹{costSummary.totalManufacturingCost.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">100.0%</td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-4 text-sm text-gray-600">
        Showing {filteredComponents.length} of {costComponents.length} cost components
      </div>

      {/* Modals */}
      <RecalculateCostsModal
        isOpen={isRecalculateOpen}
        onClose={() => setIsRecalculateOpen(false)}
        onRecalculate={handleRecalculateSubmit}
        currentCosts={{
          material: costSummary.totalMaterialCost,
          labor: costSummary.totalLaborCost,
          overhead: costSummary.totalOverheadCost,
          total: costSummary.totalManufacturingCost
        }}
      />

      <ExportCostingModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        onExport={handleExportSubmit}
      />
    </div>
  );
}
