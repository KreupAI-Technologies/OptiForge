'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ProductionOrphanService } from '@/services/production/production-orphan.service';
import {
  ArrowLeft,
  Edit,
  Copy,
  GitBranch,
  Power,
  Download,
  Printer,
  Package,
  Layers,
  IndianRupee,
  Percent,
  Calendar,
  User,
  CheckCircle,
  Clock,
  FileText,
  ChevronDown,
  ChevronRight,
  Box,
  Wrench,
  ShoppingCart,
  AlertTriangle,
  TrendingUp,
  PieChart,
  BarChart3,
  ListTree,
  Network,
  Factory,
  CircleDot,
  Minus,
  Plus,
  Link2,
  Activity,
} from 'lucide-react';

interface BOMComponent {
  id: string;
  level: number;
  itemCode: string;
  itemName: string;
  description: string;
  quantity: number;
  uom: string;
  itemType: 'raw_material' | 'component' | 'semi_finished' | 'assembly' | 'purchased_part';
  stockAvailable: number;
  stockStatus: 'available' | 'shortage' | 'out_of_stock';
  costPerUnit: number;
  extendedCost: number;
  makeOrBuy: 'make' | 'buy';
  scrapPercent: number;
  isRequired: boolean;
  isPhantom: boolean;
  alternatives?: string[];
  children?: BOMComponent[];
  expanded?: boolean;
  referenceDesignator?: string;
  supplierPreference?: string;
  leadTime?: number;
}

interface BOM {
  id: string;
  bomNumber: string;
  productCode: string;
  productName: string;
  productDescription: string;
  drawingNumber: string;
  version: string;
  revision: string;
  status: 'active' | 'inactive' | 'under_review' | 'obsolete';
  bomType: 'manufacturing' | 'engineering' | 'planning' | 'costing';
  productCategory: 'finished_good' | 'semi_finished' | 'assembly' | 'sub_assembly';
  effectiveDate: string;
  expiryDate?: string;
  batchSize: number;
  leadTime: number;
  scrapPercentage: number;
  uom: string;
  totalComponents: number;
  totalLevels: number;
  totalCost: number;
  createdBy: string;
  createdDate: string;
  approvedBy?: string;
  approvedDate?: string;
  notes: string;
  specifications: string;
  components: BOMComponent[];
}

interface CostBreakdown {
  materialCost: number;
  laborCost: number;
  overheadCost: number;
  scrapCost: number;
  totalCost: number;
}

interface CostByCategory {
  category: string;
  cost: number;
  percentage: number;
}

interface WhereUsedItem {
  productCode: string;
  productName: string;
  bomNumber: string;
  quantity: number;
  level: number;
  status: string;
}

interface WorkOrderUsage {
  woNumber: string;
  productName: string;
  quantity: number;
  status: 'active' | 'completed' | 'planned';
  startDate: string;
  dueDate: string;
}

const statusColors = {
  active: 'bg-green-100 text-green-700 border-green-300',
  inactive: 'bg-gray-100 text-gray-700 border-gray-300',
  under_review: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  obsolete: 'bg-red-100 text-red-700 border-red-300',
};

const statusLabels = {
  active: 'Active',
  inactive: 'Inactive',
  under_review: 'Under Review',
  obsolete: 'Obsolete',
};

const bomTypeLabels = {
  manufacturing: 'Manufacturing BOM',
  engineering: 'Engineering BOM',
  planning: 'Planning BOM',
  costing: 'Costing BOM',
};

const productCategoryLabels = {
  finished_good: 'Finished Good',
  semi_finished: 'Semi-Finished',
  assembly: 'Assembly',
  sub_assembly: 'Sub-Assembly',
};

const itemTypeColors = {
  raw_material: 'bg-orange-100 text-orange-700',
  component: 'bg-blue-100 text-blue-700',
  semi_finished: 'bg-purple-100 text-purple-700',
  assembly: 'bg-teal-100 text-teal-700',
  purchased_part: 'bg-pink-100 text-pink-700',
};

const itemTypeLabels = {
  raw_material: 'Raw Material',
  component: 'Component',
  semi_finished: 'Semi-Finished',
  assembly: 'Assembly',
  purchased_part: 'Purchased Part',
};

const stockStatusColors = {
  available: 'text-green-600',
  shortage: 'text-orange-600',
  out_of_stock: 'text-red-600',
};

const stockStatusIcons = {
  available: CheckCircle,
  shortage: AlertTriangle,
  out_of_stock: AlertTriangle,
};

// Map a raw BOM record from the backend into the BOM shape the UI renders.
function normaliseBom(r: any, id: string): BOM {
  return {
    id: String(r.id ?? id),
    bomNumber: r.bomNumber ?? r.bom_number ?? '',
    productCode: r.productCode ?? r.product_code ?? '',
    productName: r.productName ?? r.product_name ?? '',
    productDescription: r.productDescription ?? r.product_description ?? '',
    drawingNumber: r.drawingNumber ?? r.drawing_number ?? '',
    version: r.version ?? '',
    revision: r.revision ?? '',
    status: (r.status ?? 'active') as BOM['status'],
    bomType: (r.bomType ?? r.bom_type ?? 'manufacturing') as BOM['bomType'],
    productCategory: (r.productCategory ?? r.product_category ?? 'finished_good') as BOM['productCategory'],
    effectiveDate: r.effectiveDate ?? r.effective_date ?? '',
    expiryDate: r.expiryDate ?? r.expiry_date,
    batchSize: r.batchSize ?? r.batch_size ?? 0,
    leadTime: r.leadTime ?? r.lead_time ?? 0,
    scrapPercentage: r.scrapPercentage ?? r.scrap_percentage ?? 0,
    uom: r.uom ?? '',
    totalComponents: r.totalComponents ?? r.total_components ?? (Array.isArray(r.components) ? r.components.length : 0),
    totalLevels: r.totalLevels ?? r.total_levels ?? 0,
    totalCost: r.totalCost ?? r.total_cost ?? 0,
    createdBy: r.createdBy ?? r.created_by ?? '',
    createdDate: r.createdDate ?? r.created_date ?? '',
    approvedBy: r.approvedBy ?? r.approved_by,
    approvedDate: r.approvedDate ?? r.approved_date,
    notes: r.notes ?? '',
    specifications: r.specifications ?? '',
    components: Array.isArray(r.components) ? (r.components as BOMComponent[]) : [],
  };
}

export default function BOMViewPage() {
  const router = useRouter();
  const params = useParams();
  const [activeTab, setActiveTab] = useState<'overview' | 'tree' | 'cost' | 'where_used'>('overview');
  const [bom, setBom] = useState<BOM | null>(null);
  const [expandedComponents, setExpandedComponents] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const bomId = params.id as string;

  // NEEDS-BACKEND: the BOM detail endpoint returns only the BOM header (+components
  // if present). There is no endpoint for cost breakdown, cost-by-category,
  // top-expensive components, where-used, work-order usage, or an activity timeline,
  // so those sections render empty until such endpoints exist. No mock/sample data.
  const costBreakdown: CostBreakdown | null = null;
  const whereUsedData: WhereUsedItem[] = [];
  const workOrderUsage: WorkOrderUsage[] = [];
  const activityTimeline: { date: string; user: string; action: string }[] = [];

  const loadBom = () => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setNotFound(false);
    ProductionOrphanService.getBom(bomId)
      .then((data) => {
        if (cancelled) return;
        if (!data || (typeof data === 'object' && Object.keys(data).length === 0)) {
          setNotFound(true);
          return;
        }
        setBom(normaliseBom(data, bomId));
      })
      .catch((e) => {
        if (!cancelled) setError(e?.message || 'Failed to load BOM');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  };

  useEffect(() => {
    const cleanup = loadBom();
    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bomId]);

  const toggleComponent = (id: string) => {
    const newExpanded = new Set(expandedComponents);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedComponents(newExpanded);
  };

  const renderComponentTreeRow = (component: BOMComponent): JSX.Element[] => {
    const isExpanded = expandedComponents.has(component.id);
    const hasChildren = component.children && component.children.length > 0;
    const StockIcon = stockStatusIcons[component.stockStatus];

    const rows: JSX.Element[] = [
      <tr key={component.id} className="hover:bg-gray-50 border-b border-gray-200">
        <td className="px-4 py-3">
          <div className="flex items-center space-x-2" style={{ paddingLeft: `${component.level * 24}px` }}>
            {hasChildren ? (
              <button
                onClick={() => toggleComponent(component.id)}
                className="p-0.5 hover:bg-gray-200 rounded"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-gray-600" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-600" />
                )}
              </button>
            ) : (
              <span className="w-5"></span>
            )}
            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
              {component.level}
            </span>
          </div>
        </td>
        <td className="px-4 py-3">
          <div className="font-mono text-sm font-semibold text-gray-900">{component.itemCode}</div>
          <div className="text-sm text-gray-600 mt-0.5">{component.itemName}</div>
          <div className="text-xs text-gray-500 mt-0.5">{component.description}</div>
          {component.isPhantom && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700 mt-1">
              Phantom
            </span>
          )}
          {!component.isRequired && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 mt-1 ml-1">
              Optional
            </span>
          )}
        </td>
        <td className="px-4 py-3 text-center">
          <div className="font-semibold text-gray-900">{component.quantity}</div>
        </td>
        <td className="px-4 py-3 text-center">
          <span className="text-sm text-gray-700">{component.uom}</span>
        </td>
        <td className="px-4 py-3">
          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${itemTypeColors[component.itemType]}`}>
            {itemTypeLabels[component.itemType]}
          </span>
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center space-x-1">
            <StockIcon className={`h-4 w-4 ${stockStatusColors[component.stockStatus]}`} />
            <span className={`text-sm font-semibold ${stockStatusColors[component.stockStatus]}`}>
              {component.stockAvailable}
            </span>
          </div>
        </td>
        <td className="px-4 py-3 text-right">
          <div className="flex items-center justify-end text-gray-900">
            <IndianRupee className="h-3.5 w-3.5" />
            <span className="font-semibold">{component.costPerUnit.toFixed(2)}</span>
          </div>
        </td>
        <td className="px-4 py-3 text-right">
          <div className="flex items-center justify-end text-blue-900 font-bold">
            <IndianRupee className="h-4 w-4" />
            <span>{component.extendedCost.toFixed(2)}</span>
          </div>
        </td>
        <td className="px-4 py-3 text-center">
          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${component.makeOrBuy === 'make' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
            }`}>
            {component.makeOrBuy === 'make' ? 'Make' : 'Buy'}
          </span>
        </td>
        <td className="px-4 py-3">
          {component.alternatives && component.alternatives.length > 0 && (
            <div className="text-xs text-gray-600">
              {component.alternatives.map((alt, idx) => (
                <div key={idx} className="flex items-center space-x-1">
                  <Link2 className="h-3 w-3" />
                  <span>{alt}</span>
                </div>
              ))}
            </div>
          )}
        </td>
      </tr>
    ];

    if (isExpanded && hasChildren && component.children) {
      component.children.forEach((child) => {
        rows.push(...renderComponentTreeRow(child));
      });
    }

    return rows;
  };

  const calculateTotalRolledUpCost = (components: BOMComponent[]): number => {
    let total = 0;
    components.forEach((comp) => {
      total += comp.extendedCost;
      if (comp.children) {
        total += calculateTotalRolledUpCost(comp.children);
      }
    });
    return total;
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center px-4 py-6">
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">
          Loading BOM…
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-3 px-4 py-6">
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          {error}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadBom}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
          <button
            onClick={() => router.push('/production/bom')}
            className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to BOM List
          </button>
        </div>
      </div>
    );
  }

  if (notFound || !bom) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-3 px-4 py-6">
        <div className="text-center">
          <ListTree className="h-10 w-10 text-gray-400 mb-2 mx-auto" />
          <h3 className="text-lg font-semibold text-gray-900">BOM not found</h3>
          <p className="text-sm text-gray-600 mt-1">No BOM exists for ID {bomId}.</p>
        </div>
        <button
          onClick={() => router.push('/production/bom')}
          className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to BOM List
        </button>
      </div>
    );
  }

  return (
    <div className="w-full h-full px-4 py-2">
      {/* Header */}
      <div className="mb-3">
        <button
          onClick={() => router.push('/production/bom')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to BOM List</span>
        </button>

        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className="h-16 w-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <ListTree className="h-8 w-8 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-bold text-gray-900">{bom.bomNumber}</h1>
                <span className={`px-3 py-1 text-sm font-semibold rounded-full border ${statusColors[bom.status]}`}>
                  {statusLabels[bom.status]}
                </span>
              </div>
              <p className="text-lg text-gray-700 mt-1 font-semibold">{bom.productName}</p>
              <p className="text-sm text-gray-500 mt-0.5">{bom.productCode}</p>
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <GitBranch className="h-4 w-4" />
                  <span>{bom.version} / {bom.revision}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <FileText className="h-4 w-4" />
                  <span>{bom.drawingNumber}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => router.push(`/production/bom/edit/${params.id}`)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Edit className="h-4 w-4" />
              <span>Edit</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Copy className="h-4 w-4" />
              <span>Copy</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <GitBranch className="h-4 w-4" />
              <span>New Version</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Power className="h-4 w-4" />
              <span>{bom.status === 'active' ? 'Deactivate' : 'Activate'}</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Printer className="h-4 w-4" />
              <span>Print</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Components</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{bom.totalComponents}</p>
            </div>
            <Package className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Total Levels</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">{bom.totalLevels}</p>
            </div>
            <Layers className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Total Cost</p>
              <div className="flex items-center text-2xl font-bold text-green-900 mt-1">
                <IndianRupee className="h-5 w-5" />
                <span>{bom.totalCost.toFixed(2)}</span>
              </div>
            </div>
            <IndianRupee className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Scrap %</p>
              <p className="text-2xl font-bold text-orange-900 mt-1">{bom.scrapPercentage}%</p>
            </div>
            <Percent className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex space-x-1 p-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg font-medium transition-colors ${activeTab === 'overview'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              <FileText className="h-4 w-4" />
              <span>Overview</span>
            </button>
            <button
              onClick={() => setActiveTab('tree')}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg font-medium transition-colors ${activeTab === 'tree'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              <Network className="h-4 w-4" />
              <span>Component Tree</span>
            </button>
            <button
              onClick={() => setActiveTab('cost')}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg font-medium transition-colors ${activeTab === 'cost'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              <IndianRupee className="h-4 w-4" />
              <span>Cost Analysis</span>
            </button>
            <button
              onClick={() => setActiveTab('where_used')}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg font-medium transition-colors ${activeTab === 'where_used'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              <Link2 className="h-4 w-4" />
              <span>Where Used</span>
            </button>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {/* Product Information */}
              <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center space-x-2">
                  <Box className="h-5 w-5 text-blue-600" />
                  <span>Product Information</span>
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">Product Code:</span>
                    <span className="text-sm font-semibold text-gray-900">{bom.productCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">Product Name:</span>
                    <span className="text-sm font-semibold text-gray-900">{bom.productName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">Description:</span>
                    <span className="text-sm text-gray-900 text-right max-w-xs">{bom.productDescription}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">Drawing Number:</span>
                    <span className="text-sm font-semibold text-blue-600">{bom.drawingNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">Unit of Measure:</span>
                    <span className="text-sm font-semibold text-gray-900">{bom.uom}</span>
                  </div>
                </div>
              </div>

              {/* BOM Details */}
              <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-purple-600" />
                  <span>BOM Details</span>
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">Version:</span>
                    <span className="text-sm font-semibold text-gray-900">{bom.version}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">Revision:</span>
                    <span className="text-sm font-semibold text-gray-900">{bom.revision}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">Effective Date:</span>
                    <span className="text-sm text-gray-900">{bom.effectiveDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">Expiry Date:</span>
                    <span className="text-sm text-gray-900">{bom.expiryDate || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">Created By:</span>
                    <span className="text-sm font-semibold text-gray-900">{bom.createdBy}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">Created Date:</span>
                    <span className="text-sm text-gray-900">{bom.createdDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">Approved By:</span>
                    <span className="text-sm font-semibold text-green-700">{bom.approvedBy || 'Pending'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">Approved Date:</span>
                    <span className="text-sm text-gray-900">{bom.approvedDate || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* BOM Type & Category */}
              <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center space-x-2">
                  <Wrench className="h-5 w-5 text-green-600" />
                  <span>BOM Type & Category</span>
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">BOM Type:</span>
                    <span className="text-sm font-semibold text-gray-900">{bomTypeLabels[bom.bomType]}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">Product Category:</span>
                    <span className="text-sm font-semibold text-gray-900">{productCategoryLabels[bom.productCategory]}</span>
                  </div>
                </div>
              </div>

              {/* Manufacturing Details */}
              <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center space-x-2">
                  <Factory className="h-5 w-5 text-orange-600" />
                  <span>Manufacturing Details</span>
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">Batch Size:</span>
                    <span className="text-sm font-semibold text-gray-900">{bom.batchSize} units</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">Lead Time:</span>
                    <span className="text-sm font-semibold text-gray-900">{bom.leadTime} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">Scrap Percentage:</span>
                    <span className="text-sm font-semibold text-orange-700">{bom.scrapPercentage}%</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="bg-gray-50 rounded-lg p-5 border border-gray-200 lg:col-span-2">
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-gray-600" />
                  <span>Notes and Specifications</span>
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Notes:</p>
                    <p className="text-sm text-gray-900">{bom.notes}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Specifications:</p>
                    <p className="text-sm text-gray-900">{bom.specifications}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Component Tree Tab */}
        {activeTab === 'tree' && (
          <div className="p-6">
            <div className="mb-2 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Bill of Materials - Hierarchical Structure</h3>
                <p className="text-sm text-gray-600 mt-1">Multi-level indented BOM tree view</p>
              </div>
              <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                <Download className="h-4 w-4" />
                <span>Export to Excel</span>
              </button>
            </div>

            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Level</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Item Details</th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase">Qty/Parent</th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase">UOM</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Stock</th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase">Cost/Unit</th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase">Extended Cost</th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase">Make/Buy</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Alternatives</th>
                  </tr>
                </thead>
                <tbody>
                  {bom.components.length === 0 && (
                    <tr>
                      <td colSpan={10} className="px-4 py-6 text-center text-sm text-gray-500">
                        No components found for this BOM.
                      </td>
                    </tr>
                  )}
                  {bom.components.map((component) => renderComponentTreeRow(component))}
                </tbody>
                <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                  <tr>
                    <td colSpan={7} className="px-4 py-4 text-right">
                      <span className="text-lg font-bold text-gray-900">Total Rolled-up Cost:</span>
                    </td>
                    <td colSpan={3} className="px-4 py-4">
                      <div className="flex items-center text-xl font-bold text-green-700">
                        <IndianRupee className="h-5 w-5" />
                        <span>{calculateTotalRolledUpCost(bom.components).toFixed(2)}</span>
                      </div>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* Cost Analysis Tab */}
        {activeTab === 'cost' && (
          <div className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Cost Analysis & Breakdown</h3>
            {costBreakdown ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
                <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm font-medium text-gray-600">Total Cost:</span>
                    <div className="flex items-center text-xl font-bold text-green-700">
                      <IndianRupee className="h-5 w-5" />
                      <span>{(costBreakdown as CostBreakdown).totalCost.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-8 border border-gray-200 text-center">
                <BarChart3 className="h-10 w-10 text-gray-400 mb-2 mx-auto" />
                <p className="text-sm text-gray-600">Cost analysis is not available for this BOM.</p>
              </div>
            )}
          </div>
        )}

        {/* Where Used Tab */}
        {activeTab === 'where_used' && (
          <div className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Where This BOM/Component is Used</h3>

            {/* Parent Products */}
            <div className="bg-gray-50 rounded-lg p-5 border border-gray-200 mb-3">
              <h4 className="text-md font-bold text-gray-900 mb-2 flex items-center space-x-2">
                <Network className="h-5 w-5 text-blue-600" />
                <span>Parent Products Using This BOM</span>
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Product Code</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Product Name</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">BOM Number</th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase">Quantity</th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase">Level</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {whereUsedData.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-6 text-center text-sm text-gray-500">
                          No parent products found.
                        </td>
                      </tr>
                    )}
                    {whereUsedData.map((item, index) => (
                      <tr key={index} className="hover:bg-white">
                        <td className="px-4 py-3">
                          <span className="font-mono text-sm font-semibold text-blue-600">{item.productCode}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm font-medium text-gray-900">{item.productName}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm font-semibold text-gray-900">{item.bomNumber}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-sm font-bold text-gray-900">{item.quantity}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold">
                            {item.level}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Work Order Usage */}
            <div className="bg-gray-50 rounded-lg p-5 border border-gray-200 mb-3">
              <h4 className="text-md font-bold text-gray-900 mb-2 flex items-center space-x-2">
                <Factory className="h-5 w-5 text-green-600" />
                <span>Work Order Usage</span>
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">WO Number</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Product Name</th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase">Quantity</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Start Date</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Due Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {workOrderUsage.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-6 text-center text-sm text-gray-500">
                          No work order usage found.
                        </td>
                      </tr>
                    )}
                    {workOrderUsage.map((wo, index) => (
                      <tr key={index} className="hover:bg-white">
                        <td className="px-4 py-3">
                          <span className="font-mono text-sm font-semibold text-blue-600">{wo.woNumber}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm font-medium text-gray-900">{wo.productName}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-sm font-bold text-gray-900">{wo.quantity}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${wo.status === 'active' ? 'bg-yellow-100 text-yellow-700' :
                              wo.status === 'completed' ? 'bg-green-100 text-green-700' :
                                'bg-blue-100 text-blue-700'
                            }`}>
                            {wo.status.charAt(0).toUpperCase() + wo.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-900">{wo.startDate}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-900">{wo.dueDate}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Impact Analysis */}
            <div className="bg-orange-50 rounded-lg p-5 border border-orange-200">
              <h4 className="text-md font-bold text-gray-900 mb-3 flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <span>Impact Analysis for Changes</span>
              </h4>
              <div className="text-sm text-gray-700 space-y-2">
                <p><strong>Note:</strong> Modifying this BOM will impact:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>{whereUsedData.length} parent product(s)</li>
                  <li>{workOrderUsage.filter(wo => wo.status === 'active').length} active work order(s)</li>
                  <li>{workOrderUsage.filter(wo => wo.status === 'planned').length} planned work order(s)</li>
                </ul>
                <p className="text-orange-700 font-medium mt-3">
                  <AlertTriangle className="h-4 w-4 inline mr-1" />
                  Please review all dependencies before making changes to this BOM.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Activity Timeline */}
      <div className="mt-6 bg-white rounded-lg border border-gray-200 p-3">
        <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center space-x-2">
          <Activity className="h-5 w-5 text-gray-600" />
          <span>Activity Timeline</span>
        </h3>
        <div className="space-y-3">
          {activityTimeline.length === 0 && (
            <p className="text-sm text-gray-500">No activity recorded.</p>
          )}
          {activityTimeline.map((activity, index) => (
            <div key={index} className="flex items-start space-x-4 pb-3 border-b border-gray-100 last:border-0">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-700 flex-shrink-0">
                <CircleDot className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">{activity.action}</p>
                <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <User className="h-3 w-3" />
                    <span>{activity.user}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>{activity.date}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
