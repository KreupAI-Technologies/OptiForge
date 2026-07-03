'use client';

import React, { useState, useEffect } from 'react';
import {
  Clock,
  Send,
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
  Calendar,
  User,
  DollarSign,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  FileText,
  Phone,
  Mail,
  Building2,
  ArrowUpRight,
  Copy
} from 'lucide-react';
import { quotationService } from '@/services/quotation.service';

interface PendingQuotation {
  id: string;
  quotationNumber: string;
  customerName: string;
  customerCompany: string;
  customerEmail: string;
  customerPhone: string;
  quotationDate: string;
  validUntil: string;
  totalAmount: number;
  items: number;
  assignedTo: string;
  status: 'pending_approval' | 'pending_send' | 'awaiting_response';
  priority: 'high' | 'medium' | 'low';
  daysRemaining: number;
  lastFollowUp?: string;
  notes: string;
}

export default function PendingQuotationsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [quotations, setQuotations] = useState<PendingQuotation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        // Backend returns raw quotation ORM rows; keep only the "pending"
        // lifecycle statuses and map to this page's PendingQuotation shape.
        const { data } = await quotationService.getAllQuotations();
        const raw = (data ?? []) as any[];
        const statusMap: Record<string, PendingQuotation['status']> = {
          draft: 'pending_send',
          sent: 'awaiting_response',
          under_review: 'pending_approval',
        };
        const mapped: PendingQuotation[] = raw
          .filter((q) => ['draft', 'sent', 'under_review'].includes(String(q?.status)))
          .map((q) => {
            const validUntil = q?.validUntil ? String(q.validUntil) : '';
            const daysRemaining = validUntil
              ? Math.max(
                  0,
                  Math.round(
                    (new Date(validUntil).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
                  ),
                )
              : 0;
            return {
              id: String(q?.id ?? ''),
              quotationNumber: q?.quotationNumber ?? '',
              customerName: q?.customerName ?? '',
              customerCompany: q?.customerCompany ?? q?.customerName ?? '',
              customerEmail: q?.customerEmail ?? '',
              customerPhone: q?.customerPhone ?? '',
              quotationDate: q?.quotationDate ? String(q.quotationDate) : '',
              validUntil,
              totalAmount: Number(q?.totalAmount ?? 0),
              items: Array.isArray(q?.items) ? q.items.length : Number(q?.items ?? 0),
              assignedTo: q?.salesPersonName ?? q?.salesPersonId ?? '—',
              status: statusMap[String(q?.status)] ?? 'awaiting_response',
              priority: 'medium',
              daysRemaining,
              notes: q?.notes ?? '',
            };
          });
        if (!cancelled) setQuotations(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load pending quotations');
          setQuotations([]);
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

  const filteredQuotations = quotations.filter(quotation => {
    const matchesSearch = quotation.quotationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quotation.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quotation.customerCompany.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || quotation.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || quotation.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const stats = [
    {
      label: 'Total Pending',
      value: quotations.length,
      subtitle: `${quotations.filter(q => q.daysRemaining < 7).length} expiring soon`,
      icon: Clock,
      color: 'from-blue-500 to-blue-600'
    },
    {
      label: 'Awaiting Response',
      value: quotations.filter(q => q.status === 'awaiting_response').length,
      subtitle: 'Sent to customers',
      icon: Send,
      color: 'from-purple-500 to-purple-600'
    },
    {
      label: 'Pending Approval',
      value: quotations.filter(q => q.status === 'pending_approval').length,
      subtitle: 'Internal review',
      icon: AlertCircle,
      color: 'from-orange-500 to-orange-600'
    },
    {
      label: 'Total Value',
      value: '₹' + (quotations.reduce((sum, q) => sum + q.totalAmount, 0) / 10000000).toFixed(1) + 'Cr',
      subtitle: 'In pipeline',
      icon: DollarSign,
      color: 'from-green-500 to-green-600'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_approval': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'pending_send': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'awaiting_response': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending_approval': return 'Pending Approval';
      case 'pending_send': return 'Pending Send';
      case 'awaiting_response': return 'Awaiting Response';
      default: return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="w-full h-full px-4 py-2">
      <div className="space-y-3">
        {isLoading && (
          <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
            Loading pending quotations…
          </div>
        )}
        {loadError && !isLoading && (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4" />
            {loadError}
          </div>
        )}
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className={`bg-gradient-to-br ${stat.color} rounded-xl p-3 text-white`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm">{stat.label}</p>
                    <p className="text-3xl font-bold mt-1">{stat.value}</p>
                    <p className="text-white/70 text-xs mt-1">{stat.subtitle}</p>
                  </div>
                  <Icon className="w-12 h-12 text-white/30" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Search className="w-4 h-4 inline mr-1" />
                Search
              </label>
              <input
                type="text"
                placeholder="Search by quotation number, customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Filter className="w-4 h-4 inline mr-1" />
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending_approval">Pending Approval</option>
                <option value="pending_send">Pending Send</option>
                <option value="awaiting_response">Awaiting Response</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Priorities</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>
          </div>
        </div>

        {/* Quotations Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {filteredQuotations.map((quotation) => (
            <div
              key={quotation.id}
              className={`bg-white rounded-lg border-2 transition-all hover:shadow-lg ${
                quotation.daysRemaining < 7 ? 'border-orange-300 bg-orange-50/30' : 'border-gray-200'
              }`}
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{quotation.quotationNumber}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(quotation.status)}`}>
                        {getStatusLabel(quotation.status)}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(quotation.priority)}`}>
                        {quotation.priority.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {quotation.customerName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{quotation.customerName}</p>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Building2 className="w-4 h-4" />
                          {quotation.customerCompany}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Details */}
                <div className="grid grid-cols-2 gap-3 mb-2 pb-4 border-b border-gray-200">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{quotation.customerEmail}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{quotation.customerPhone}</span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div>
                    <p className="text-xs text-gray-500">Quotation Date</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(quotation.quotationDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Valid Until</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(quotation.validUntil).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Total Amount</p>
                    <p className="text-lg font-bold text-gray-900 mt-1">
                      ₹{(quotation.totalAmount / 100000).toFixed(1)}L
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Items</p>
                    <p className="text-lg font-bold text-gray-900 mt-1">{quotation.items}</p>
                  </div>
                </div>

                {/* Days Remaining */}
                <div className="mb-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-600">Days Remaining</span>
                    <span className={`text-sm font-bold ${
                      quotation.daysRemaining < 7 ? 'text-red-600' : quotation.daysRemaining < 14 ? 'text-orange-600' : 'text-green-600'
                    }`}>
                      {quotation.daysRemaining} days
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        quotation.daysRemaining < 7
                          ? 'bg-red-500'
                          : quotation.daysRemaining < 14
                          ? 'bg-orange-500'
                          : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min((quotation.daysRemaining / 30) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Additional Info */}
                <div className="space-y-2 mb-2 pb-4 border-b border-gray-200">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Assigned to:</span>
                    <span className="font-medium text-gray-900">{quotation.assignedTo}</span>
                  </div>
                  {quotation.lastFollowUp && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Last Follow-up:</span>
                      <span className="font-medium text-gray-900">
                        {new Date(quotation.lastFollowUp).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  )}
                </div>

                {/* Notes */}
                {quotation.notes && (
                  <div className="bg-blue-50 rounded-lg p-3 mb-2">
                    <p className="text-xs font-medium text-blue-900 mb-1">Notes</p>
                    <p className="text-sm text-blue-800">{quotation.notes}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                    <Send className="w-4 h-4" />
                    {quotation.status === 'pending_send' ? 'Send Now' : 'Follow Up'}
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Eye className="w-4 h-4 text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-blue-50 rounded-lg transition-colors">
                    <Edit className="w-4 h-4 text-blue-600" />
                  </button>
                  <button className="p-2 hover:bg-purple-50 rounded-lg transition-colors">
                    <Copy className="w-4 h-4 text-purple-600" />
                  </button>
                  <button className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredQuotations.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Clock className="w-16 h-16 text-gray-300 mb-2" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Pending Quotations</h3>
            <p className="text-gray-600">No quotations match your current filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
