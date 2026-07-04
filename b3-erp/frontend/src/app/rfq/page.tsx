'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  Download,
  Mail,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users
} from 'lucide-react';
import { procurementRFQService } from '@/services/procurement-rfq.service';

interface RFQ {
  id: string;
  rfqNumber: string;
  title: string;
  category: string;
  issueDate: string;
  closingDate: string;
  status: 'draft' | 'issued' | 'responses_received' | 'under_evaluation' | 'awarded' | 'closed' | 'cancelled';
  vendorCount: number;
  responseCount: number;
  itemCount: number;
}

// Maps the backend RFQStatus (Title Case) onto this page's status vocabulary.
const STATUS_MAP: Record<string, RFQ['status']> = {
  Draft: 'draft',
  Sent: 'issued',
  'Responses Received': 'responses_received',
  'Under Evaluation': 'under_evaluation',
  Awarded: 'awarded',
  Cancelled: 'cancelled',
  Expired: 'closed',
};

const statusConfig = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800', icon: Edit },
  issued: { label: 'Issued', color: 'bg-blue-100 text-blue-800', icon: Mail },
  responses_received: { label: 'Responses Received', color: 'bg-purple-100 text-purple-800', icon: Users },
  under_evaluation: { label: 'Under Evaluation', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  awarded: { label: 'Awarded', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  closed: { label: 'Closed', color: 'bg-gray-100 text-gray-600', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: XCircle },
};

export default function RFQListPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const result = await procurementRFQService.getAllRFQs();
        const raw = Array.isArray(result?.data) ? result.data : [];
        const mapped: RFQ[] = raw.map((r: any) => ({
          id: String(r.id ?? ''),
          rfqNumber: r.rfqNumber ?? '',
          title: r.title ?? '',
          category: r.department ?? r.category ?? '—',
          issueDate: (r.createdDate ?? r.createdAt ?? '').slice(0, 10),
          closingDate: (r.responseDeadline ?? '').slice(0, 10),
          status: STATUS_MAP[r.status] ?? 'draft',
          vendorCount: Array.isArray(r.invitedVendors) ? r.invitedVendors.length : 0,
          responseCount: Array.isArray(r.quotes) ? r.quotes.length : 0,
          itemCount: Array.isArray(r.items) ? r.items.length : 0,
        }));
        if (!cancelled) setRfqs(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load RFQs');
          setRfqs([]);
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

  const filteredRFQs = rfqs.filter(rfq => {
    const matchesSearch = rfq.rfqNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rfq.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || rfq.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: rfqs.length,
    active: rfqs.filter(r => ['issued', 'responses_received', 'under_evaluation'].includes(r.status)).length,
    awarded: rfqs.filter(r => r.status === 'awarded').length,
    draft: rfqs.filter(r => r.status === 'draft').length,
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-3">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <FileText className="h-8 w-8 text-amber-600" />
          Request for Quotation (RFQ)
        </h1>
        <p className="text-gray-600 mt-2">Manage vendor quotation requests and responses</p>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading RFQs…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}
      {!isLoading && !loadError && rfqs.length === 0 && (
        <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          No RFQs found.
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Total RFQs</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{stats.total}</p>
            </div>
            <FileText className="h-10 w-10 text-blue-600 opacity-50" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Active</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{stats.active}</p>
            </div>
            <Clock className="h-10 w-10 text-green-600 opacity-50" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Awarded</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">{stats.awarded}</p>
            </div>
            <CheckCircle className="h-10 w-10 text-purple-600 opacity-50" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-600 text-sm font-medium">Draft</p>
              <p className="text-2xl font-bold text-yellow-900 mt-1">{stats.draft}</p>
            </div>
            <Edit className="h-10 w-10 text-yellow-600 opacity-50" />
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex flex-col md:flex-row gap-2 justify-between">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search RFQs by number or title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="issued">Issued</option>
              <option value="responses_received">Responses Received</option>
              <option value="under_evaluation">Under Evaluation</option>
              <option value="awarded">Awarded</option>
              <option value="closed">Closed</option>
            </select>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter className="h-4 w-4" />
              More Filters
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              <Download className="h-4 w-4" />
              Export
            </button>
            <Link
              href="/rfq/add"
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Create RFQ
            </Link>
          </div>
        </div>
      </div>

      {/* RFQ Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RFQ Details</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timeline</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendors/Responses</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRFQs.map((rfq) => {
                const statusInfo = statusConfig[rfq.status];
                const StatusIcon = statusInfo.icon;
                const daysUntilClosing = Math.ceil((new Date(rfq.closingDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

                return (
                  <tr key={rfq.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-2">
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{rfq.rfqNumber}</div>
                        <div className="text-sm text-gray-600 mt-1">{rfq.title}</div>
                        <div className="text-xs text-gray-500 mt-1">{rfq.itemCount} items</div>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                        {rfq.category}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="text-sm">
                        <div className="text-gray-600">Issue: {rfq.issueDate}</div>
                        <div className="text-gray-600">Close: {rfq.closingDate}</div>
                        {daysUntilClosing > 0 && daysUntilClosing <= 5 && (
                          <div className="text-xs text-orange-600 font-medium mt-1 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {daysUntilClosing} days left
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="text-sm">
                        <div className="text-gray-900 font-medium">{rfq.responseCount}/{rfq.vendorCount} vendors</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {((rfq.responseCount / rfq.vendorCount) * 100).toFixed(0)}% response rate
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-1 inline-flex items-center gap-1 text-xs font-semibold rounded-full ${statusInfo.color}`}>
                        <StatusIcon className="h-3 w-3" />
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <Link
                          href={`/rfq/view/${rfq.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/rfq/edit/${rfq.id}`}
                          className="text-amber-600 hover:text-amber-900"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button className="text-red-600 hover:text-red-900">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-gray-50 px-3 py-2 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredRFQs.length}</span> of{' '}
            <span className="font-medium">{rfqs.length}</span> results
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
              Previous
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
