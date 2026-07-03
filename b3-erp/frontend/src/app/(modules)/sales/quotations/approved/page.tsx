'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  TrendingUp,
  DollarSign,
  FileText,
  Eye,
  Download,
  Send,
  Copy,
  ArrowRight,
  Search,
  Filter,
  Calendar,
  User,
  Building2,
  Phone,
  Mail,
  Package,
  Award,
  Clock,
  ShoppingCart,
  AlertCircle
} from 'lucide-react';
import { quotationService } from '@/services/quotation.service';

interface ApprovedQuotation {
  id: string;
  quotationNumber: string;
  customerName: string;
  customerCompany: string;
  customerEmail: string;
  customerPhone: string;
  quotationDate: string;
  approvedDate: string;
  validUntil: string;
  totalAmount: number;
  items: number;
  assignedTo: string;
  approvedBy: string;
  conversionStatus: 'pending_conversion' | 'converted' | 'expired';
  salesOrderNumber?: string;
  discount: number;
  paymentTerms: string;
  deliveryTerms: string;
  notes: string;
}

export default function ApprovedQuotationsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [conversionFilter, setConversionFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('all');
  const [quotations, setQuotations] = useState<ApprovedQuotation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        // Backend returns raw quotation ORM rows; keep the approved/converted
        // lifecycle statuses and map to this page's ApprovedQuotation shape.
        const { data } = await quotationService.getAllQuotations();
        const raw = (data ?? []) as any[];
        const mapped: ApprovedQuotation[] = raw
          .filter((q) => ['accepted', 'converted'].includes(String(q?.status)))
          .map((q) => ({
            id: String(q?.id ?? ''),
            quotationNumber: q?.quotationNumber ?? '',
            customerName: q?.customerName ?? '',
            customerCompany: q?.customerCompany ?? q?.customerName ?? '',
            customerEmail: q?.customerEmail ?? '',
            customerPhone: q?.customerPhone ?? '',
            quotationDate: q?.quotationDate ? String(q.quotationDate) : '',
            approvedDate: q?.approvedAt ? String(q.approvedAt) : (q?.updatedAt ? String(q.updatedAt) : ''),
            validUntil: q?.validUntil ? String(q.validUntil) : '',
            totalAmount: Number(q?.totalAmount ?? 0),
            items: Array.isArray(q?.items) ? q.items.length : Number(q?.items ?? 0),
            assignedTo: q?.salesPersonName ?? q?.salesPersonId ?? '—',
            approvedBy: q?.approvedBy ?? '—',
            conversionStatus: String(q?.status) === 'converted' ? 'converted' : 'pending_conversion',
            salesOrderNumber: q?.convertedToOrderNumber ?? undefined,
            discount: Number(q?.discountPercentage ?? 0),
            paymentTerms: q?.paymentTerms ?? '',
            deliveryTerms: q?.deliveryTerms ?? '',
            notes: q?.notes ?? '',
          }));
        if (!cancelled) setQuotations(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load approved quotations');
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
    const matchesConversion = conversionFilter === 'all' || quotation.conversionStatus === conversionFilter;

    // Date range filter
    let matchesDate = true;
    if (dateRange !== 'all') {
      const approvedDate = new Date(quotation.approvedDate);
      const now = new Date();
      const daysAgo = Math.floor((now.getTime() - approvedDate.getTime()) / (1000 * 60 * 60 * 24));

      if (dateRange === 'last_7_days') matchesDate = daysAgo <= 7;
      else if (dateRange === 'last_30_days') matchesDate = daysAgo <= 30;
      else if (dateRange === 'last_90_days') matchesDate = daysAgo <= 90;
    }

    return matchesSearch && matchesConversion && matchesDate;
  });

  const stats = [
    {
      label: 'Total Approved',
      value: quotations.length,
      subtitle: 'All time',
      icon: CheckCircle,
      color: 'from-green-500 to-green-600'
    },
    {
      label: 'Converted to Orders',
      value: quotations.filter(q => q.conversionStatus === 'converted').length,
      subtitle: `${Math.round((quotations.filter(q => q.conversionStatus === 'converted').length / quotations.length) * 100)}% conversion rate`,
      icon: ShoppingCart,
      color: 'from-blue-500 to-blue-600'
    },
    {
      label: 'Pending Conversion',
      value: quotations.filter(q => q.conversionStatus === 'pending_conversion').length,
      subtitle: 'Awaiting orders',
      icon: Clock,
      color: 'from-orange-500 to-orange-600'
    },
    {
      label: 'Total Value',
      value: '₹' + (quotations.reduce((sum, q) => sum + q.totalAmount, 0) / 10000000).toFixed(1) + 'Cr',
      subtitle: 'Approved pipeline',
      icon: DollarSign,
      color: 'from-purple-500 to-purple-600'
    }
  ];

  const getConversionStatusColor = (status: string) => {
    switch (status) {
      case 'converted': return 'bg-green-100 text-green-700 border-green-200';
      case 'pending_conversion': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'expired': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getConversionStatusLabel = (status: string) => {
    switch (status) {
      case 'converted': return 'Converted';
      case 'pending_conversion': return 'Pending Conversion';
      case 'expired': return 'Expired';
      default: return status;
    }
  };

  return (
    <div className="w-full h-full px-4 py-2">
      <div className="space-y-3">
        {isLoading && (
          <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
            Loading approved quotations…
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
                Conversion Status
              </label>
              <select
                value={conversionFilter}
                onChange={(e) => setConversionFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="converted">Converted</option>
                <option value="pending_conversion">Pending Conversion</option>
                <option value="expired">Expired</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Date Range
              </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Time</option>
                <option value="last_7_days">Last 7 Days</option>
                <option value="last_30_days">Last 30 Days</option>
                <option value="last_90_days">Last 90 Days</option>
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
                quotation.conversionStatus === 'converted' ? 'border-green-200 bg-green-50/20' : 'border-gray-200'
              }`}
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{quotation.quotationNumber}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getConversionStatusColor(quotation.conversionStatus)}`}>
                        {getConversionStatusLabel(quotation.conversionStatus)}
                      </span>
                      {quotation.conversionStatus === 'converted' && (
                        <Award className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-semibold">
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
                    <p className="text-xs text-gray-500">Approved Date</p>
                    <div className="flex items-center gap-1 mt-1">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(quotation.approvedDate).toLocaleDateString('en-US', {
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
                    <div className="flex items-center gap-1 mt-1">
                      <Package className="w-4 h-4 text-gray-400" />
                      <p className="text-lg font-bold text-gray-900">{quotation.items}</p>
                    </div>
                  </div>
                </div>

                {/* Sales Order Link */}
                {quotation.salesOrderNumber && (
                  <div className="bg-green-50 rounded-lg p-3 mb-2 border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-green-700 mb-1">Converted to Sales Order</p>
                        <p className="text-sm font-bold text-green-900">{quotation.salesOrderNumber}</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                )}

                {/* Additional Details */}
                <div className="grid grid-cols-2 gap-3 mb-2 pb-4 border-b border-gray-200">
                  <div>
                    <p className="text-xs text-gray-500">Discount</p>
                    <p className="text-sm font-medium text-gray-900 mt-1">{quotation.discount}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Payment Terms</p>
                    <p className="text-sm font-medium text-gray-900 mt-1">{quotation.paymentTerms}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500">Delivery Terms</p>
                    <p className="text-sm font-medium text-gray-900 mt-1">{quotation.deliveryTerms}</p>
                  </div>
                </div>

                {/* Team Info */}
                <div className="space-y-2 mb-2">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Assigned to:</span>
                    <span className="font-medium text-gray-900">{quotation.assignedTo}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-gray-600">Approved by:</span>
                    <span className="font-medium text-gray-900">{quotation.approvedBy}</span>
                  </div>
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
                  {quotation.conversionStatus === 'pending_conversion' ? (
                    <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
                      <ShoppingCart className="w-4 h-4" />
                      Convert to Order
                    </button>
                  ) : (
                    <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                      <Eye className="w-4 h-4" />
                      View Order
                    </button>
                  )}
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Download className="w-4 h-4 text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-blue-50 rounded-lg transition-colors">
                    <Send className="w-4 h-4 text-blue-600" />
                  </button>
                  <button className="p-2 hover:bg-purple-50 rounded-lg transition-colors">
                    <Copy className="w-4 h-4 text-purple-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredQuotations.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <CheckCircle className="w-16 h-16 text-gray-300 mb-2" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Approved Quotations</h3>
            <p className="text-gray-600">No quotations match your current filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
