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

const mockBOM: BOM = {
  id: 'BOM-001',
  bomNumber: 'BOM-2025-001',
  productCode: 'PROD-CAB-001',
  productName: 'Premium Kitchen Cabinet - Modular',
  productDescription: 'High-quality modular kitchen cabinet with soft-close mechanism',
  drawingNumber: 'DWG-CAB-001-R2',
  version: 'V2.1',
  revision: 'R3',
  status: 'active',
  bomType: 'manufacturing',
  productCategory: 'finished_good',
  effectiveDate: '2025-01-15',
  expiryDate: undefined,
  batchSize: 10,
  leadTime: 7,
  scrapPercentage: 3.5,
  uom: 'Units',
  totalComponents: 45,
  totalLevels: 4,
  totalCost: 8750.50,
  createdBy: 'Rajesh Kumar',
  createdDate: '2025-01-10',
  approvedBy: 'Priya Sharma',
  approvedDate: '2025-01-14',
  notes: 'Updated design with improved hinge mechanism. Ensure all wood panels are pre-treated.',
  specifications: 'Material: BWP Plywood 18mm, Finish: Laminate, Hardware: Stainless Steel',
  components: [
    {
      id: 'C1',
      level: 0,
      itemCode: 'ASSY-FRAME-001',
      itemName: 'Cabinet Frame Assembly',
      description: 'Main frame structure with side panels',
      quantity: 1,
      uom: 'Unit',
      itemType: 'assembly',
      stockAvailable: 15,
      stockStatus: 'available',
      costPerUnit: 5200.00,
      extendedCost: 5200.00,
      makeOrBuy: 'make',
      scrapPercent: 2.0,
      isRequired: true,
      isPhantom: true,
      expanded: true,
      children: [
        {
          id: 'C1-1',
          level: 1,
          itemCode: 'RM-WOOD-PLY-18',
          itemName: 'BWP Plywood 18mm',
          description: 'Boiling Water Proof Plywood - Premium Grade',
          quantity: 2.5,
          uom: 'Sheets',
          itemType: 'raw_material',
          stockAvailable: 120,
          stockStatus: 'available',
          costPerUnit: 1800.00,
          extendedCost: 4500.00,
          makeOrBuy: 'buy',
          scrapPercent: 5.0,
          isRequired: true,
          isPhantom: false,
          alternatives: ['RM-WOOD-PLY-19', 'RM-WOOD-MDF-18'],
        },
        {
          id: 'C1-2',
          level: 1,
          itemCode: 'RM-LAMINATE-001',
          itemName: 'Decorative Laminate',
          description: 'High-pressure laminate - Matte finish',
          quantity: 3,
          uom: 'Sheets',
          itemType: 'raw_material',
          stockAvailable: 45,
          stockStatus: 'available',
          costPerUnit: 150.00,
          extendedCost: 450.00,
          makeOrBuy: 'buy',
          scrapPercent: 8.0,
          isRequired: true,
          isPhantom: false,
        },
        {
          id: 'C1-3',
          level: 1,
          itemCode: 'RM-ADHESIVE-WD',
          itemName: 'Wood Adhesive',
          description: 'Industrial grade wood glue',
          quantity: 0.5,
          uom: 'Kg',
          itemType: 'raw_material',
          stockAvailable: 25,
          stockStatus: 'available',
          costPerUnit: 250.00,
          extendedCost: 125.00,
          makeOrBuy: 'buy',
          scrapPercent: 3.0,
          isRequired: true,
          isPhantom: false,
        },
        {
          id: 'C1-4',
          level: 1,
          itemCode: 'RM-EDGEBAND-001',
          itemName: 'Edge Banding Tape',
          description: 'PVC edge banding - 1mm thickness',
          quantity: 25,
          uom: 'Meters',
          itemType: 'raw_material',
          stockAvailable: 500,
          stockStatus: 'available',
          costPerUnit: 5.00,
          extendedCost: 125.00,
          makeOrBuy: 'buy',
          scrapPercent: 10.0,
          isRequired: true,
          isPhantom: false,
        },
      ],
    },
    {
      id: 'C2',
      level: 0,
      itemCode: 'ASSY-DOOR-001',
      itemName: 'Cabinet Door Assembly',
      description: 'Soft-close door with handle',
      quantity: 2,
      uom: 'Units',
      itemType: 'assembly',
      stockAvailable: 8,
      stockStatus: 'available',
      costPerUnit: 1250.00,
      extendedCost: 2500.00,
      makeOrBuy: 'make',
      scrapPercent: 1.5,
      isRequired: true,
      isPhantom: false,
      expanded: true,
      children: [
        {
          id: 'C2-1',
          level: 1,
          itemCode: 'SFG-DOOR-PANEL',
          itemName: 'Door Panel - Laminated',
          description: 'Pre-laminated door panel',
          quantity: 1,
          uom: 'Unit',
          itemType: 'semi_finished',
          stockAvailable: 30,
          stockStatus: 'available',
          costPerUnit: 950.00,
          extendedCost: 950.00,
          makeOrBuy: 'make',
          scrapPercent: 2.0,
          isRequired: true,
          isPhantom: false,
          expanded: true,
          children: [
            {
              id: 'C2-1-1',
              level: 2,
              itemCode: 'RM-WOOD-PLY-12',
              itemName: 'BWP Plywood 12mm',
              description: 'Thinner plywood for door panel',
              quantity: 0.8,
              uom: 'Sheet',
              itemType: 'raw_material',
              stockAvailable: 80,
              stockStatus: 'available',
              costPerUnit: 1100.00,
              extendedCost: 880.00,
              makeOrBuy: 'buy',
              scrapPercent: 4.0,
              isRequired: true,
              isPhantom: false,
            },
            {
              id: 'C2-1-2',
              level: 2,
              itemCode: 'RM-LAMINATE-002',
              itemName: 'Premium Laminate',
              description: 'High-gloss laminate for doors',
              quantity: 1,
              uom: 'Sheet',
              itemType: 'raw_material',
              stockAvailable: 25,
              stockStatus: 'available',
              costPerUnit: 200.00,
              extendedCost: 200.00,
              makeOrBuy: 'buy',
              scrapPercent: 6.0,
              isRequired: true,
              isPhantom: false,
            },
          ],
        },
        {
          id: 'C2-2',
          level: 1,
          itemCode: 'COMP-HINGE-SC',
          itemName: 'Soft-Close Hinge',
          description: 'Hydraulic soft-close hinge - European style',
          quantity: 2,
          uom: 'Pieces',
          itemType: 'purchased_part',
          stockAvailable: 200,
          stockStatus: 'available',
          costPerUnit: 85.00,
          extendedCost: 170.00,
          makeOrBuy: 'buy',
          scrapPercent: 0.5,
          isRequired: true,
          isPhantom: false,
          supplierPreference: 'Hettich India',
          alternatives: ['COMP-HINGE-BL', 'COMP-HINGE-FG'],
        },
        {
          id: 'C2-3',
          level: 1,
          itemCode: 'COMP-HANDLE-001',
          itemName: 'Cabinet Handle',
          description: 'Stainless steel C-handle - 128mm',
          quantity: 1,
          uom: 'Piece',
          itemType: 'purchased_part',
          stockAvailable: 150,
          stockStatus: 'available',
          costPerUnit: 75.00,
          extendedCost: 75.00,
          makeOrBuy: 'buy',
          scrapPercent: 0.0,
          isRequired: true,
          isPhantom: false,
          supplierPreference: 'Ebco India',
        },
        {
          id: 'C2-4',
          level: 1,
          itemCode: 'COMP-SCREW-001',
          itemName: 'Mounting Screws',
          description: 'Self-tapping screws - 4x16mm',
          quantity: 8,
          uom: 'Pieces',
          itemType: 'purchased_part',
          stockAvailable: 5000,
          stockStatus: 'available',
          costPerUnit: 0.50,
          extendedCost: 4.00,
          makeOrBuy: 'buy',
          scrapPercent: 2.0,
          isRequired: true,
          isPhantom: false,
        },
      ],
    },
    {
      id: 'C3',
      level: 0,
      itemCode: 'COMP-SHELF-ADJ',
      itemName: 'Adjustable Shelf',
      description: 'Internal adjustable shelf with supports',
      quantity: 3,
      uom: 'Units',
      itemType: 'component',
      stockAvailable: 50,
      stockStatus: 'available',
      costPerUnit: 250.00,
      extendedCost: 750.00,
      makeOrBuy: 'make',
      scrapPercent: 2.5,
      isRequired: false,
      isPhantom: false,
    },
    {
      id: 'C4',
      level: 0,
      itemCode: 'COMP-LEG-ADJ',
      itemName: 'Adjustable Leg',
      description: 'Height adjustable leg - Stainless steel',
      quantity: 4,
      uom: 'Pieces',
      itemType: 'purchased_part',
      stockAvailable: 120,
      stockStatus: 'available',
      costPerUnit: 45.00,
      extendedCost: 180.00,
      makeOrBuy: 'buy',
      scrapPercent: 0.0,
      isRequired: true,
      isPhantom: false,
      supplierPreference: 'Hafele India',
    },
    {
      id: 'C5',
      level: 0,
      itemCode: 'PKG-HARDWARE',
      itemName: 'Hardware Kit',
      description: 'Assembly hardware and fixings',
      quantity: 1,
      uom: 'Kit',
      itemType: 'purchased_part',
      stockAvailable: 80,
      stockStatus: 'available',
      costPerUnit: 120.50,
      extendedCost: 120.50,
      makeOrBuy: 'buy',
      scrapPercent: 0.0,
      isRequired: true,
      isPhantom: false,
    },
  ],
};

const costBreakdown: CostBreakdown = {
  materialCost: 7850.50,
  laborCost: 450.00,
  overheadCost: 300.00,
  scrapCost: 150.00,
  totalCost: 8750.50,
};

const costByCategory: CostByCategory[] = [
  { category: 'Raw Materials', cost: 5280.00, percentage: 60.3 },
  { category: 'Components', cost: 1030.50, percentage: 11.8 },
  { category: 'Assemblies', cost: 1200.00, percentage: 13.7 },
  { category: 'Purchased Parts', cost: 340.00, percentage: 3.9 },
  { category: 'Labor & Overhead', cost: 750.00, percentage: 8.6 },
  { category: 'Scrap Allowance', cost: 150.00, percentage: 1.7 },
];

const topExpensiveComponents = [
  { itemCode: 'RM-WOOD-PLY-18', itemName: 'BWP Plywood 18mm', cost: 4500.00 },
  { itemCode: 'SFG-DOOR-PANEL', itemName: 'Door Panel - Laminated', cost: 1900.00 },
  { itemCode: 'RM-WOOD-PLY-12', itemName: 'BWP Plywood 12mm', cost: 1760.00 },
  { itemCode: 'COMP-SHELF-ADJ', itemName: 'Adjustable Shelf', cost: 750.00 },
  { itemCode: 'RM-LAMINATE-001', itemName: 'Decorative Laminate', cost: 450.00 },
  { itemCode: 'RM-LAMINATE-002', itemName: 'Premium Laminate', cost: 400.00 },
  { itemCode: 'COMP-HINGE-SC', itemName: 'Soft-Close Hinge', cost: 340.00 },
  { itemCode: 'COMP-LEG-ADJ', itemName: 'Adjustable Leg', cost: 180.00 },
  { itemCode: 'COMP-HANDLE-001', itemName: 'Cabinet Handle', cost: 150.00 },
  { itemCode: 'RM-EDGEBAND-001', itemName: 'Edge Banding Tape', cost: 125.00 },
];

const whereUsedData: WhereUsedItem[] = [
  {
    productCode: 'PROD-KIT-FULL',
    productName: 'Complete Modular Kitchen System',
    bomNumber: 'BOM-2025-050',
    quantity: 6,
    level: 1,
    status: 'Active',
  },
  {
    productCode: 'PROD-KIT-BASIC',
    productName: 'Basic Kitchen Unit',
    bomNumber: 'BOM-2025-051',
    quantity: 3,
    level: 1,
    status: 'Active',
  },
];

const workOrderUsage: WorkOrderUsage[] = [
  {
    woNumber: 'WO-2025-101',
    productName: 'Complete Modular Kitchen System',
    quantity: 12,
    status: 'active',
    startDate: '2025-10-15',
    dueDate: '2025-11-05',
  },
  {
    woNumber: 'WO-2025-085',
    productName: 'Basic Kitchen Unit',
    quantity: 8,
    status: 'completed',
    startDate: '2025-09-20',
    dueDate: '2025-10-10',
  },
  {
    woNumber: 'WO-2025-120',
    productName: 'Premium Kitchen Cabinet - Modular',
    quantity: 5,
    status: 'planned',
    startDate: '2025-11-01',
    dueDate: '2025-11-20',
  },
];

const activityTimeline = [
  { date: '2025-10-15', user: 'Priya Sharma', action: 'Version V2.1 activated for production' },
  { date: '2025-10-12', user: 'Amit Patel', action: 'Cost analysis updated with new supplier pricing' },
  { date: '2025-10-08', user: 'Rajesh Kumar', action: 'Added alternative component: COMP-HINGE-BL' },
  { date: '2025-09-25', user: 'Priya Sharma', action: 'Approved revision R3' },
  { date: '2025-09-20', user: 'Rajesh Kumar', action: 'Updated scrap percentage from 4% to 3.5%' },
];

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

export default function BOMViewPage() {
  const router = useRouter();
  const params = useParams();
  const [activeTab, setActiveTab] = useState<'overview' | 'tree' | 'cost' | 'where_used'>('overview');
  const [bom, setBom] = useState<BOM>(mockBOM);
  const [expandedComponents, setExpandedComponents] = useState<Set<string>>(new Set(['C1', 'C2', 'C2-1']));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const bomId = params.id as string;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    ProductionOrphanService.getBom(bomId)
      .then((data) => {
        if (cancelled) return;
        const r = data || {};
        setBom((prev) => ({
          ...prev,
          id: String(r.id ?? prev.id),
          bomNumber: r.bomNumber ?? r.bom_number ?? prev.bomNumber,
          productCode: r.productCode ?? r.product_code ?? prev.productCode,
          productName: r.productName ?? r.product_name ?? prev.productName,
          productDescription: r.productDescription ?? r.product_description ?? prev.productDescription,
          drawingNumber: r.drawingNumber ?? r.drawing_number ?? prev.drawingNumber,
          version: r.version ?? prev.version,
          revision: r.revision ?? prev.revision,
          status: (r.status ?? prev.status) as BOM['status'],
          bomType: (r.bomType ?? r.bom_type ?? prev.bomType) as BOM['bomType'],
          productCategory: (r.productCategory ?? r.product_category ?? prev.productCategory) as BOM['productCategory'],
          effectiveDate: r.effectiveDate ?? r.effective_date ?? prev.effectiveDate,
          expiryDate: r.expiryDate ?? r.expiry_date ?? prev.expiryDate,
          batchSize: r.batchSize ?? r.batch_size ?? prev.batchSize,
          leadTime: r.leadTime ?? r.lead_time ?? prev.leadTime,
          scrapPercentage: r.scrapPercentage ?? r.scrap_percentage ?? prev.scrapPercentage,
          uom: r.uom ?? prev.uom,
          totalComponents: r.totalComponents ?? r.total_components ?? prev.totalComponents,
          totalLevels: r.totalLevels ?? r.total_levels ?? prev.totalLevels,
          totalCost: r.totalCost ?? r.total_cost ?? prev.totalCost,
          createdBy: r.createdBy ?? r.created_by ?? prev.createdBy,
          createdDate: r.createdDate ?? r.created_date ?? prev.createdDate,
          approvedBy: r.approvedBy ?? r.approved_by ?? prev.approvedBy,
          approvedDate: r.approvedDate ?? r.approved_date ?? prev.approvedDate,
          notes: r.notes ?? prev.notes,
          specifications: r.specifications ?? prev.specifications,
        }));
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

  return (
    <div className="w-full h-full px-4 py-2">
      {loading && (
        <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">
          Loading BOM…
        </div>
      )}
      {error && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error} — showing sample data.
        </div>
      )}
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
              {/* Cost Breakdown */}
              <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                <h4 className="text-md font-bold text-gray-900 mb-2 flex items-center space-x-2">
                  <IndianRupee className="h-5 w-5 text-green-600" />
                  <span>Cost Breakdown</span>
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                    <span className="text-sm font-medium text-gray-600">Material Cost:</span>
                    <div className="flex items-center text-lg font-bold text-gray-900">
                      <IndianRupee className="h-4 w-4" />
                      <span>{costBreakdown.materialCost.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                    <span className="text-sm font-medium text-gray-600">Labor Cost:</span>
                    <div className="flex items-center text-lg font-bold text-gray-900">
                      <IndianRupee className="h-4 w-4" />
                      <span>{costBreakdown.laborCost.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                    <span className="text-sm font-medium text-gray-600">Overhead Cost:</span>
                    <div className="flex items-center text-lg font-bold text-gray-900">
                      <IndianRupee className="h-4 w-4" />
                      <span>{costBreakdown.overheadCost.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                    <span className="text-sm font-medium text-gray-600">Scrap Cost:</span>
                    <div className="flex items-center text-lg font-bold text-orange-700">
                      <IndianRupee className="h-4 w-4" />
                      <span>{costBreakdown.scrapCost.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-2 bg-green-50 px-3 py-2 rounded-lg">
                    <span className="text-md font-bold text-green-700">Total Cost:</span>
                    <div className="flex items-center text-xl font-bold text-green-700">
                      <IndianRupee className="h-5 w-5" />
                      <span>{costBreakdown.totalCost.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cost by Category */}
              <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                <h4 className="text-md font-bold text-gray-900 mb-2 flex items-center space-x-2">
                  <PieChart className="h-5 w-5 text-blue-600" />
                  <span>Cost by Category</span>
                </h4>
                <div className="space-y-2">
                  {costByCategory.map((item, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">{item.category}</span>
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center text-sm font-bold text-gray-900">
                            <IndianRupee className="h-3.5 w-3.5" />
                            <span>{item.cost.toFixed(2)}</span>
                          </div>
                          <span className="text-sm font-semibold text-blue-600">{item.percentage}%</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top 10 Expensive Components */}
            <div className="bg-gray-50 rounded-lg p-5 border border-gray-200 mb-3">
              <h4 className="text-md font-bold text-gray-900 mb-2 flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-purple-600" />
                <span>Top 10 Expensive Components</span>
              </h4>
              <div className="space-y-2">
                {topExpensiveComponents.map((item, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="flex items-center justify-center h-7 w-7 rounded-full bg-purple-100 text-purple-700 text-xs font-bold flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-sm font-semibold text-gray-900">{item.itemCode}</div>
                      <div className="text-xs text-gray-600 truncate">{item.itemName}</div>
                    </div>
                    <div className="flex items-center text-lg font-bold text-purple-900">
                      <IndianRupee className="h-4 w-4" />
                      <span>{item.cost.toFixed(2)}</span>
                    </div>
                    <div className="w-48 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-pink-600 h-2 rounded-full"
                        style={{ width: `${(item.cost / topExpensiveComponents[0].cost) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cost Comparison & Margin Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                <h4 className="text-md font-bold text-gray-900 mb-2 flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                  <span>Cost Comparison</span>
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Standard Cost:</span>
                    <div className="flex items-center text-md font-bold text-blue-900">
                      <IndianRupee className="h-4 w-4" />
                      <span>8500.00</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Actual Cost:</span>
                    <div className="flex items-center text-md font-bold text-green-700">
                      <IndianRupee className="h-4 w-4" />
                      <span>{costBreakdown.totalCost.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-300">
                    <span className="text-sm font-bold text-gray-700">Variance:</span>
                    <div className="flex items-center text-md font-bold text-orange-700">
                      <IndianRupee className="h-4 w-4" />
                      <span>+250.50</span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-600 mt-2 bg-orange-50 p-2 rounded">
                    <AlertTriangle className="h-4 w-4 inline text-orange-600 mr-1" />
                    Cost increased by 2.95% compared to standard
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                <h4 className="text-md font-bold text-gray-900 mb-2 flex items-center space-x-2">
                  <Percent className="h-5 w-5 text-green-600" />
                  <span>Margin Analysis</span>
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Total Cost:</span>
                    <div className="flex items-center text-md font-bold text-gray-900">
                      <IndianRupee className="h-4 w-4" />
                      <span>{costBreakdown.totalCost.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Suggested Price (30% margin):</span>
                    <div className="flex items-center text-md font-bold text-blue-900">
                      <IndianRupee className="h-4 w-4" />
                      <span>{(costBreakdown.totalCost * 1.3).toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Suggested Price (40% margin):</span>
                    <div className="flex items-center text-md font-bold text-green-700">
                      <IndianRupee className="h-4 w-4" />
                      <span>{(costBreakdown.totalCost * 1.4).toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-600 mt-2 bg-green-50 p-2 rounded">
                    <CheckCircle className="h-4 w-4 inline text-green-600 mr-1" />
                    Recommended selling price with standard margin
                  </div>
                </div>
              </div>
            </div>
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
