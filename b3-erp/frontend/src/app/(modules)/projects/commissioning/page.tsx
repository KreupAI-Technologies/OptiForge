'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { projectManagementService, PmCommissioningRecord } from '@/services/ProjectManagementService';
import { Plus, Search, Eye, Edit, Wrench, CheckCircle, XCircle, Clock, Calendar, MapPin, Download, Filter, ChevronLeft, ChevronRight, FileText } from 'lucide-react';

interface Commissioning {
  id: string;
  projectCode: string;
  projectName: string;
  siteLocation: string;
  commissioningDate: string;
  commissioningEngineer: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'failed' | 'rescheduled';
  testsPassed: number;
  totalTests: number;
  equipmentCount: number;
  commissionedEquipment: number;
  issuesFound: number;
  resolvedIssues: number;
  clientRepresentative: string;
  documentStatus: 'pending' | 'partial' | 'complete';
  handoverDate?: string;
}

const statusColors = {
  scheduled: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  completed: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  rescheduled: 'bg-orange-100 text-orange-700',
};

const documentStatusColors = {
  pending: 'bg-gray-100 text-gray-700',
  partial: 'bg-yellow-100 text-yellow-700',
  complete: 'bg-green-100 text-green-700',
};

const statusMap: Record<string, Commissioning['status']> = {
  Scheduled: 'scheduled', 'In Progress': 'in_progress', InProgress: 'in_progress',
  Completed: 'completed', Failed: 'failed', Rescheduled: 'rescheduled',
};

function mapCommissioning(c: PmCommissioningRecord): Commissioning {
  const total = Number(c.totalTests ?? c.totalChecks ?? 0);
  const passed = Number(c.testsPassed ?? c.passedChecks ?? 0);
  const docState = (c.documentStatus as Commissioning['documentStatus']) ?? (c.certificateIssued ? 'complete' : 'pending');
  return {
    id: c.id,
    projectCode: c.projectCode ?? c.systemCode ?? c.activityNumber ?? '',
    projectName: c.projectName ?? c.equipmentSystem ?? '',
    siteLocation: c.siteLocation ?? c.location ?? '',
    commissioningDate: c.commissioningDate ?? c.scheduledDate ?? '',
    commissioningEngineer: c.commissioningEngineer ?? c.engineer ?? '',
    status: statusMap[c.status ?? ''] ?? (c.status as Commissioning['status']) ?? 'scheduled',
    testsPassed: passed,
    totalTests: total,
    equipmentCount: Number(c.equipmentCount ?? 0),
    commissionedEquipment: Number(c.commissionedEquipment ?? 0),
    issuesFound: Number(c.issuesFound ?? c.failedChecks ?? 0),
    resolvedIssues: Number(c.resolvedIssues ?? 0),
    clientRepresentative: c.clientRepresentative ?? c.clientRep ?? '',
    documentStatus: docState,
    handoverDate: c.handoverDate ?? c.actualDate ?? undefined,
  };
}

export default function CommissioningPage() {
  const router = useRouter();
  const [commissioning, setCommissioning] = useState<Commissioning[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const rows = await projectManagementService.listCommissioning();
        if (!cancelled) setCommissioning((rows ?? []).map(mapCommissioning));
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load commissioning records');
          setCommissioning([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredCommissioning = commissioning.filter((item) => {
    const matchesSearch =
      item.projectCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.siteLocation.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredCommissioning.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCommissioning = filteredCommissioning.slice(startIndex, startIndex + itemsPerPage);

  const stats = {
    totalActivities: commissioning.length,
    inProgress: commissioning.filter((c) => c.status === 'in_progress').length,
    completed: commissioning.filter((c) => c.status === 'completed').length,
    scheduled: commissioning.filter((c) => c.status === 'scheduled').length,
  };

  return (
    <div className="w-full min-h-screen px-3 py-2 ">
      {isLoading && (<div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">Loading commissioning records...</div>)}
      {loadError && !isLoading && (<div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{loadError}</div>)}
      {/* Stats */}
      <div className="mb-3 grid grid-cols-1 md:grid-cols-4 gap-2">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Activities</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{stats.totalActivities}</p>
            </div>
            <Wrench className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Scheduled</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">{stats.scheduled}</p>
            </div>
            <Clock className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">In Progress</p>
              <p className="text-2xl font-bold text-yellow-900 mt-1">{stats.inProgress}</p>
            </div>
            <Wrench className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Completed</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{stats.completed}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-3 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search commissioning activities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="scheduled">Scheduled</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
          <option value="rescheduled">Rescheduled</option>
        </select>
        <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
          <Download className="h-5 w-5" />
          <span>Export</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto max-h-[calc(100vh-400px)] overflow-y-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project & Site</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Schedule</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tests</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Equipment</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issues</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Documents</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedCommissioning.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{item.projectCode}</div>
                    <div className="text-sm text-gray-700">{item.projectName}</div>
                    <div className="flex items-center text-xs text-gray-500 mt-0.5">
                      <MapPin className="h-3 w-3 mr-1" />
                      {item.siteLocation}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center text-sm text-gray-900">
                      <Calendar className="h-4 w-4 mr-1" />
                      {item.commissioningDate}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{item.commissioningEngineer}</div>
                    {item.handoverDate && (
                      <div className="text-xs text-green-600 mt-1">Handover: {item.handoverDate}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-semibold text-gray-900">
                      {item.testsPassed}/{item.totalTests}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className={`h-2 rounded-full ${
                          item.testsPassed === item.totalTests
                            ? 'bg-green-500'
                            : item.testsPassed > 0
                            ? 'bg-blue-500'
                            : 'bg-gray-300'
                        }`}
                        style={{ width: `${(item.testsPassed / item.totalTests) * 100}%` }}
                      ></div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-semibold text-gray-900">
                      {item.commissionedEquipment}/{item.equipmentCount}
                    </div>
                    <div className="text-xs text-gray-500">
                      {Math.round((item.commissionedEquipment / item.equipmentCount) * 100)}% done
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-semibold text-gray-900">
                      {item.resolvedIssues}/{item.issuesFound}
                    </div>
                    <div className="text-xs text-gray-500">
                      {item.issuesFound - item.resolvedIssues} pending
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${documentStatusColors[item.documentStatus]}`}>
                      {item.documentStatus.charAt(0).toUpperCase() + item.documentStatus.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[item.status]}`}>
                      {item.status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => router.push(`/projects/commissioning/view/${item.id}`)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => router.push(`/projects/commissioning/edit/${item.id}`)}
                        className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => router.push(`/projects/commissioning/docs/${item.id}`)}
                        className="p-1.5 text-purple-600 hover:bg-purple-50 rounded transition-colors"
                      >
                        <FileText className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-3 py-2 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredCommissioning.length)} of {filteredCommissioning.length} activities
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
