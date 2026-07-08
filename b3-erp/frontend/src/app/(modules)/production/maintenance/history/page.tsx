'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Search,
  Filter,
  Calendar,
  Clock,
  Download,
  Eye,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { ProductionOrphanService } from '@/services/production/production-orphan.service';
import { exportToCsv } from '@/lib/export';

interface MaintenanceHistory {
  id: string;
  maintenanceId: string;
  equipmentCode: string;
  equipmentName: string;
  maintenanceType: 'preventive' | 'corrective' | 'breakdown' | 'inspection';
  startDate: string;
  completionDate: string;
  duration: number; // hours
  technician: string;
  status: 'completed' | 'partially-completed' | 'failed';
  workDescription: string;
  partsReplaced: string[];
  cost: number;
  downtime: number;
  remarks: string;
  nextScheduled: string;
}

export default function MaintenanceHistoryPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [selectedHistory, setSelectedHistory] = useState<MaintenanceHistory | null>(null);

  // Maintenance history loaded from the NestJS backend (production/maintenance-logs).
  const [maintenanceHistory, setMaintenanceHistory] = useState<MaintenanceHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        // Backend returns raw ORM shape (equipmentCode/equipmentName/maintenanceType/
        // startDate/endDate/status/description/partsReplaced/cost/performedBy...).
        const raw = (await ProductionOrphanService.getMaintenanceLogs()) as any[];
        const typeMap: Record<string, MaintenanceHistory['maintenanceType']> = {
          Preventive: 'preventive', preventive: 'preventive',
          Corrective: 'corrective', corrective: 'corrective',
          Breakdown: 'breakdown', breakdown: 'breakdown',
          Inspection: 'inspection', inspection: 'inspection',
        };
        const statusMap: Record<string, MaintenanceHistory['status']> = {
          Completed: 'completed', completed: 'completed',
          PartiallyCompleted: 'partially-completed', 'partially-completed': 'partially-completed',
          Failed: 'failed', failed: 'failed',
        };
        const mapped: MaintenanceHistory[] = (Array.isArray(raw) ? raw : []).map((m: any, i: number) => {
          const parts: string[] = Array.isArray(m?.partsReplaced)
            ? m.partsReplaced.map((p: any) => (typeof p === 'string' ? p : (p?.name ?? p?.itemName ?? String(p)))).filter(Boolean)
            : [];
          return {
            id: String(m?.id ?? i),
            maintenanceId: m?.logNumber ?? m?.code ?? String(m?.id ?? i),
            equipmentCode: m?.equipmentCode ?? '',
            equipmentName: m?.equipmentName ?? '',
            maintenanceType: typeMap[m?.maintenanceType] ?? 'preventive',
            startDate: m?.startDate ?? m?.scheduledDate ?? '',
            completionDate: m?.endDate ?? '',
            duration: Number(m?.durationHours ?? 0),
            technician: m?.performedBy ?? m?.technicianNotes ?? '',
            status: statusMap[m?.status] ?? 'completed',
            workDescription: m?.description ?? m?.actionTaken ?? '',
            partsReplaced: parts,
            cost: Number(m?.cost ?? 0),
            downtime: Number(m?.durationHours ?? 0),
            remarks: m?.technicianNotes ?? '',
            nextScheduled: m?.scheduledDate ?? '',
          };
        });
        if (!cancelled) setMaintenanceHistory(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load maintenance history');
          setMaintenanceHistory([]);
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

  const filteredHistory = maintenanceHistory.filter(record => {
    const matchesSearch =
      record.maintenanceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.equipmentCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.equipmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.technician.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === 'all' || record.maintenanceType === filterType;

    let matchesPeriod = true;
    if (filterPeriod !== 'all') {
      const recordDate = new Date(record.completionDate);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - recordDate.getTime()) / (1000 * 60 * 60 * 24));

      switch (filterPeriod) {
        case 'week':
          matchesPeriod = daysDiff <= 7;
          break;
        case 'month':
          matchesPeriod = daysDiff <= 30;
          break;
        case 'quarter':
          matchesPeriod = daysDiff <= 90;
          break;
      }
    }

    return matchesSearch && matchesType && matchesPeriod;
  });

  const totalRecords = maintenanceHistory.length;
  const totalCost = maintenanceHistory.reduce((sum, r) => sum + r.cost, 0);
  const totalDowntime = maintenanceHistory.reduce((sum, r) => sum + r.downtime, 0);
  const avgDuration = totalRecords > 0 ? maintenanceHistory.reduce((sum, r) => sum + r.duration, 0) / totalRecords : 0;

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'preventive': return 'bg-blue-100 text-blue-800';
      case 'corrective': return 'bg-yellow-100 text-yellow-800';
      case 'breakdown': return 'bg-red-100 text-red-800';
      case 'inspection': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'partially-completed': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewDetails = (record: MaintenanceHistory) => {
    setSelectedHistory(record);
  };

  const handleExport = () => {
    exportToCsv(
      `maintenance-history-${new Date().toISOString().slice(0, 10)}`,
      filteredHistory,
      [
        { key: 'maintenanceId', label: 'ID' },
        { key: 'equipmentCode', label: 'Equipment Code' },
        { key: 'equipmentName', label: 'Equipment Name' },
        { key: 'maintenanceType', label: 'Type' },
        { key: 'startDate', label: 'Start Date' },
        { key: 'completionDate', label: 'Completion Date' },
        { key: 'duration', label: 'Duration (h)' },
        { key: 'technician', label: 'Technician' },
        { key: 'status', label: 'Status' },
        { key: 'cost', label: 'Cost' },
        { key: 'downtime', label: 'Downtime (h)' },
        { key: 'workDescription', label: 'Work Description' },
        { key: 'remarks', label: 'Remarks' },
      ],
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 px-3 py-2">
      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading maintenance history…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}
      {!isLoading && !loadError && maintenanceHistory.length === 0 && (
        <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          No maintenance history found.
        </div>
      )}
      {/* Header */}
      <div className="mb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Maintenance History</h1>
            <p className="text-sm text-gray-500 mt-1">View past maintenance records and analytics</p>
          </div>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Download className="w-4 h-4" />
          Export History
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Records</p>
              <p className="text-2xl font-bold text-gray-900">{totalRecords}</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Cost</p>
              <p className="text-2xl font-bold text-orange-600">₹{(totalCost / 1000).toFixed(0)}K</p>
            </div>
            <TrendingUp className="w-8 h-8 text-orange-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Downtime</p>
              <p className="text-2xl font-bold text-red-600">{totalDowntime.toFixed(1)}h</p>
            </div>
            <TrendingDown className="w-8 h-8 text-red-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Duration</p>
              <p className="text-2xl font-bold text-blue-600">{avgDuration.toFixed(1)}h</p>
            </div>
            <Clock className="w-8 h-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 mb-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search maintenance history..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="all">All Types</option>
              <option value="preventive">Preventive</option>
              <option value="corrective">Corrective</option>
              <option value="breakdown">Breakdown</option>
              <option value="inspection">Inspection</option>
            </select>
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={filterPeriod}
              onChange={(e) => setFilterPeriod(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="all">All Time</option>
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
            </select>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Equipment</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Start</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Completed</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Technician</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cost</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Downtime</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredHistory.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">{record.maintenanceId}</span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-sm font-medium text-gray-900">{record.equipmentCode}</div>
                    <div className="text-sm text-gray-500">{record.equipmentName}</div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(record.maintenanceType)}`}>
                      {record.maintenanceType}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{record.startDate}</span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{record.completionDate}</span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{record.duration}h</span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{record.technician}</span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className="text-sm font-semibold text-gray-900">₹{(record.cost / 1000).toFixed(1)}K</span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={`text-sm font-semibold ${record.downtime > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {record.downtime}h
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(record.status)}`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <button
                      onClick={() => handleViewDetails(record)}
                      className="text-blue-600 hover:text-blue-900"
                      title="View Details"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Details Modal */}
      {selectedHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg p-3 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-xl font-bold text-gray-900">Maintenance Record - {selectedHistory.maintenanceId}</h2>
              <button
                onClick={() => setSelectedHistory(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <AlertCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm font-medium text-gray-700">Equipment Code</label>
                  <p className="text-gray-900">{selectedHistory.equipmentCode}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Equipment Name</label>
                  <p className="text-gray-900">{selectedHistory.equipmentName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Maintenance Type</label>
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(selectedHistory.maintenanceType)}`}>
                    {selectedHistory.maintenanceType}
                  </span>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedHistory.status)}`}>
                    {selectedHistory.status}
                  </span>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Start Date/Time</label>
                  <p className="text-gray-900">{selectedHistory.startDate}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Completion Date/Time</label>
                  <p className="text-gray-900">{selectedHistory.completionDate}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Duration</label>
                  <p className="text-gray-900">{selectedHistory.duration} hours</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Technician</label>
                  <p className="text-gray-900">{selectedHistory.technician}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Cost</label>
                  <p className="text-gray-900 font-semibold">₹{selectedHistory.cost.toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Downtime</label>
                  <p className={`font-semibold ${selectedHistory.downtime > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {selectedHistory.downtime} hours
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Next Scheduled</label>
                  <p className="text-gray-900">{selectedHistory.nextScheduled}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Work Description</label>
                <p className="text-gray-900 mt-1">{selectedHistory.workDescription}</p>
              </div>
              {selectedHistory.partsReplaced.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Parts Replaced</label>
                  <ul className="mt-1 space-y-1">
                    {selectedHistory.partsReplaced.map((part, idx) => (
                      <li key={idx} className="text-gray-900 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        {part}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-700">Remarks</label>
                <p className="text-gray-900 mt-1">{selectedHistory.remarks}</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setSelectedHistory(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
