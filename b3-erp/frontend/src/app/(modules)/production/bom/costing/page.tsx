'use client';

import { useState, useEffect } from 'react';
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
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { ProductionOrphanService } from '@/services/production/production-orphan.service';
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

  // Cost components — primary table, wired to production/bom
  const [costComponents, setCostComponents] = useState<CostComponent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const res = await ProductionOrphanService.getBoms();
        const raw: any[] = Array.isArray(res) ? res : (res?.data ?? res?.items ?? []);
        // BOM records may expose line items under components/items/lines; fall back
        // to treating each BOM record itself as a costed row.
        const rows: any[] = raw.flatMap((b) => {
          const lines = b.components ?? b.items ?? b.lines ?? b.costComponents;
          return Array.isArray(lines) && lines.length ? lines : [b];
        });
        const mapped: CostComponent[] = rows.map((c, idx) => {
          const quantity = Number(c.quantity ?? c.qty ?? 0);
          const unitCost = Number(c.unitCost ?? c.rate ?? c.cost ?? 0);
          const totalCost = Number(c.totalCost ?? c.amount ?? quantity * unitCost);
          const rawType = String(c.costType ?? c.type ?? 'material').toLowerCase();
          const costType: CostComponent['costType'] =
            rawType === 'labor' || rawType === 'overhead' || rawType === 'subcontract'
              ? (rawType as CostComponent['costType'])
              : 'material';
          return {
            id: String(c.id ?? c.bomId ?? idx + 1),
            itemCode: c.itemCode ?? c.code ?? c.bomCode ?? c.materialCode ?? '-',
            itemName: c.itemName ?? c.name ?? c.description ?? c.productName ?? '-',
            category: c.category ?? '-',
            quantity,
            unit: c.unit ?? c.uom ?? '',
            unitCost,
            totalCost,
            costType,
            percentage: Number(c.percentage ?? 0),
            supplier: c.supplier ?? c.vendor ?? '-',
            lastUpdated: (c.lastUpdated ?? c.updatedAt ?? c.createdAt ?? '').toString().slice(0, 10),
          };
        });
        if (!cancelled) setCostComponents(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load BOM cost components');
          setCostComponents([]);
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

      {/* Load status banners */}
      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading BOM cost components…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}
      {!isLoading && !loadError && costComponents.length === 0 && (
        <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          No cost components found.
        </div>
      )}

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
