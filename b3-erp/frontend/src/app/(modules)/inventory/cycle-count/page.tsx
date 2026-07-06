'use client';

import React, { useState, useEffect } from 'react';
import { inventoryService } from '@/services/InventoryService';
import {
  ClipboardList,
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Package,
  Search,
  Filter,
  Download,
  Plus,
  RefreshCw,
  BarChart3,
  Play
} from 'lucide-react';
import {
  CreateScheduleModal,
  StartSessionModal,
  PerformCountModal,
  ViewSessionDetailsModal,
  VarianceAnalysisModal,
  CycleCountSchedule,
  CycleCountSession,
  CycleCountVarianceAnalysis,
  CycleCountItem
} from '@/components/inventory/InventoryCycleCountModals';

interface CycleCount {
  id: string;
  countNumber: string;
  warehouse: string;
  zone: string;
  countType: 'ABC' | 'Random' | 'Full' | 'Spot';
  scheduledDate: string;
  assignedTo: string;
  itemsToCount: number;
  itemsCounted: number;
  variancesFound: number;
  status: 'scheduled' | 'in-progress' | 'completed' | 'reconciled';
  accuracy: number;
}

export default function CycleCountPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  // Modal states
  const [isCreateScheduleModalOpen, setIsCreateScheduleModalOpen] = useState(false);
  const [isStartSessionModalOpen, setIsStartSessionModalOpen] = useState(false);
  const [isPerformCountModalOpen, setIsPerformCountModalOpen] = useState(false);
  const [isViewDetailsModalOpen, setIsViewDetailsModalOpen] = useState(false);
  const [isVarianceAnalysisModalOpen, setIsVarianceAnalysisModalOpen] = useState(false);

  // Selected data
  const [selectedSession, setSelectedSession] = useState<CycleCountSession | null>(null);
  const [selectedVarianceAnalysis, setSelectedVarianceAnalysis] = useState<CycleCountVarianceAnalysis | null>(null);

  const [cycleCounts, setCycleCounts] = useState<CycleCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCycleCounts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await inventoryService.getCycleCounts();
      const mapped: CycleCount[] = (data || []).map((c) => ({
        id: String(c.id),
        countNumber: c.countNumber,
        warehouse: c.warehouse,
        zone: c.zone,
        countType: (c.countType as CycleCount['countType']) || 'Full',
        scheduledDate: c.scheduledDate
          ? String(c.scheduledDate).split('T')[0]
          : '',
        assignedTo: c.assignedTo,
        itemsToCount: Number(c.itemsToCount) || 0,
        itemsCounted: Number(c.itemsCounted) || 0,
        variancesFound: Number(c.variancesFound) || 0,
        status: (c.status as CycleCount['status']) || 'scheduled',
        accuracy: Number(c.accuracy) || 0,
      }));
      setCycleCounts(mapped);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load cycle counts');
      setCycleCounts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCycleCounts();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'in-progress':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'reconciled':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Calendar className="w-4 h-4" />;
      case 'in-progress':
        return <Clock className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'reconciled':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'ABC':
        return 'bg-purple-100 text-purple-800';
      case 'Random':
        return 'bg-blue-100 text-blue-800';
      case 'Full':
        return 'bg-orange-100 text-orange-800';
      case 'Spot':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const scheduledCount = cycleCounts.filter(c => c.status === 'scheduled').length;
  const inProgressCount = cycleCounts.filter(c => c.status === 'in-progress').length;
  const completedCount = cycleCounts.filter(c => c.status === 'completed').length;
  const totalVariances = cycleCounts.reduce((sum, c) => sum + c.variancesFound, 0);
  const avgAccuracy = cycleCounts.filter(c => c.accuracy > 0).reduce((sum, c) => sum + c.accuracy, 0) / 
                       cycleCounts.filter(c => c.accuracy > 0).length;

  const filteredCounts = cycleCounts.filter(count => {
    const matchesSearch = count.countNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         count.warehouse.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         count.zone.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || count.status === selectedStatus;
    const matchesType = selectedType === 'all' || count.countType === selectedType;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Map backend cycle-count line rows to the modal's CycleCountItem shape.
  const mapSessionItems = (count: CycleCount, rawItems: any[]): CycleCountItem[] => {
    const items: CycleCountItem[] = (rawItems || []).map((l: any, index: number) => {
      const expected = Number(l.expectedQuantity ?? l.systemQuantity ?? 0);
      const counted = Number(l.countedQuantity ?? l.physicalQuantity ?? 0);
      const isCounted = l.countedQuantity != null || l.physicalQuantity != null;
      return {
        itemId: String(l.itemId ?? l.id ?? `${count.id}-${index + 1}`),
        itemCode: l.itemCode ?? '',
        itemName: l.itemName ?? '',
        location: l.location ?? l.warehouseName ?? count.warehouse,
        zone: l.zone ?? l.zoneName ?? count.zone,
        bin: l.bin ?? l.binName ?? '-',
        expectedQuantity: expected,
        countedQuantity: counted,
        variance: 0,
        variancePercentage: 0,
        status: (isCounted ? 'counted' : 'pending') as CycleCountItem['status'],
        countedBy: l.countedByName ?? l.countedBy ?? (isCounted ? count.assignedTo : undefined),
        countedDate: l.countedDate ?? (isCounted ? count.scheduledDate : undefined),
        notes: l.notes ?? ''
      };
    });

    // Calculate variance for counted items
    items.forEach(item => {
      if (item.countedQuantity > 0) {
        item.variance = item.countedQuantity - item.expectedQuantity;
        item.variancePercentage = item.expectedQuantity > 0
          ? (item.variance / item.expectedQuantity) * 100
          : 0;
        if (Math.abs(item.variancePercentage) > 5) {
          item.status = 'discrepancy';
        }
      }
    });

    return items;
  };

  // Fetch real cycle-count line items from the backend detail endpoint.
  const loadSessionItems = async (count: CycleCount): Promise<CycleCountItem[]> => {
    try {
      const detail = (await inventoryService.getCycleCount(count.id)) as any;
      const raw: any[] = Array.isArray(detail?.items)
        ? detail.items
        : Array.isArray(detail?.lines)
          ? detail.lines
          : [];
      return mapSessionItems(count, raw);
    } catch (err) {
      console.error('Failed to load cycle-count items', err);
      return [];
    }
  };

  // Helper function to convert CycleCount to CycleCountSession
  const convertToSession = (count: CycleCount, sessionItems: CycleCountItem[] = []): CycleCountSession => {
    const items = sessionItems;

    const sessionStatus: 'draft' | 'in-progress' | 'completed' | 'verified' =
      count.status === 'scheduled' ? 'draft' :
      count.status === 'in-progress' ? 'in-progress' :
      count.status === 'completed' ? 'completed' :
      'verified';

    return {
      sessionId: count.countNumber,
      sessionName: `${count.zone} - ${count.countType} Count`,
      warehouse: count.warehouse,
      zones: [count.zone],
      countDate: count.scheduledDate,
      assignedTo: count.assignedTo,
      items,
      status: sessionStatus,
      progress: count.itemsToCount > 0 ? Math.round((count.itemsCounted / count.itemsToCount) * 100) : 0,
      totalItems: count.itemsToCount,
      countedItems: count.itemsCounted,
      discrepancies: count.variancesFound,
      notes: `${count.countType} type cycle count for ${count.zone}`
    };
  };

  // Helper function to generate variance analysis
  const generateVarianceAnalysis = (session: CycleCountSession): CycleCountVarianceAnalysis => {
    const itemsWithVariance = session.items.filter(item => item.variance !== 0);
    const highVarianceItems = session.items
      .filter(item => Math.abs(item.variancePercentage) > 5)
      .sort((a, b) => Math.abs(b.variancePercentage) - Math.abs(a.variancePercentage))
      .slice(0, 10);

    const totalVariance = session.items.reduce((sum, item) => sum + Math.abs(item.variance), 0);
    const totalExpected = session.items.reduce((sum, item) => sum + item.expectedQuantity, 0);
    const variancePercentage = totalExpected > 0 ? (totalVariance / totalExpected) * 100 : 0;

    // Group by category (mock categories)
    const categories = ['Raw Materials', 'Components', 'Finished Goods', 'Consumables'];
    const varianceByCategory = categories.map(category => {
      const categoryItems = session.items.slice(0, Math.floor(session.items.length / categories.length));
      return {
        category,
        variance: categoryItems.reduce((sum, item) => sum + item.variance, 0),
        count: categoryItems.filter(item => item.variance !== 0).length
      };
    });

    // Group by zone
    const varianceByZone = session.zones.map(zone => ({
      zone,
      variance: session.items
        .filter(item => item.zone === zone)
        .reduce((sum, item) => sum + item.variance, 0),
      count: session.items
        .filter(item => item.zone === zone && item.variance !== 0).length
    }));

    return {
      sessionId: session.sessionId,
      totalVariance,
      variancePercentage,
      itemsWithVariance: itemsWithVariance.length,
      highVarianceItems,
      varianceByCategory,
      varianceByZone,
      recommendedActions: [
        'Review high variance items with physical verification team',
        'Investigate potential systematic counting errors in affected zones',
        'Update inventory records after verification',
        'Schedule recount for items with variance > 10%',
        'Review storage and handling procedures for affected categories'
      ]
    };
  };

  // Modal handlers
  const handleCreateSchedule = (data: CycleCountSchedule) => {
    // No backend mutation endpoint yet; optimistic local update.
    if (data) {
      const newCount: CycleCount = {
        id: `local-${Date.now()}`,
        countNumber: data.scheduleId || `CC-${Date.now()}`,
        warehouse: data.warehouse || 'Unknown Warehouse',
        zone: data.zones?.[0] || 'Unknown Zone',
        countType: 'Full',
        scheduledDate: data.startDate || new Date().toISOString().split('T')[0],
        assignedTo: data.assignedTo || 'Unassigned',
        itemsToCount: 0,
        itemsCounted: 0,
        variancesFound: 0,
        status: 'scheduled',
        accuracy: 0,
      };
      setCycleCounts((prev) => [...prev, newCount]);
    }
    setIsCreateScheduleModalOpen(false);
  };

  const handleStartSession = (data: CycleCountSession) => {
    // No backend mutation endpoint yet; optimistic local update.
    if (data) {
      const newCount: CycleCount = {
        id: `local-${Date.now()}`,
        countNumber: data.sessionId,
        warehouse: data.warehouse,
        zone: data.zones?.[0] || 'Unknown Zone',
        countType: 'ABC', // Default, should be from form
        scheduledDate: data.countDate,
        assignedTo: data.assignedTo,
        itemsToCount: data.totalItems ?? 0,
        itemsCounted: data.countedItems ?? 0,
        variancesFound: data.discrepancies ?? 0,
        status: 'in-progress',
        accuracy: 0
      };
      setCycleCounts((prev) => [...prev, newCount]);
    }
    setIsStartSessionModalOpen(false);
  };

  const handleUpdateCount = (itemId: string, countedQuantity: number, notes?: string) => {
    // No backend mutation endpoint yet; optimistic local update.
    if (selectedSession) {
      const updatedItems = selectedSession.items.map(item => {
        if (item.itemId === itemId) {
          const variance = countedQuantity - item.expectedQuantity;
          const variancePercentage = item.expectedQuantity > 0
            ? (variance / item.expectedQuantity) * 100
            : 0;

          return {
            ...item,
            countedQuantity,
            variance,
            variancePercentage,
            status: (Math.abs(variancePercentage) > 5 ? 'discrepancy' : 'counted') as 'pending' | 'counted' | 'verified' | 'discrepancy',
            notes: notes || item.notes,
            countedBy: selectedSession.assignedTo,
            countedDate: new Date().toISOString().split('T')[0]
          };
        }
        return item;
      });

      const countedItems = updatedItems.filter(item => item.countedQuantity > 0).length;
      const discrepancies = updatedItems.filter(item => item.status === 'discrepancy').length;
      const progress = Math.round((countedItems / updatedItems.length) * 100);

      const updatedSession: CycleCountSession = {
        ...selectedSession,
        items: updatedItems,
        countedItems,
        discrepancies,
        progress
      };

      setSelectedSession(updatedSession);

      // Update the main cycleCounts array
      setCycleCounts(cycleCounts.map(count =>
        count.countNumber === selectedSession.sessionId
          ? { ...count, itemsCounted: countedItems, variancesFound: discrepancies }
          : count
      ));
    }
  };

  const handleViewDetails = async (count: CycleCount) => {
    const items = await loadSessionItems(count);
    const session = convertToSession(count, items);
    setSelectedSession(session);
    setIsViewDetailsModalOpen(true);
  };

  const handleCompleteSession = () => {
    // No backend mutation endpoint yet; optimistic local update.
    if (selectedSession) {
      // Update the status in cycleCounts
      setCycleCounts(cycleCounts.map(count =>
        count.countNumber === selectedSession.sessionId
          ? { ...count, status: 'completed' }
          : count
      ));

      // Update selected session status
      setSelectedSession({
        ...selectedSession,
        status: 'completed'
      });
    }
  };

  const handleViewVarianceAnalysis = () => {
    if (selectedSession) {
      const analysis = generateVarianceAnalysis(selectedSession);
      setSelectedVarianceAnalysis(analysis);
      setIsVarianceAnalysisModalOpen(true);
    }
  };

  const handleVarianceClick = async (count: CycleCount) => {
    if (count.variancesFound > 0) {
      const items = await loadSessionItems(count);
      const session = convertToSession(count, items);
      const analysis = generateVarianceAnalysis(session);
      setSelectedVarianceAnalysis(analysis);
      setIsVarianceAnalysisModalOpen(true);
    }
  };

  const handlePerformCount = async (count: CycleCount) => {
    const items = await loadSessionItems(count);
    const session = convertToSession(count, items);
    setSelectedSession(session);
    setIsPerformCountModalOpen(true);
  };

  // Check if there's an in-progress session
  const inProgressSession = cycleCounts.find(c => c.status === 'in-progress');

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <ClipboardList className="w-8 h-8 text-blue-600" />
            <span>Cycle Count Dashboard</span>
          </h1>
          <p className="text-gray-600 mt-1">Manage and track inventory cycle counting activities</p>
        </div>
        <div className="flex items-center space-x-3">
          {inProgressSession && (
            <button
              onClick={() => handlePerformCount(inProgressSession)}
              className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 flex items-center space-x-2"
            >
              <ClipboardList className="w-4 h-4" />
              <span>Perform Count</span>
            </button>
          )}
          <button
            onClick={fetchCycleCounts}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button
            onClick={() => setIsStartSessionModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center space-x-2"
          >
            <Play className="w-4 h-4" />
            <span>Start Session</span>
          </button>
          <button
            onClick={() => setIsCreateScheduleModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Count</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-blue-900">{scheduledCount}</span>
          </div>
          <div className="text-sm font-medium text-blue-700">Scheduled</div>
          <div className="text-xs text-blue-600 mt-1">Upcoming Counts</div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-8 h-8 text-yellow-600" />
            <span className="text-2xl font-bold text-yellow-900">{inProgressCount}</span>
          </div>
          <div className="text-sm font-medium text-yellow-700">In Progress</div>
          <div className="text-xs text-yellow-600 mt-1">Active Counts</div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <span className="text-2xl font-bold text-green-900">{completedCount}</span>
          </div>
          <div className="text-sm font-medium text-green-700">Completed</div>
          <div className="text-xs text-green-600 mt-1">This Month</div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3 border border-red-200">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-8 h-8 text-red-600" />
            <span className="text-2xl font-bold text-red-900">{totalVariances}</span>
          </div>
          <div className="text-sm font-medium text-red-700">Total Variances</div>
          <div className="text-xs text-red-600 mt-1">Needs Review</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-purple-600" />
            <span className="text-2xl font-bold text-purple-900">{avgAccuracy.toFixed(1)}%</span>
          </div>
          <div className="text-sm font-medium text-purple-700">Avg Accuracy</div>
          <div className="text-xs text-purple-600 mt-1">Overall Performance</div>
        </div>
      </div>

      {/* Count Type Distribution */}
      <div className="bg-white rounded-lg shadow p-3">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Count Type Distribution</h3>
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <div className="text-2xl font-bold text-purple-900">
              {cycleCounts.filter(c => c.countType === 'ABC').length}
            </div>
            <div className="text-sm text-purple-700 font-medium mt-1">ABC Analysis</div>
            <div className="text-xs text-purple-600 mt-1">High-value items</div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="text-2xl font-bold text-blue-900">
              {cycleCounts.filter(c => c.countType === 'Random').length}
            </div>
            <div className="text-sm text-blue-700 font-medium mt-1">Random Sample</div>
            <div className="text-xs text-blue-600 mt-1">Statistical sampling</div>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <div className="text-2xl font-bold text-orange-900">
              {cycleCounts.filter(c => c.countType === 'Full').length}
            </div>
            <div className="text-sm text-orange-700 font-medium mt-1">Full Count</div>
            <div className="text-xs text-orange-600 mt-1">Complete inventory</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="text-2xl font-bold text-green-900">
              {cycleCounts.filter(c => c.countType === 'Spot').length}
            </div>
            <div className="text-sm text-green-700 font-medium mt-1">Spot Check</div>
            <div className="text-xs text-green-600 mt-1">Ad-hoc verification</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search counts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="reconciled">Reconciled</option>
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="ABC">ABC Analysis</option>
            <option value="Random">Random Sample</option>
            <option value="Full">Full Count</option>
            <option value="Spot">Spot Check</option>
          </select>
        </div>
      </div>

      {/* Cycle Counts Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Count #</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Warehouse / Zone</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scheduled Date</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variances</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Accuracy</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCounts.map((count) => (
                <tr
                  key={count.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleViewDetails(count)}
                >
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                    {count.countNumber}
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-900">
                    <div className="font-medium">{count.warehouse}</div>
                    <div className="text-xs text-gray-500">{count.zone}</div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(count.countType)}`}>
                      {count.countType}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">
                    {count.scheduledDate}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span>{count.assignedTo}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(count.itemsCounted / count.itemsToCount) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-600">
                        {count.itemsCounted}/{count.itemsToCount}
                      </span>
                    </div>
                  </td>
                  <td
                    className="px-3 py-2 whitespace-nowrap"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleVarianceClick(count);
                    }}
                  >
                    {count.variancesFound > 0 ? (
                      <span className="text-sm font-semibold text-red-600 hover:text-red-800 cursor-pointer underline">
                        {count.variancesFound}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-500">-</span>
                    )}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {count.accuracy > 0 ? (
                      <span className={`text-sm font-semibold ${count.accuracy >= 95 ? 'text-green-600' : count.accuracy >= 90 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {count.accuracy.toFixed(1)}%
                      </span>
                    ) : (
                      <span className="text-sm text-gray-500">-</span>
                    )}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center space-x-1 w-fit ${getStatusColor(count.status)}`}>
                      {getStatusIcon(count.status)}
                      <span className="capitalize">{count.status.replace('-', ' ')}</span>
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDetails(count);
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {loading && (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 text-blue-500 mb-2 mx-auto animate-spin" />
            <p className="text-gray-500">Loading cycle counts...</p>
          </div>
        )}

        {!loading && error && (
          <div className="text-center py-12">
            <AlertTriangle className="w-12 h-12 text-red-400 mb-2 mx-auto" />
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchCycleCounts}
              className="mt-3 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && filteredCounts.length === 0 && (
          <div className="text-center py-12">
            <ClipboardList className="w-12 h-12 text-gray-400 mb-2 mx-auto" />
            <p className="text-gray-500">No cycle counts found matching your filters</p>
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateScheduleModal
        isOpen={isCreateScheduleModalOpen}
        onClose={() => setIsCreateScheduleModalOpen(false)}
        onSubmit={handleCreateSchedule}
      />

      <StartSessionModal
        isOpen={isStartSessionModalOpen}
        onClose={() => setIsStartSessionModalOpen(false)}
        onSubmit={handleStartSession}
      />

      <PerformCountModal
        isOpen={isPerformCountModalOpen}
        onClose={() => setIsPerformCountModalOpen(false)}
        session={selectedSession}
        onUpdateCount={handleUpdateCount}
      />

      <ViewSessionDetailsModal
        isOpen={isViewDetailsModalOpen}
        onClose={() => setIsViewDetailsModalOpen(false)}
        session={selectedSession}
        onComplete={handleCompleteSession}
        onViewVariance={handleViewVarianceAnalysis}
      />

      <VarianceAnalysisModal
        isOpen={isVarianceAnalysisModalOpen}
        onClose={() => setIsVarianceAnalysisModalOpen(false)}
        analysis={selectedVarianceAnalysis}
      />
    </div>
  );
}
