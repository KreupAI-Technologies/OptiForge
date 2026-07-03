'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { costEstimateService } from '@/services/estimation-cost-estimate.service';
import {
  ArrowLeft,
  Edit,
  FileText,
  DollarSign,
  TrendingUp,
  CheckCircle,
  Activity,
  Package,
  MoreVertical,
  Download,
  Send,
  AlertCircle,
  Clock,
  Building2,
  User,
  Percent,
  Calculator,
} from 'lucide-react';

interface CostItem {
  id: string;
  description: string;
  category: 'materials' | 'labor' | 'overhead' | 'equipment';
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
}

interface Costing {
  id: string;
  costingNumber: string;
  boqNumber: string;
  projectName: string;
  clientName: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'converted_to_order';
  totalMaterialCost: number;
  totalLaborCost: number;
  totalOverheadCost: number;
  manufacturingOverheadPercent: number;
  administrativeOverheadPercent: number;
  profitMarginPercent: number;
  totalCost: number;
  finalPrice: number;
  marginAmount: number;
  currency: string;
  createdBy: string;
  createdDate: string;
  approvedBy: string | null;
  approvedDate: string | null;
}

interface CostingActivity {
  id: string;
  costingId: string;
  type: 'status_change' | 'approval' | 'revision' | 'note' | 'calculation';
  title: string;
  description: string;
  performedBy: string;
  timestamp: string;
  metadata?: {
    previousStatus?: string;
    newStatus?: string;
    previousMargin?: number;
    newMargin?: number;
  };
}

// Mock data
const mockCosting: Costing = {
  id: '1',
  costingNumber: 'COST-2025-045',
  boqNumber: 'BOQ-2025-001',
  projectName: 'Manufacturing Plant Expansion - Phase 2',
  clientName: 'Tata Steel Ltd.',
  status: 'approved',
  totalMaterialCost: 8500000,
  totalLaborCost: 2800000,
  totalOverheadCost: 1200000,
  manufacturingOverheadPercent: 15,
  administrativeOverheadPercent: 8,
  profitMarginPercent: 18,
  totalCost: 12500000,
  finalPrice: 17850000,
  marginAmount: 5350000,
  currency: 'INR',
  createdBy: 'Priya Sharma',
  createdDate: '2025-10-05',
  approvedBy: 'Rajesh Kumar - Finance Head',
  approvedDate: '2025-10-12',
};

const mockCostItems: CostItem[] = [
  {
    id: '1',
    description: 'Structural Steel IS 2062 Grade',
    category: 'materials',
    quantity: 450,
    unit: 'MT',
    unitCost: 65000,
    totalCost: 29250000,
  },
  {
    id: '2',
    description: 'Welding & Fabrication',
    category: 'labor',
    quantity: 800,
    unit: 'Hrs',
    unitCost: 850,
    totalCost: 680000,
  },
  {
    id: '3',
    description: 'Crane Rental',
    category: 'equipment',
    quantity: 30,
    unit: 'Days',
    unitCost: 15000,
    totalCost: 450000,
  },
];

const mockActivities: CostingActivity[] = [
  {
    id: 'a1',
    costingId: '1',
    type: 'status_change',
    title: 'Costing Approved',
    description: 'Cost estimation approved by Finance Head',
    performedBy: 'Rajesh Kumar',
    timestamp: '2025-10-12 15:30',
    metadata: { previousStatus: 'pending_approval', newStatus: 'approved' }
  },
  {
    id: 'a2',
    costingId: '1',
    type: 'revision',
    title: 'Margin Adjusted',
    description: 'Profit margin adjusted based on market analysis',
    performedBy: 'Priya Sharma',
    timestamp: '2025-10-10 11:20',
    metadata: { previousMargin: 15, newMargin: 18 }
  },
  {
    id: 'a3',
    costingId: '1',
    type: 'calculation',
    title: 'Cost Calculation Completed',
    description: 'All cost items calculated with overheads and margins applied',
    performedBy: 'Priya Sharma',
    timestamp: '2025-10-08 14:45'
  },
];

const getCostingStages = (costing: Costing) => {
  return [
    { id: 'draft', name: 'Draft', status: 'completed', date: costing.createdDate, icon: FileText, color: 'gray' },
    { id: 'pending_approval', name: 'Pending Approval', status: 'completed', date: '2025-10-08', icon: Clock, color: 'yellow' },
    { id: 'approved', name: 'Approved', status: costing.status === 'approved' || costing.status === 'converted_to_order' ? 'current' : 'pending', date: costing.approvedDate || undefined, icon: CheckCircle, color: 'green' },
    { id: 'converted_to_order', name: 'Converted to Order', status: costing.status === 'converted_to_order' ? 'completed' : 'pending', icon: TrendingUp, color: 'emerald' },
  ];
};

const activityIcons = {
  status_change: Activity,
  approval: CheckCircle,
  revision: FileText,
  note: FileText,
  calculation: Calculator,
};

const activityColors = {
  status_change: 'bg-orange-100 text-orange-600 border-orange-200',
  approval: 'bg-green-100 text-green-600 border-green-200',
  revision: 'bg-blue-100 text-blue-600 border-blue-200',
  note: 'bg-yellow-100 text-yellow-600 border-yellow-200',
  calculation: 'bg-purple-100 text-purple-600 border-purple-200',
};

const statusColors = {
  draft: 'bg-gray-100 text-gray-700',
  pending_approval: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  converted_to_order: 'bg-emerald-100 text-emerald-700',
};

export default function ViewCostingPage() {
  const router = useRouter();
  const params = useParams();
  const costingId = params.id as string;

  const [costing, setCosting] = useState<Costing>(mockCosting);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = (await costEstimateService.findOne('default', costingId)) as any;
        if (!cancelled && raw) {
          setCosting((prev) => ({
            ...prev,
            id: raw.id ?? prev.id,
            costingNumber: raw.estimateNumber ?? prev.costingNumber,
            projectName: raw.title ?? prev.projectName,
            clientName: raw.customerName ?? prev.clientName,
            status: (String(raw.status ?? '').toLowerCase().replace(/\s+/g, '_') as Costing['status']) || prev.status,
            totalMaterialCost: raw.materialCost != null ? Number(raw.materialCost) : prev.totalMaterialCost,
            totalLaborCost: raw.laborCost != null ? Number(raw.laborCost) : prev.totalLaborCost,
            totalOverheadCost: raw.overheadCost != null ? Number(raw.overheadCost) : prev.totalOverheadCost,
            totalCost: raw.totalCost != null ? Number(raw.totalCost) : prev.totalCost,
            currency: raw.currency ?? prev.currency,
            createdBy: raw.submittedBy ?? prev.createdBy,
            approvedBy: raw.approvedBy ?? prev.approvedBy,
          }));
        }
      } catch (err) {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : 'Failed to load costing');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [costingId]);

  const [activeTab, setActiveTab] = useState<'overview' | 'breakdown' | 'activity'>('overview');

  const tabs = [
    { id: 'overview', name: 'Overview', icon: FileText },
    { id: 'breakdown', name: 'Cost Breakdown', icon: Package },
    { id: 'activity', name: 'Activity Timeline', icon: Activity },
  ];

  const categoryTotals = {
    materials: mockCostItems.filter(i => i.category === 'materials').reduce((sum, i) => sum + i.totalCost, 0),
    labor: mockCostItems.filter(i => i.category === 'labor').reduce((sum, i) => sum + i.totalCost, 0),
    equipment: mockCostItems.filter(i => i.category === 'equipment').reduce((sum, i) => sum + i.totalCost, 0),
    overhead: mockCostItems.filter(i => i.category === 'overhead').reduce((sum, i) => sum + i.totalCost, 0),
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 px-3 py-2">
      {isLoading && (
        <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">
          Loading costing...
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {loadError}
        </div>
      )}
      {/* Header */}
      <div className="mb-3">
        <button
          onClick={() => router.push('/estimation/costing')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-2"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="font-medium">Back to Costing List</span>
        </button>

        <div className="bg-white rounded-lg border border-gray-200 p-3">
          {/* Header Info */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start space-x-4">
              <div className="h-16 w-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                <DollarSign className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{costing.costingNumber}</h1>
                <p className="text-lg text-gray-600 mt-1">{costing.projectName}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className={`px-3 py-1 text-sm font-semibold rounded-full ${statusColors[costing.status]}`}>
                    {costing.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                  <span className="text-sm text-gray-500">Linked BOQ: {costing.boqNumber}</span>
                  <span className="text-sm text-gray-500">Created by: {costing.createdBy}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => router.push(`/estimation/costing/edit/${costingId}`)}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Edit className="h-4 w-4" />
                <span>Edit</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
              <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                <MoreVertical className="h-5 w-5 text-gray-600" />
                <span className="text-gray-700">More</span>
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
              <p className="text-xs font-medium text-blue-600 uppercase mb-1">Total Cost</p>
              <p className="text-2xl font-bold text-blue-900">₹{(costing.totalCost / 10000000).toFixed(2)}Cr</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
              <p className="text-xs font-medium text-purple-600 uppercase mb-1">Final Price</p>
              <p className="text-2xl font-bold text-purple-900">₹{(costing.finalPrice / 10000000).toFixed(2)}Cr</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
              <p className="text-xs font-medium text-green-600 uppercase mb-1">Margin %</p>
              <p className="text-2xl font-bold text-green-900">{costing.profitMarginPercent}%</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
              <p className="text-xs font-medium text-orange-600 uppercase mb-1">Approval Status</p>
              <p className="text-lg font-semibold text-orange-900">{costing.status === 'approved' ? 'Approved' : 'Pending'}</p>
            </div>
          </div>

          {/* Progress Tracker */}
          <div className="bg-gradient-to-br from-gray-50 to-purple-50 rounded-lg p-3 border border-gray-200">
            <h3 className="text-sm font-bold text-gray-700 uppercase mb-2">Costing Progress</h3>
            <div className="relative">
              <div className="flex items-center justify-between">
                {getCostingStages(costing).map((stage, index) => {
                  const StageIcon = stage.icon;
                  const isLast = index === getCostingStages(costing).length - 1;

                  return (
                    <div key={stage.id} className="flex items-center flex-1">
                      <div className="flex flex-col items-center relative z-10">
                        <div className={`h-12 w-12 rounded-full flex items-center justify-center border-2 transition-all ${
                          stage.status === 'completed'
                            ? 'bg-green-500 border-green-600'
                            : stage.status === 'current'
                            ? 'bg-blue-500 border-blue-600 ring-4 ring-blue-200'
                            : 'bg-gray-200 border-gray-300'
                        }`}>
                          <StageIcon className={`h-6 w-6 ${
                            stage.status === 'completed' || stage.status === 'current'
                              ? 'text-white'
                              : 'text-gray-400'
                          }`} />
                        </div>

                        <div className="mt-2 text-center">
                          <p className={`text-xs font-semibold ${
                            stage.status === 'current' ? 'text-blue-900' : 'text-gray-700'
                          }`}>
                            {stage.name}
                          </p>
                          {stage.date && (
                            <p className="text-xs text-gray-500 mt-0.5">{stage.date}</p>
                          )}
                        </div>
                      </div>

                      {!isLast && (
                        <div className={`flex-1 h-1 mx-2 rounded ${
                          stage.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                        }`}></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-3">
        <div className="border-b border-gray-200 bg-white rounded-t-lg">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <TabIcon className="h-5 w-5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {/* Project Information */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                <Building2 className="h-5 w-5 mr-2 text-blue-600" />
                Project Information
              </h3>
              <div className="bg-gray-50 rounded-lg p-3 space-y-3">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Project Name</p>
                  <p className="text-sm font-semibold text-gray-900">{costing.projectName}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Client</p>
                  <p className="text-sm font-semibold text-gray-900">{costing.clientName}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Linked BOQ</p>
                  <p className="text-sm text-blue-600 font-semibold">{costing.boqNumber}</p>
                </div>
              </div>
            </div>

            {/* Cost Summary */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-blue-600" />
                Cost Summary
              </h3>
              <div className="bg-gray-50 rounded-lg p-3 space-y-3">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Material Cost</p>
                  <p className="text-sm font-semibold text-gray-900">₹{costing.totalMaterialCost.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Labor Cost</p>
                  <p className="text-sm font-semibold text-gray-900">₹{costing.totalLaborCost.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Overhead Cost</p>
                  <p className="text-sm font-semibold text-gray-900">₹{costing.totalOverheadCost.toLocaleString()}</p>
                </div>
                <div className="pt-3 border-t border-gray-300">
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Total Cost</p>
                  <p className="text-xl font-bold text-blue-900">₹{costing.totalCost.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Margin & Pricing */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                <Percent className="h-5 w-5 mr-2 text-blue-600" />
                Margin & Overheads
              </h3>
              <div className="bg-gray-50 rounded-lg p-3 space-y-3">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Manufacturing Overhead</p>
                  <p className="text-sm font-semibold text-gray-900">{costing.manufacturingOverheadPercent}%</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Administrative Overhead</p>
                  <p className="text-sm font-semibold text-gray-900">{costing.administrativeOverheadPercent}%</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Profit Margin</p>
                  <p className="text-sm font-semibold text-green-600">{costing.profitMarginPercent}%</p>
                </div>
                <div className="pt-3 border-t border-gray-300">
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Margin Amount</p>
                  <p className="text-lg font-bold text-green-900">₹{costing.marginAmount.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Key Dates */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-blue-600" />
                Key Dates
              </h3>
              <div className="bg-gray-50 rounded-lg p-3 space-y-3">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Created Date</p>
                  <p className="text-sm font-semibold text-gray-900">{costing.createdDate}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Created By</p>
                  <p className="text-sm text-gray-900">{costing.createdBy}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Approved Date</p>
                  <p className="text-sm font-semibold text-gray-900">{costing.approvedDate || 'Pending'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Approved By</p>
                  <p className="text-sm text-gray-900">{costing.approvedBy || 'Pending'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cost Breakdown Tab */}
        {activeTab === 'breakdown' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-bold text-gray-900">Cost Category Breakdown</h3>
            </div>

            {/* Category Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
                <p className="text-xs font-medium text-blue-600 uppercase mb-1">Materials</p>
                <p className="text-xl font-bold text-blue-900">₹{categoryTotals.materials.toLocaleString()}</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
                <p className="text-xs font-medium text-green-600 uppercase mb-1">Labor</p>
                <p className="text-xl font-bold text-green-900">₹{categoryTotals.labor.toLocaleString()}</p>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
                <p className="text-xs font-medium text-orange-600 uppercase mb-1">Equipment</p>
                <p className="text-xl font-bold text-orange-900">₹{categoryTotals.equipment.toLocaleString()}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
                <p className="text-xs font-medium text-purple-600 uppercase mb-1">Overhead</p>
                <p className="text-xl font-bold text-purple-900">₹{categoryTotals.overhead.toLocaleString()}</p>
              </div>
            </div>

            {/* Items Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Description</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Unit</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Quantity</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Unit Cost</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Total Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {mockCostItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.description}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium capitalize">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.unit}</td>
                      <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">{item.quantity.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-900">₹{item.unitCost.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-right font-bold text-blue-900">₹{item.totalCost.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Activity Timeline Tab */}
        {activeTab === 'activity' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-bold text-gray-900">Activity Timeline</h3>
            </div>

            <div className="space-y-2">
              {mockActivities
                .filter(activity => activity.costingId === costingId)
                .map((activity, index) => {
                  const ActivityIcon = activityIcons[activity.type];
                  const isLast = index === mockActivities.filter(a => a.costingId === costingId).length - 1;

                  return (
                    <div key={activity.id} className="relative">
                      {!isLast && (
                        <div className="absolute left-5 top-12 bottom-0 w-0.5 bg-gray-300"></div>
                      )}

                      <div className="flex items-start space-x-4">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center border-2 flex-shrink-0 ${activityColors[activity.type]}`}>
                          <ActivityIcon className="h-5 w-5" />
                        </div>

                        <div className="flex-1 bg-gray-50 rounded-lg p-3 border border-gray-200 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="text-base font-bold text-gray-900">{activity.title}</h4>
                              <p className="text-sm text-gray-500 mt-1">
                                by {activity.performedBy} • {activity.timestamp}
                              </p>
                            </div>
                          </div>

                          <p className="text-sm text-gray-700">{activity.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
