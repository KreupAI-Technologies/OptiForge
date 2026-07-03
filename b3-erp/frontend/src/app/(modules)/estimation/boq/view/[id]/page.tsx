'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { estimationBOQService } from '@/services/estimation-boq.service';
import {
  ArrowLeft, Edit, FileText, Calendar, TrendingUp, DollarSign,
  CheckCircle, Clock, Activity, User, Building2, Package,
  MoreVertical, Download, Send, Copy, AlertCircle
} from 'lucide-react';

interface BOQItem {
  id: string;
  itemNo: string;
  description: string;
  unit: string;
  quantity: number;
  unitRate: number;
  totalAmount: number;
  specifications: string;
  category: string;
}

interface BOQ {
  id: string;
  boqNumber: string;
  projectName: string;
  clientName: string;
  revisionNumber: number;
  status: 'draft' | 'under_review' | 'approved' | 'rejected' | 'in_costing' | 'completed';
  totalItems: number;
  totalQuantity: number;
  estimatedValue: number;
  linkedEstimation: string | null;
  createdBy: string;
  createdDate: string;
  approvedBy: string | null;
  approvedDate: string | null;
  projectLocation: string;
  projectDuration: string;
  currency: string;
}

interface BOQActivity {
  id: string;
  boqId: string;
  type: 'status_change' | 'revision' | 'approval' | 'costing' | 'note' | 'attachment';
  title: string;
  description: string;
  performedBy: string;
  timestamp: string;
  metadata?: {
    previousStatus?: string;
    newStatus?: string;
    revisionFrom?: number;
    revisionTo?: number;
    attachmentCount?: number;
  };
}

interface BOQStage {
  id: string;
  name: string;
  status: 'completed' | 'current' | 'pending';
  date?: string;
  icon: any;
  color: string;
}

// Mock BOQ data
const mockBOQ: BOQ = {
  id: '1',
  boqNumber: 'BOQ-2025-001',
  projectName: 'Manufacturing Plant Expansion - Phase 2',
  clientName: 'Tata Steel Ltd.',
  revisionNumber: 2,
  status: 'approved',
  totalItems: 156,
  totalQuantity: 8542,
  estimatedValue: 12500000,
  linkedEstimation: 'EST-2025-045',
  createdBy: 'Rajesh Kumar',
  createdDate: '2025-09-15',
  approvedBy: 'Amit Sharma - Project Director',
  approvedDate: '2025-10-10',
  projectLocation: 'Jamshedpur, Jharkhand',
  projectDuration: '18 months',
  currency: 'INR',
};

// Mock BOQ items
const mockBOQItems: BOQItem[] = [
  {
    id: 'item1',
    itemNo: 'A.1.1',
    description: 'Structural Steel Beams - Grade IS 2062',
    unit: 'MT',
    quantity: 450,
    unitRate: 65000,
    totalAmount: 29250000,
    specifications: 'IS 2062 E250 grade, hot rolled',
    category: 'Structural'
  },
  {
    id: 'item2',
    itemNo: 'A.1.2',
    description: 'Reinforcement Steel Bars - Grade Fe 500',
    unit: 'MT',
    quantity: 280,
    unitRate: 52000,
    totalAmount: 14560000,
    specifications: 'Fe 500D grade, TMT bars',
    category: 'Structural'
  },
  {
    id: 'item3',
    itemNo: 'A.2.1',
    description: 'Concrete M25 Grade',
    unit: 'Cum',
    quantity: 1200,
    unitRate: 6500,
    totalAmount: 7800000,
    specifications: 'Ready mix concrete, M25 grade',
    category: 'Civil Works'
  },
  {
    id: 'item4',
    itemNo: 'B.1.1',
    description: 'HVAC System - Industrial Grade',
    unit: 'Set',
    quantity: 12,
    unitRate: 850000,
    totalAmount: 10200000,
    specifications: '50 TR capacity, energy efficient',
    category: 'HVAC'
  },
  {
    id: 'item5',
    itemNo: 'C.1.1',
    description: 'Electrical Panel - 1000 KVA',
    unit: 'No',
    quantity: 4,
    unitRate: 1250000,
    totalAmount: 5000000,
    specifications: 'LT Panel with auto changeover',
    category: 'Electrical'
  },
];

// Mock activities
const mockActivities: BOQActivity[] = [
  {
    id: 'a1',
    boqId: '1',
    type: 'status_change',
    title: 'BOQ Approved',
    description: 'BOQ approved by Project Director after technical review',
    performedBy: 'Amit Sharma',
    timestamp: '2025-10-10 16:30',
    metadata: { previousStatus: 'under_review', newStatus: 'approved' }
  },
  {
    id: 'a2',
    boqId: '1',
    type: 'revision',
    title: 'BOQ Revised',
    description: 'Updated quantities based on revised drawings. Steel quantities increased by 12%.',
    performedBy: 'Rajesh Kumar',
    timestamp: '2025-10-08 11:20',
    metadata: { revisionFrom: 1, revisionTo: 2 }
  },
  {
    id: 'a3',
    boqId: '1',
    type: 'costing',
    title: 'Linked to Estimation',
    description: 'BOQ linked to cost estimation EST-2025-045 for detailed pricing',
    performedBy: 'Priya Sharma',
    timestamp: '2025-10-05 14:45'
  },
  {
    id: 'a4',
    boqId: '1',
    type: 'note',
    title: 'Technical Note Added',
    description: 'All structural steel to be procured from approved vendors only. Quality certificates mandatory.',
    performedBy: 'Rajesh Kumar',
    timestamp: '2025-09-28 10:15'
  },
  {
    id: 'a5',
    boqId: '1',
    type: 'attachment',
    title: 'Documents Uploaded',
    description: 'Uploaded revised architectural drawings and specifications',
    performedBy: 'Rajesh Kumar',
    timestamp: '2025-09-22 16:00',
    metadata: { attachmentCount: 8 }
  },
];

const getBOQStages = (boq: BOQ): BOQStage[] => {
  const stages: BOQStage[] = [
    { id: 'draft', name: 'Draft', status: 'completed', date: boq.createdDate, icon: FileText, color: 'gray' },
    { id: 'under_review', name: 'Under Review', status: 'completed', date: '2025-09-20', icon: AlertCircle, color: 'yellow' },
    { id: 'approved', name: 'Approved', status: 'current', date: boq.approvedDate || undefined, icon: CheckCircle, color: 'green' },
    { id: 'in_costing', name: 'In Costing', status: boq.linkedEstimation ? 'completed' : 'pending', date: boq.linkedEstimation ? '2025-10-05' : undefined, icon: DollarSign, color: 'blue' },
    { id: 'completed', name: 'Completed', status: 'pending', icon: TrendingUp, color: 'emerald' },
  ];

  return stages;
};

const activityIcons = {
  status_change: Activity,
  revision: FileText,
  approval: CheckCircle,
  costing: DollarSign,
  note: FileText,
  attachment: Package,
};

const activityColors = {
  status_change: 'bg-orange-100 text-orange-600 border-orange-200',
  revision: 'bg-blue-100 text-blue-600 border-blue-200',
  approval: 'bg-green-100 text-green-600 border-green-200',
  costing: 'bg-purple-100 text-purple-600 border-purple-200',
  note: 'bg-yellow-100 text-yellow-600 border-yellow-200',
  attachment: 'bg-indigo-100 text-indigo-600 border-indigo-200',
};

const statusColors = {
  draft: 'bg-gray-100 text-gray-700',
  under_review: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  in_costing: 'bg-blue-100 text-blue-700',
  completed: 'bg-emerald-100 text-emerald-700',
};

export default function ViewBOQPage() {
  const router = useRouter();
  const params = useParams();
  const boqId = params.id as string;

  const [boq, setBoq] = useState<BOQ>(mockBOQ);
  const [boqItems, setBoqItems] = useState<BOQItem[]>(mockBOQItems);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = (await estimationBOQService.findOne(boqId)) as any;
        if (!cancelled && raw) {
          setBoq((prev) => ({
            ...prev,
            id: raw.id ?? prev.id,
            boqNumber: raw.boqNumber ?? prev.boqNumber,
            projectName: raw.projectName ?? prev.projectName,
            clientName: raw.clientName ?? prev.clientName,
            status: (String(raw.status ?? '').toLowerCase().replace(/\s+/g, '_') as BOQ['status']) || prev.status,
            estimatedValue: raw.estimatedValue != null ? Number(raw.estimatedValue) : prev.estimatedValue,
            projectLocation: raw.projectLocation ?? prev.projectLocation,
            projectDuration: raw.projectDuration ?? prev.projectDuration,
            currency: raw.currency ?? prev.currency,
          }));
        }
        try {
          const items = (await estimationBOQService.findItems(boqId)) as any[];
          if (!cancelled && Array.isArray(items) && items.length) {
            setBoqItems(items.map((it: any, idx: number) => ({
              id: it.id ?? String(idx),
              itemNo: it.itemNo ?? String(idx + 1),
              description: it.description ?? '',
              unit: it.unit ?? '',
              quantity: Number(it.quantity ?? 0),
              unitRate: Number(it.unitRate ?? 0),
              totalAmount: Number(it.totalAmount ?? 0),
              category: it.category ?? '',
              specifications: it.specifications ?? '',
            })));
          }
        } catch { /* keep sample items */ }
      } catch (err) {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : 'Failed to load BOQ');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [boqId]);

  const [activeTab, setActiveTab] = useState<'overview' | 'items' | 'activity'>('overview');

  const tabs = [
    { id: 'overview', name: 'Overview', icon: FileText },
    { id: 'items', name: 'BOQ Items', icon: Package },
    { id: 'activity', name: 'Activity Timeline', icon: Activity },
  ];

  return (
    <div className="w-full min-h-screen bg-gray-50 px-3 py-2">
      {isLoading && (
        <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">
          Loading BOQ...
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
          onClick={() => router.push('/estimation/boq')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-2"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="font-medium">Back to BOQ List</span>
        </button>

        <div className="bg-white rounded-lg border border-gray-200 p-3">
          {/* BOQ Header Info */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start space-x-4">
              <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{boq.boqNumber}</h1>
                <p className="text-lg text-gray-600 mt-1">{boq.projectName}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className={`px-3 py-1 text-sm font-semibold rounded-full ${statusColors[boq.status]}`}>
                    {boq.status.replace('_', ' ').charAt(0).toUpperCase() + boq.status.replace('_', ' ').slice(1)}
                  </span>
                  <span className="text-sm text-gray-500">Revision: {boq.revisionNumber}</span>
                  <span className="text-sm text-gray-500">Created by: {boq.createdBy}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => router.push(`/estimation/boq/edit/${boqId}`)}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Edit className="h-4 w-4" />
                <span>Edit</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                <Send className="h-4 w-4" />
                <span>Send</span>
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
              <p className="text-xs font-medium text-blue-600 uppercase mb-1">Estimated Value</p>
              <p className="text-2xl font-bold text-blue-900">₹{(boq.estimatedValue / 10000000).toFixed(2)}Cr</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
              <p className="text-xs font-medium text-purple-600 uppercase mb-1">Total Items</p>
              <p className="text-lg font-semibold text-purple-900">{boq.totalItems} Items</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
              <p className="text-xs font-medium text-green-600 uppercase mb-1">Client</p>
              <p className="text-lg font-semibold text-green-900">{boq.clientName}</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
              <p className="text-xs font-medium text-orange-600 uppercase mb-1">Duration</p>
              <p className="text-lg font-semibold text-orange-900">{boq.projectDuration}</p>
            </div>
          </div>

          {/* Progress Tracker */}
          <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg p-3 border border-gray-200">
            <h3 className="text-sm font-bold text-gray-700 uppercase mb-2">BOQ Progress</h3>
            <div className="relative">
              <div className="flex items-center justify-between">
                {getBOQStages(boq).map((stage, index) => {
                  const StageIcon = stage.icon;
                  const isLast = index === getBOQStages(boq).length - 1;

                  return (
                    <div key={stage.id} className="flex items-center flex-1">
                      <div className="flex flex-col items-center relative z-10">
                        {/* Stage Icon */}
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

                        {/* Stage Name */}
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

                      {/* Connector Line */}
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
                  <p className="text-sm font-semibold text-gray-900">{boq.projectName}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Client</p>
                  <p className="text-sm font-semibold text-gray-900">{boq.clientName}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Location</p>
                  <p className="text-sm text-gray-900">{boq.projectLocation}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Duration</p>
                  <p className="text-sm text-gray-900">{boq.projectDuration}</p>
                </div>
              </div>
            </div>

            {/* BOQ Details */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-600" />
                BOQ Details
              </h3>
              <div className="bg-gray-50 rounded-lg p-3 space-y-3">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">BOQ Number</p>
                  <p className="text-sm font-semibold text-gray-900">{boq.boqNumber}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Revision</p>
                  <p className="text-sm font-semibold text-gray-900">Revision {boq.revisionNumber}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Total Items</p>
                  <p className="text-sm text-gray-900">{boq.totalItems} items</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Linked Estimation</p>
                  <p className="text-sm text-blue-600 font-semibold">{boq.linkedEstimation || 'Not Linked'}</p>
                </div>
              </div>
            </div>

            {/* Financial Summary */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-blue-600" />
                Financial Summary
              </h3>
              <div className="bg-gray-50 rounded-lg p-3 space-y-3">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Estimated Value</p>
                  <p className="text-xl font-bold text-blue-900">₹{boq.estimatedValue.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Currency</p>
                  <p className="text-sm font-semibold text-gray-900">{boq.currency}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Total Quantity</p>
                  <p className="text-sm text-gray-900">{boq.totalQuantity.toLocaleString()} units</p>
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
                  <p className="text-sm font-semibold text-gray-900">{boq.createdDate}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Created By</p>
                  <p className="text-sm text-gray-900">{boq.createdBy}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Approved Date</p>
                  <p className="text-sm font-semibold text-gray-900">{boq.approvedDate || 'Pending'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Approved By</p>
                  <p className="text-sm text-gray-900">{boq.approvedBy || 'Pending'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* BOQ Items Tab */}
        {activeTab === 'items' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-bold text-gray-900">BOQ Items Breakdown</h3>
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Download className="h-4 w-4" />
                <span>Export Items</span>
              </button>
            </div>

            {/* Items Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Item No</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Description</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Unit</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Quantity</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Unit Rate</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Total Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {boqItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.itemNo}</td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-900">{item.description}</p>
                        <p className="text-xs text-gray-500">{item.specifications}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.unit}</td>
                      <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">{item.quantity.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-900">₹{item.unitRate.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-right font-bold text-blue-900">₹{item.totalAmount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                  <tr>
                    <td colSpan={6} className="px-4 py-3 text-right text-sm font-bold text-gray-900">Grand Total:</td>
                    <td className="px-4 py-3 text-right text-lg font-bold text-blue-900">
                      ₹{boqItems.reduce((sum, item) => sum + item.totalAmount, 0).toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* Activity Timeline Tab */}
        {activeTab === 'activity' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-bold text-gray-900">Activity Timeline</h3>
              <button className="flex items-center space-x-2 px-4 py-2 bg-yellow-50 text-yellow-600 hover:bg-yellow-100 rounded-lg transition-colors">
                <FileText className="h-4 w-4" />
                <span>Add Note</span>
              </button>
            </div>

            {/* Activities List */}
            <div className="space-y-2">
              {mockActivities
                .filter(activity => activity.boqId === boqId)
                .map((activity, index) => {
                  const ActivityIcon = activityIcons[activity.type];
                  const isLast = index === mockActivities.filter(a => a.boqId === boqId).length - 1;

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

                          <p className="text-sm text-gray-700 mb-3">{activity.description}</p>

                          {activity.metadata && (
                            <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                              {activity.metadata.revisionFrom && activity.metadata.revisionTo && (
                                <div className="flex items-center space-x-1">
                                  <Copy className="h-4 w-4" />
                                  <span>Rev {activity.metadata.revisionFrom} → Rev {activity.metadata.revisionTo}</span>
                                </div>
                              )}
                              {activity.metadata.attachmentCount && (
                                <div className="flex items-center space-x-1">
                                  <Package className="h-4 w-4" />
                                  <span>{activity.metadata.attachmentCount} files</span>
                                </div>
                              )}
                            </div>
                          )}
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
