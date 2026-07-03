'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { salesHandoverService } from '@/services/sales-handover.service';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  Send,
  FileText,
  Package,
  Users,
  Calendar,
  AlertCircle,
  Download,
  Eye,
  MessageSquare,
} from 'lucide-react';

interface HandoverItem {
  id: string;
  handoverNumber: string;
  projectNumber: string;
  projectName: string;
  customer: string;
  salesPerson: string;
  projectManager: string;
  handoverDate: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Rejected';
  completionPercentage: number;
  documentsAttached: number;
  requiredDocuments: number;
  clientRequestDate: string;
}

export default function SalesHandoverPage() {
  const [handovers, setHandovers] = useState<HandoverItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = await salesHandoverService.getHandovers();
        const mapped: HandoverItem[] = raw.map((h) => ({
          id: h.id,
          handoverNumber: h.handoverNumber,
          projectNumber: h.projectNumber ?? '',
          projectName: h.projectName,
          customer: h.customer ?? '',
          salesPerson: h.salesPerson ?? '',
          projectManager: h.projectManager ?? '',
          handoverDate: h.handoverDate ?? '',
          status: (h.status as HandoverItem['status']) ?? 'Pending',
          completionPercentage: Number(h.completionPercentage ?? 0),
          documentsAttached: Number(h.documentsAttached ?? 0),
          requiredDocuments: Number(h.requiredDocuments ?? 0),
          clientRequestDate: h.clientRequestDate ?? '',
        }));
        if (!cancelled) setHandovers(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load handovers');
          setHandovers([]);
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

  const filteredHandovers = handovers.filter(
    (h) => statusFilter === 'All' || h.status === statusFilter
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'In Progress':
        return <Clock className="w-5 h-5 text-blue-600" />;
      case 'Pending':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'Rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  const stats = {
    total: handovers.length,
    completed: handovers.filter((h) => h.status === 'Completed').length,
    inProgress: handovers.filter((h) => h.status === 'In Progress').length,
    pending: handovers.filter((h) => h.status === 'Pending').length,
  };

  return (
    <div className="w-full h-screen overflow-y-auto overflow-x-hidden bg-gray-50">
      <div className="px-3 py-2 space-y-3">
        {/* Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Link
                href="/sales"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Sales-to-Project Handover
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Phase 1: Transfer projects from sales to project execution team
                </p>
              </div>
            </div>
            <Link
              href="/sales/handover/package"
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Send className="w-4 h-4" />
              New Handover
            </Link>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Handovers</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Package className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Handover List */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Handover Details
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project Info
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Team
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Documents
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                      Loading handovers...
                    </td>
                  </tr>
                )}
                {!isLoading && loadError && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-red-600">
                      {loadError}
                    </td>
                  </tr>
                )}
                {!isLoading && !loadError && filteredHandovers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                      No handovers found.
                    </td>
                  </tr>
                )}
                {!isLoading && !loadError && filteredHandovers.map((handover) => (
                  <tr key={handover.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {handover.handoverNumber}
                        </div>
                        <div className="text-xs text-gray-500">
                          {handover.handoverDate || 'Not started'}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {handover.projectName}
                        </div>
                        <div className="text-xs text-gray-500">{handover.projectNumber}</div>
                        <div className="text-xs text-gray-500">{handover.customer}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-xs space-y-1">
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-gray-400" />
                          <span className="text-gray-600">Sales:</span>
                          <span className="font-medium">{handover.salesPerson}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-gray-400" />
                          <span className="text-gray-600">PM:</span>
                          <span className="font-medium">{handover.projectManager}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {handover.documentsAttached} / {handover.requiredDocuments}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${(handover.documentsAttached / handover.requiredDocuments) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(handover.status)}
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(handover.status)}`}
                        >
                          {handover.status}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {handover.completionPercentage}% complete
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="View Documents"
                        >
                          <FileText className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Download Package"
                        >
                          <Download className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-blue-900">
                About Sales-to-Project Handover
              </h3>
              <p className="text-sm text-blue-700 mt-1">
                This is the critical Phase 1 step where awarded projects are transferred from the
                sales team to the project execution team. Ensure all required documents (BOQ,
                drawings, contract, client details) are attached before handover.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
