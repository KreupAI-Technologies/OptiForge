'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Download, AlertTriangle, Clock, TrendingDown, Activity, Wrench, Zap } from 'lucide-react';
import { ProductionOrphanService } from '@/services/production/production-orphan.service';
import { exportToCsv } from '@/lib/export';
import {
  LogDowntimeModal, ViewDowntimeDetailsModal, EditDowntimeEventModal,
  ResolveDowntimeModal, DeleteDowntimeModal,
  LogDowntimeData, DowntimeEvent as DowntimeEventModal, EditDowntimeData, ResolveDowntimeData
} from '@/components/production/downtime/DowntimeEventModals';
import { QuickAnalysisModal, QuickAnalysisData } from '@/components/production/downtime/DowntimeAnalysisModals';
import { ExportDowntimeDataModal, ExportDowntimeConfig } from '@/components/production/downtime/DowntimeExportModals';

interface DowntimeEvent {
  id: string;
  eventNumber: string;
  equipment: string;
  location: string;
  startTime: string;
  endTime: string | null;
  duration: number; // in minutes
  status: 'ongoing' | 'resolved';
  category: 'breakdown' | 'changeover' | 'maintenance' | 'no-operator' | 'material-shortage' | 'power-outage' | 'quality-issue';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  affectedWO: string[];
  productionLoss: number;
  costImpact: number;
  reportedBy: string;
  assignedTo: string | null;
}

interface DowntimeSummary {
  period: string;
  totalDowntime: number; // in hours
  plannedDowntime: number;
  unplannedDowntime: number;
  breakdownHours: number;
  maintenanceHours: number;
  changeoverHours: number;
  otherHours: number;
  mtbf: number;
  mttr: number;
  availability: number;
}

export default function DowntimeDashboardPage() {
  const router = useRouter();
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Modal state
  const [isLogDowntimeOpen, setIsLogDowntimeOpen] = useState(false);
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isResolveOpen, setIsResolveOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isQuickAnalysisOpen, setIsQuickAnalysisOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<DowntimeEvent | null>(null);

  // Downtime events loaded from the NestJS backend (production/downtime-records).
  const [downtimeEvents, setDowntimeEvents] = useState<DowntimeEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        // Backend returns raw ORM shape (downtimeNumber/machineName/durationMinutes/
        // status/downtimeType/reason/reportedBy/resolvedBy/affectedWorkOrders...).
        const raw = (await ProductionOrphanService.getDowntimeRecords()) as any[];
        const catMap: Record<string, DowntimeEvent['category']> = {
          Breakdown: 'breakdown', breakdown: 'breakdown',
          Changeover: 'changeover', changeover: 'changeover',
          Maintenance: 'maintenance', maintenance: 'maintenance',
          NoOperator: 'no-operator', 'no-operator': 'no-operator',
          MaterialShortage: 'material-shortage', 'material-shortage': 'material-shortage',
          PowerOutage: 'power-outage', 'power-outage': 'power-outage',
          QualityIssue: 'quality-issue', 'quality-issue': 'quality-issue',
        };
        const mapped: DowntimeEvent[] = (Array.isArray(raw) ? raw : []).map((d: any, i: number) => {
          const resolved = !!(d?.endTime || d?.resolvedBy || String(d?.status).toLowerCase() === 'resolved');
          const wos: string[] = Array.isArray(d?.affectedWorkOrders)
            ? d.affectedWorkOrders.map((w: any) => (typeof w === 'string' ? w : (w?.workOrderNumber ?? String(w)))).filter(Boolean)
            : (d?.workOrderId ? [d.workOrderId] : []);
          const sev = String(d?.severity ?? '').toLowerCase();
          return {
            id: String(d?.id ?? i),
            eventNumber: d?.downtimeNumber ?? '',
            equipment: d?.machineName ?? d?.workCenterName ?? d?.machineId ?? '',
            location: d?.workCenterName ?? d?.productionLineId ?? '',
            startTime: d?.startTime ?? '',
            endTime: d?.endTime ?? null,
            duration: Number(d?.durationMinutes ?? 0),
            status: resolved ? 'resolved' : 'ongoing',
            category: catMap[d?.downtimeType ?? d?.category] ?? 'breakdown',
            severity: (['critical', 'high', 'medium', 'low'].includes(sev) ? sev : 'medium') as DowntimeEvent['severity'],
            description: d?.description ?? d?.reason ?? '',
            affectedWO: wos,
            productionLoss: Number(d?.lostProductionQuantity ?? 0),
            costImpact: Number(d?.totalCost ?? 0),
            reportedBy: d?.reportedBy ?? '',
            assignedTo: d?.resolvedBy ?? null,
          };
        });
        if (!cancelled) setDowntimeEvents(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load downtime events');
          setDowntimeEvents([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const refreshEvents = () => setRefreshKey((k) => k + 1);

  // Mock summary data
  const downtimeSummary: DowntimeSummary = {
    period: 'Oct 2025 (MTD)',
    totalDowntime: 58.5,
    plannedDowntime: 12.5,
    unplannedDowntime: 46.0,
    breakdownHours: 28.5,
    maintenanceHours: 12.5,
    changeoverHours: 8.2,
    otherHours: 9.3,
    mtbf: 420,
    mttr: 6.8,
    availability: 92.5
  };

  const filteredEvents = downtimeEvents.filter(event => {
    const categoryMatch = filterCategory === 'all' || event.category === filterCategory;
    const statusMatch = filterStatus === 'all' || event.status === filterStatus;
    return categoryMatch && statusMatch;
  });

  const ongoingDowntime = downtimeEvents.filter(e => e.status === 'ongoing').length;
  const totalEvents = downtimeEvents.length;
  const criticalEvents = downtimeEvents.filter(e => e.severity === 'critical').length;
  const totalProductionLoss = downtimeEvents.reduce((sum, e) => sum + e.productionLoss, 0);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'breakdown': return 'text-red-700 bg-red-100';
      case 'maintenance': return 'text-blue-700 bg-blue-100';
      case 'changeover': return 'text-green-700 bg-green-100';
      case 'material-shortage': return 'text-yellow-700 bg-yellow-100';
      case 'no-operator': return 'text-orange-700 bg-orange-100';
      case 'power-outage': return 'text-purple-700 bg-purple-100';
      case 'quality-issue': return 'text-pink-700 bg-pink-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-700 bg-red-100 border-red-200';
      case 'high': return 'text-orange-700 bg-orange-100 border-orange-200';
      case 'medium': return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      case 'low': return 'text-green-700 bg-green-100 border-green-200';
      default: return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ongoing': return 'text-red-700 bg-red-100';
      case 'resolved': return 'text-green-700 bg-green-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'breakdown': return <AlertTriangle className="w-5 h-5" />;
      case 'maintenance': return <Wrench className="w-5 h-5" />;
      case 'changeover': return <Activity className="w-5 h-5" />;
      case 'power-outage': return <Zap className="w-5 h-5" />;
      default: return <Clock className="w-5 h-5" />;
    }
  };

  // Modal handlers
  const handleLogDowntime = () => {
    setIsLogDowntimeOpen(true);
  };

  const handleLogDowntimeSubmit = async (data: LogDowntimeData) => {
    try {
      await ProductionOrphanService.createDowntimeRecord(data);
      refreshEvents();
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to log downtime event');
    } finally {
      setIsLogDowntimeOpen(false);
    }
  };

  const handleViewEvent = (event: DowntimeEvent) => {
    setSelectedEvent(event);
    setIsViewDetailsOpen(true);
  };

  const handleEditEvent = () => {
    setIsViewDetailsOpen(false);
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (data: EditDowntimeData) => {
    const event = selectedEvent;
    if (!event) {
      setIsEditOpen(false);
      return;
    }
    try {
      await ProductionOrphanService.updateDowntimeRecord(event.id, data);
      refreshEvents();
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to update downtime event');
    } finally {
      setIsEditOpen(false);
    }
  };

  const handleResolveEvent = () => {
    setIsViewDetailsOpen(false);
    setIsResolveOpen(true);
  };

  const handleResolveSubmit = async (data: ResolveDowntimeData) => {
    const event = selectedEvent;
    try {
      if (event) {
        await ProductionOrphanService.endDowntimeRecord(event.id, data);
        refreshEvents();
      }
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to resolve downtime event');
    } finally {
      setIsResolveOpen(false);
    }
    if (data.requireRCA) {
      router.push('/production/downtime/rca');
    }
  };

  const handleDeleteEvent = (event: DowntimeEvent) => {
    setSelectedEvent(event);
    setIsDeleteOpen(true);
  };

  const handleDeleteSubmit = async (reason: string) => {
    const event = selectedEvent;
    if (!event) {
      setIsDeleteOpen(false);
      return;
    }
    try {
      await ProductionOrphanService.deleteDowntimeRecord(event.id);
      setDowntimeEvents(prev => prev.filter(e => e.id !== event.id));
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to delete downtime event');
    } finally {
      setIsDeleteOpen(false);
      setSelectedEvent(null);
    }
  };

  const handleQuickAnalysis = () => {
    setIsQuickAnalysisOpen(true);
  };

  const handleExport = () => {
    setIsExportOpen(true);
  };

  const handleExportSubmit = async (_config: ExportDowntimeConfig) => {
    exportToCsv('downtime-events', filteredEvents as unknown as Record<string, unknown>[]);
    setIsExportOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 px-3 py-2">
      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading downtime events…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4" />
          {loadError}
        </div>
      )}
      {!isLoading && !loadError && downtimeEvents.length === 0 && (
        <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          No downtime events found.
        </div>
      )}
      {/* Inline Header */}
      <div className="mb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Downtime Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">Track and analyze production downtime events</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleLogDowntime}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Log Downtime
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-3 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Ongoing Downtime</p>
              <p className="text-2xl font-bold text-red-900 mt-1">{ongoingDowntime}</p>
              <p className="text-xs text-red-600 mt-1">Requires immediate action</p>
            </div>
            <div className="p-3 bg-red-200 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-700" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-3 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Total Downtime (MTD)</p>
              <p className="text-2xl font-bold text-orange-900 mt-1">{downtimeSummary.totalDowntime}h</p>
              <p className="text-xs text-orange-600 mt-1">{downtimeSummary.unplannedDowntime}h unplanned</p>
            </div>
            <div className="p-3 bg-orange-200 rounded-lg">
              <Clock className="w-6 h-6 text-orange-700" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Availability</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{downtimeSummary.availability}%</p>
              <p className="text-xs text-blue-600 mt-1">MTBF: {downtimeSummary.mtbf}h</p>
            </div>
            <div className="p-3 bg-blue-200 rounded-lg">
              <Activity className="w-6 h-6 text-blue-700" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-3 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Production Loss</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">{totalProductionLoss}</p>
              <p className="text-xs text-purple-600 mt-1">units this month</p>
            </div>
            <div className="p-3 bg-purple-200 rounded-lg">
              <TrendingDown className="w-6 h-6 text-purple-700" />
            </div>
          </div>
        </div>
      </div>

      {/* Downtime Breakdown */}
      <div className="bg-white rounded-xl border border-gray-200 p-3 mb-3">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Downtime Breakdown (MTD)</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div className="p-4 bg-red-50 rounded-lg">
            <p className="text-sm text-red-600">Breakdown</p>
            <p className="text-2xl font-bold text-red-900">{downtimeSummary.breakdownHours}h</p>
            <p className="text-xs text-gray-600">{((downtimeSummary.breakdownHours / downtimeSummary.totalDowntime) * 100).toFixed(1)}% of total</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-600">Maintenance</p>
            <p className="text-2xl font-bold text-blue-900">{downtimeSummary.maintenanceHours}h</p>
            <p className="text-xs text-gray-600">{((downtimeSummary.maintenanceHours / downtimeSummary.totalDowntime) * 100).toFixed(1)}% of total</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-green-600">Changeover</p>
            <p className="text-2xl font-bold text-green-900">{downtimeSummary.changeoverHours}h</p>
            <p className="text-xs text-gray-600">{((downtimeSummary.changeoverHours / downtimeSummary.totalDowntime) * 100).toFixed(1)}% of total</p>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-600">Other</p>
            <p className="text-2xl font-bold text-yellow-900">{downtimeSummary.otherHours}h</p>
            <p className="text-xs text-gray-600">{((downtimeSummary.otherHours / downtimeSummary.totalDowntime) * 100).toFixed(1)}% of total</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-3 mb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-gray-400" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            <option value="breakdown">Breakdown</option>
            <option value="maintenance">Maintenance</option>
            <option value="changeover">Changeover</option>
            <option value="material-shortage">Material Shortage</option>
            <option value="no-operator">No Operator</option>
            <option value="power-outage">Power Outage</option>
            <option value="quality-issue">Quality Issue</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="ongoing">Ongoing</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Downtime Events */}
      <div className="space-y-2">
        {filteredEvents.map((event) => (
          <div
            key={event.id}
            onClick={() => handleViewEvent(event)}
            className={`bg-white rounded-xl border-2 p-3 cursor-pointer hover:shadow-lg transition-shadow ${getSeverityColor(event.severity)}`}
          >
            <div className="flex items-start gap-2">
              {/* Icon */}
              <div className={`p-3 rounded-lg ${getCategoryColor(event.category)}`}>
                {getCategoryIcon(event.category)}
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-gray-900">{event.eventNumber}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSeverityColor(event.severity)}`}>
                        {event.severity}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                        {event.status}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(event.category)}`}>
                        {event.category}
                      </span>
                    </div>
                    <p className="text-gray-700 font-medium mb-2">{event.equipment}</p>
                    <p className="text-sm text-gray-600 mb-3">{event.description}</p>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <p className="text-gray-500">Location</p>
                        <p className="font-semibold text-gray-900">{event.location}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Start Time</p>
                        <p className="font-semibold text-gray-900">{event.startTime}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Duration</p>
                        <p className="font-semibold text-orange-600">{event.duration} mins</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Production Loss</p>
                        <p className="font-semibold text-red-600">{event.productionLoss} units</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Cost Impact</p>
                        <p className="font-semibold text-orange-600">₹{(event.costImpact / 1000).toFixed(0)}K</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Reported By</p>
                        <p className="font-semibold text-gray-900">{event.reportedBy}</p>
                      </div>
                      {event.assignedTo && (
                        <div>
                          <p className="text-gray-500">Assigned To</p>
                          <p className="font-semibold text-blue-600">{event.assignedTo}</p>
                        </div>
                      )}
                      {event.affectedWO.length > 0 && (
                        <div>
                          <p className="text-gray-500">Affected WOs</p>
                          <p className="font-semibold text-gray-900">{event.affectedWO.join(', ')}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-2">
        <button
          onClick={handleLogDowntime}
          className="p-4 bg-white border-2 border-red-200 rounded-xl hover:bg-red-50 transition-colors text-left"
        >
          <Clock className="w-6 h-6 text-red-600 mb-2" />
          <p className="font-semibold text-gray-900">Downtime Log</p>
          <p className="text-sm text-gray-500">Record new downtime event</p>
        </button>
        <button
          onClick={handleQuickAnalysis}
          className="p-4 bg-white border-2 border-blue-200 rounded-xl hover:bg-blue-50 transition-colors text-left"
        >
          <Activity className="w-6 h-6 text-blue-600 mb-2" />
          <p className="font-semibold text-gray-900">Downtime Analysis</p>
          <p className="text-sm text-gray-500">View trends and patterns</p>
        </button>
        <button
          onClick={() => router.push('/production/downtime/rca')}
          className="p-4 bg-white border-2 border-purple-200 rounded-xl hover:bg-purple-50 transition-colors text-left"
        >
          <AlertTriangle className="w-6 h-6 text-purple-600 mb-2" />
          <p className="font-semibold text-gray-900">Root Cause Analysis</p>
          <p className="text-sm text-gray-500">Investigate major events</p>
        </button>
      </div>

      {/* Modals */}
      <LogDowntimeModal
        isOpen={isLogDowntimeOpen}
        onClose={() => setIsLogDowntimeOpen(false)}
        onSubmit={handleLogDowntimeSubmit}
      />

      <ViewDowntimeDetailsModal
        isOpen={isViewDetailsOpen}
        onClose={() => setIsViewDetailsOpen(false)}
        event={selectedEvent}
        onEdit={handleEditEvent}
        onResolve={handleResolveEvent}
        onInitiateRCA={() => alert('RCA modal would open')}
      />

      <EditDowntimeEventModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSubmit={handleEditSubmit}
        event={selectedEvent}
      />

      <ResolveDowntimeModal
        isOpen={isResolveOpen}
        onClose={() => setIsResolveOpen(false)}
        onSubmit={handleResolveSubmit}
        onSubmitWithRCA={(data: ResolveDowntimeData) => {
          handleResolveSubmit(data);
          router.push('/production/downtime/rca');
        }}
        event={selectedEvent}
      />

      <DeleteDowntimeModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteSubmit}
        event={selectedEvent}
      />

      <QuickAnalysisModal
        isOpen={isQuickAnalysisOpen}
        onClose={() => setIsQuickAnalysisOpen(false)}
        data={{
          period: 'Last 30 Days',
          summary: {
            totalDowntime: 58.5,
            totalEvents: 32,
            availability: 92.5,
          },
          topEquipment: [
            { rank: 1, equipment: 'ASSY-LINE-01', downtimeHours: 18.5, eventCount: 6, severity: 'critical' },
            { rank: 2, equipment: 'POLISH-01', downtimeHours: 12.8, eventCount: 4, severity: 'high' },
            { rank: 3, equipment: 'CNC-CUT-01', downtimeHours: 8.2, eventCount: 2, severity: 'medium' },
          ],
          topCategories: [
            { category: 'Breakdown', percentage: 48.7, hours: 28.5, count: 19 },
            { category: 'Maintenance', percentage: 21.4, hours: 12.5, count: 8 },
            { category: 'Changeover', percentage: 14.0, hours: 8.2, count: 12 },
          ],
          recommendations: [
            { text: 'Schedule preventive maintenance for ASSY-LINE-01', priority: 'high' },
            { text: 'Review breakdown patterns for recurring issues', priority: 'medium' },
            { text: 'Optimize changeover procedures', priority: 'low' },
          ],
        }}
      />

      <ExportDowntimeDataModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        onExport={handleExportSubmit}
      />
    </div>
  );
}
