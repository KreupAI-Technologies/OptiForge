'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { exportToCsv, printCurrentView } from '@/lib/export';
import {
  ArrowLeft,
  Search,
  ChevronRight,
  ChevronDown,
  Package,
  Layers,
  Hash,
  IndianRupee,
  Minimize2,
  Maximize2,
  Download,
  Printer
} from 'lucide-react';
import { ExportMultiLevelModal, PrintPreviewModal } from '@/components/production/bom/BOMExportModals';

interface BOMComponent {
  id: string;
  level: number;
  itemCode: string;
  itemName: string;
  category: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
  scrapPercentage: number;
  leadTime: number;
  supplier: string;
  hasChildren: boolean;
  children?: BOMComponent[];
  expanded?: boolean;
}

export default function MultiLevelBOMPage() {
  const router = useRouter();
  const [selectedProduct, setSelectedProduct] = useState('KIT-SINK-001');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['1', '1.1', '1.2', '1.3']));
  const [showCosts, setShowCosts] = useState(true);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isPrintOpen, setIsPrintOpen] = useState(false);

  const products = [
    { code: 'KIT-SINK-001', name: 'Premium SS304 Kitchen Sink - Double Bowl' },
    { code: 'KIT-APPL-001', name: 'Auto-Clean Kitchen Chimney - 90cm' },
    { code: 'KIT-CAB-001', name: 'Modular Base Cabinet - 3 Drawer' },
    { code: 'KIT-FAUC-001', name: 'Chrome Finish Kitchen Faucet - Single Lever' }
  ];

  const bomStructure: BOMComponent[] = [
    {
      id: '1',
      level: 0,
      itemCode: 'KIT-SINK-001',
      itemName: 'Premium SS304 Kitchen Sink - Double Bowl',
      category: 'Finished Product',
      quantity: 1,
      unit: 'PC',
      unitCost: 11250,
      totalCost: 11250,
      scrapPercentage: 0,
      leadTime: 7,
      supplier: 'In-House',
      hasChildren: true,
      expanded: true,
      children: [
        {
          id: '1.1',
          level: 1,
          itemCode: 'SUB-SINK-BOWL',
          itemName: 'Sink Bowl Assembly',
          category: 'Sub-Assembly',
          quantity: 2,
          unit: 'PC',
          unitCost: 3200,
          totalCost: 6400,
          scrapPercentage: 2,
          leadTime: 3,
          supplier: 'In-House',
          hasChildren: true,
          expanded: true,
          children: [
            {
              id: '1.1.1',
              level: 2,
              itemCode: 'RM-SS304-18G',
              itemName: 'SS304 Steel Sheet - 18 Gauge',
              category: 'Raw Material',
              quantity: 2.5,
              unit: 'Sq.Ft',
              unitCost: 195,
              totalCost: 975,
              scrapPercentage: 8,
              leadTime: 5,
              supplier: 'Steel India',
              hasChildren: false
            },
            {
              id: '1.1.2',
              level: 2,
              itemCode: 'RM-GASKET',
              itemName: 'Silicone Gasket - Food Grade',
              category: 'Raw Material',
              quantity: 4,
              unit: 'Meter',
              unitCost: 25,
              totalCost: 100,
              scrapPercentage: 5,
              leadTime: 3,
              supplier: 'Rubber Products Ltd',
              hasChildren: false
            },
            {
              id: '1.1.3',
              level: 2,
              itemCode: 'COMP-STRAINER',
              itemName: 'Stainless Steel Strainer Basket',
              category: 'Component',
              quantity: 2,
              unit: 'PC',
              unitCost: 145,
              totalCost: 290,
              scrapPercentage: 0,
              leadTime: 7,
              supplier: 'Kitchen Components Co',
              hasChildren: false
            }
          ]
        },
        {
          id: '1.2',
          level: 1,
          itemCode: 'SUB-DRAIN-SYS',
          itemName: 'Drainage System Assembly',
          category: 'Sub-Assembly',
          quantity: 1,
          unit: 'SET',
          unitCost: 850,
          totalCost: 850,
          scrapPercentage: 1,
          leadTime: 2,
          supplier: 'In-House',
          hasChildren: true,
          expanded: true,
          children: [
            {
              id: '1.2.1',
              level: 2,
              itemCode: 'COMP-DRAIN-PIPE',
              itemName: 'PVC Drain Pipe - 40mm',
              category: 'Component',
              quantity: 2,
              unit: 'Meter',
              unitCost: 85,
              totalCost: 170,
              scrapPercentage: 3,
              leadTime: 2,
              supplier: 'PVC Suppliers',
              hasChildren: false
            },
            {
              id: '1.2.2',
              level: 2,
              itemCode: 'COMP-DRAIN-VALVE',
              itemName: 'Drain Control Valve - SS',
              category: 'Component',
              quantity: 2,
              unit: 'PC',
              unitCost: 180,
              totalCost: 360,
              scrapPercentage: 0,
              leadTime: 5,
              supplier: 'Valve Technologies',
              hasChildren: false
            },
            {
              id: '1.2.3',
              level: 2,
              itemCode: 'COMP-COUPLING',
              itemName: 'Pipe Coupling - Brass',
              category: 'Component',
              quantity: 4,
              unit: 'PC',
              unitCost: 35,
              totalCost: 140,
              scrapPercentage: 0,
              leadTime: 3,
              supplier: 'Brass Fittings Inc',
              hasChildren: false
            }
          ]
        },
        {
          id: '1.3',
          level: 1,
          itemCode: 'SUB-MOUNT-KIT',
          itemName: 'Mounting Hardware Kit',
          category: 'Sub-Assembly',
          quantity: 1,
          unit: 'SET',
          unitCost: 420,
          totalCost: 420,
          scrapPercentage: 0,
          leadTime: 1,
          supplier: 'In-House',
          hasChildren: true,
          expanded: true,
          children: [
            {
              id: '1.3.1',
              level: 2,
              itemCode: 'COMP-BRACKET',
              itemName: 'SS Mounting Bracket',
              category: 'Component',
              quantity: 4,
              unit: 'PC',
              unitCost: 45,
              totalCost: 180,
              scrapPercentage: 0,
              leadTime: 3,
              supplier: 'Metal Fabricators',
              hasChildren: false
            },
            {
              id: '1.3.2',
              level: 2,
              itemCode: 'COMP-SCREW-M6',
              itemName: 'SS Screw M6x40mm',
              category: 'Component',
              quantity: 16,
              unit: 'PC',
              unitCost: 5,
              totalCost: 80,
              scrapPercentage: 2,
              leadTime: 1,
              supplier: 'Fasteners Direct',
              hasChildren: false
            },
            {
              id: '1.3.3',
              level: 2,
              itemCode: 'COMP-WASHER',
              itemName: 'Rubber Washer - 6mm',
              category: 'Component',
              quantity: 16,
              unit: 'PC',
              unitCost: 3,
              totalCost: 48,
              scrapPercentage: 5,
              leadTime: 1,
              supplier: 'Rubber Products Ltd',
              hasChildren: false
            }
          ]
        },
        {
          id: '1.4',
          level: 1,
          itemCode: 'FINISH-CHROME',
          itemName: 'Chrome Plating Finish',
          category: 'Finishing',
          quantity: 8,
          unit: 'Sq.Ft',
          unitCost: 120,
          totalCost: 960,
          scrapPercentage: 1,
          leadTime: 2,
          supplier: 'Chrome Solutions',
          hasChildren: false
        },
        {
          id: '1.5',
          level: 1,
          itemCode: 'PKG-SINK',
          itemName: 'Sink Packaging Material',
          category: 'Packaging',
          quantity: 1,
          unit: 'SET',
          unitCost: 180,
          totalCost: 180,
          scrapPercentage: 0,
          leadTime: 1,
          supplier: 'Packaging Solutions',
          hasChildren: false
        }
      ]
    }
  ];

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const expandAll = () => {
    const allIds = new Set<string>();
    const collectIds = (items: BOMComponent[]) => {
      items.forEach(item => {
        if (item.hasChildren) {
          allIds.add(item.id);
          if (item.children) collectIds(item.children);
        }
      });
    };
    collectIds(bomStructure);
    setExpandedNodes(allIds);
  };

  const collapseAll = () => {
    setExpandedNodes(new Set());
  };

  const renderBOMTree = (items: BOMComponent[]): JSX.Element[] => {
    return items.map((item) => {
      const isExpanded = expandedNodes.has(item.id);
      const indent = item.level * 32;

      return (
        <div key={item.id}>
          <div className={`flex items-center py-3 px-4 hover:bg-gray-50 border-b border-gray-100 ${
            item.level === 0 ? 'bg-blue-50 font-semibold' : ''
          }`}>
            <div className="flex items-center" style={{ minWidth: '400px', paddingLeft: `${indent}px` }}>
              {item.hasChildren ? (
                <button
                  onClick={() => toggleNode(item.id)}
                  className="mr-2 text-gray-500 hover:text-gray-700"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
              ) : (
                <div className="w-6 mr-2" />
              )}
              <Package className={`h-4 w-4 mr-2 ${
                item.category === 'Finished Product' ? 'text-blue-600' :
                item.category === 'Sub-Assembly' ? 'text-purple-600' :
                item.category === 'Raw Material' ? 'text-orange-600' :
                'text-gray-600'
              }`} />
              <div>
                <div className="text-sm font-medium text-gray-900">{item.itemName}</div>
                <div className="text-xs text-gray-500">{item.itemCode}</div>
              </div>
            </div>

            <div className="text-sm text-gray-700" style={{ minWidth: '120px' }}>
              {item.category}
            </div>

            <div className="text-sm font-medium text-gray-900" style={{ minWidth: '100px' }}>
              {item.quantity} {item.unit}
            </div>

            {showCosts && (
              <>
                <div className="text-sm text-gray-700" style={{ minWidth: '120px' }}>
                  ₹{item.unitCost.toLocaleString()}
                </div>
                <div className="text-sm font-medium text-blue-900" style={{ minWidth: '120px' }}>
                  ₹{item.totalCost.toLocaleString()}
                </div>
              </>
            )}

            <div className="text-sm text-gray-600" style={{ minWidth: '100px' }}>
              {item.leadTime} days
            </div>

            <div className="text-sm text-gray-600" style={{ minWidth: '150px' }}>
              {item.supplier}
            </div>
          </div>

          {item.hasChildren && isExpanded && item.children && (
            <div>
              {renderBOMTree(item.children)}
            </div>
          )}
        </div>
      );
    });
  };

  const calculateTotals = () => {
    let totalComponents = 0;
    let totalCost = 0;

    const countComponents = (items: BOMComponent[]) => {
      items.forEach(item => {
        totalComponents++;
        totalCost += item.totalCost;
        if (item.children) countComponents(item.children);
      });
    };

    countComponents(bomStructure);
    return { totalComponents, totalCost };
  };

  const totals = calculateTotals();

  // Modal handlers
  const handleExport = () => {
    setIsExportOpen(true);
  };

  const handlePrint = () => {
    setIsPrintOpen(true);
  };

  const handleExportSubmit = (_config: any) => {
    exportToCsv('bom-multi-level', bomStructure as unknown as Record<string, unknown>[]);
    setIsExportOpen(false);
  };

  const handlePrintSubmit = (_config: any) => {
    printCurrentView();
    setIsPrintOpen(false);
  };

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
            <h1 className="text-2xl font-bold text-gray-900">Multi-Level BOM View</h1>
            <p className="text-sm text-gray-600">Hierarchical component structure with indented levels</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCosts(!showCosts)}
            className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
          >
            <IndianRupee className="h-4 w-4" />
            {showCosts ? 'Hide' : 'Show'} Costs
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
          >
            <Printer className="h-4 w-4" />
            Print
          </button>
        </div>
      </div>

      {/* Product Selection and Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
          <div className="flex-1">
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
          <div className="flex items-center gap-2">
            <button
              onClick={expandAll}
              className="flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200"
            >
              <Maximize2 className="h-4 w-4" />
              Expand All
            </button>
            <button
              onClick={collapseAll}
              className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
            >
              <Minimize2 className="h-4 w-4" />
              Collapse All
            </button>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-900">Total Levels</span>
            <Layers className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-900">3</div>
          <div className="text-xs text-blue-700 mt-1">Maximum depth</div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-green-900">Components</span>
            <Package className="h-5 w-5 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-900">{totals.totalComponents}</div>
          <div className="text-xs text-green-700 mt-1">Total items</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-purple-900">Total Cost</span>
            <IndianRupee className="h-5 w-5 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-900">₹{(totals.totalCost / 1000).toFixed(1)}K</div>
          <div className="text-xs text-purple-700 mt-1">Manufacturing cost</div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-orange-900">Sub-Assemblies</span>
            <Hash className="h-5 w-5 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-orange-900">3</div>
          <div className="text-xs text-orange-700 mt-1">Intermediate levels</div>
        </div>
      </div>

      {/* BOM Tree */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center bg-gray-50 border-b border-gray-200 px-4 py-3 font-medium text-xs text-gray-500 uppercase tracking-wider">
          <div style={{ minWidth: '400px' }}>Component</div>
          <div style={{ minWidth: '120px' }}>Category</div>
          <div style={{ minWidth: '100px' }}>Quantity</div>
          {showCosts && (
            <>
              <div style={{ minWidth: '120px' }}>Unit Cost</div>
              <div style={{ minWidth: '120px' }}>Total Cost</div>
            </>
          )}
          <div style={{ minWidth: '100px' }}>Lead Time</div>
          <div style={{ minWidth: '150px' }}>Supplier</div>
        </div>

        {/* Tree Content */}
        <div className="overflow-x-auto">
          {renderBOMTree(bomStructure)}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 bg-gray-50 rounded-lg p-3">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Category Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-gray-600">Finished Product</span>
          </div>
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-purple-600" />
            <span className="text-sm text-gray-600">Sub-Assembly</span>
          </div>
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-orange-600" />
            <span className="text-sm text-gray-600">Raw Material</span>
          </div>
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-gray-600" />
            <span className="text-sm text-gray-600">Component</span>
          </div>
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-gray-600" />
            <span className="text-sm text-gray-600">Packaging</span>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ExportMultiLevelModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        onExport={handleExportSubmit}
      />

      <PrintPreviewModal
        isOpen={isPrintOpen}
        onClose={() => setIsPrintOpen(false)}
        onPrint={handlePrintSubmit}
      />
    </div>
  );
}
