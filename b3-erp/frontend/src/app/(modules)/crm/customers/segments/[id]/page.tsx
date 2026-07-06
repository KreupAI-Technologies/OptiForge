'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Users,
  TrendingUp,
  DollarSign,
  Calendar,
  Target,
  Filter,
  Download,
  Mail,
  Phone,
  Building2,
  MapPin,
  Edit,
  RefreshCw,
  Search,
  Eye,
  BarChart3,
  PieChart,
} from 'lucide-react';
import { useToast } from '@/components/ui';
import { exportToCsv } from '@/lib/export';
import { crmService } from '@/services/crm.service';

interface Customer {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  location: string;
  totalSpent: number;
  lastPurchase: string;
  status: 'active' | 'inactive';
  segment: string;
}

interface SegmentDetails {
  id: string;
  name: string;
  description: string;
  customerCount: number;
  totalRevenue: number;
  avgOrderValue: number;
  growthRate: number;
  createdDate: string;
  lastUpdated: string;
  criteria: string[];
  status: 'active' | 'inactive';
}

// Mock data
const emptySegment: SegmentDetails = {
  id: '',
  name: '',
  description: '',
  customerCount: 0,
  totalRevenue: 0,
  avgOrderValue: 0,
  growthRate: 0,
  createdDate: '',
  lastUpdated: '',
  criteria: [],
  status: 'active',
};

export default function SegmentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { addToast } = useToast();
  const segmentId = params.id as string;

  const [segment, setSegment] = useState<SegmentDetails>(emptySegment);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!segmentId) return;
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const data = await crmService.customerSegments.getById(segmentId);
        if (!cancelled && data) {
          const rawCriteria = (data as any)?.criteria;
          let criteria: string[] = [];
          if (Array.isArray(rawCriteria)) {
            criteria = rawCriteria.map((c: any) =>
              typeof c === 'string' ? c : (c?.label ?? c?.description ?? JSON.stringify(c))
            );
          }
          const rawStatus = String((data as any)?.status ?? '').toLowerCase();
          const mappedStatus: SegmentDetails['status'] = rawStatus === 'inactive' ? 'inactive' : 'active';

          const mapped: SegmentDetails = {
            id: String((data as any)?.id ?? segmentId),
            name: (data as any)?.name ?? '',
            description: (data as any)?.description ?? '',
            customerCount: Number((data as any)?.customerCount ?? (data as any)?.memberCount ?? 0),
            totalRevenue: Number((data as any)?.totalRevenue ?? 0),
            avgOrderValue: Number((data as any)?.avgOrderValue ?? 0),
            growthRate: Number((data as any)?.growthRate ?? 0),
            createdDate: (data as any)?.createdDate ?? (data as any)?.createdAt ?? '',
            lastUpdated: (data as any)?.lastUpdated ?? (data as any)?.updatedAt ?? '',
            criteria,
            status: mappedStatus,
          };
          setSegment(mapped);
        }
      } catch (e) {
        if (!cancelled) setLoadError(e instanceof Error ? e.message : 'Failed to load');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [segmentId]);

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || customer.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleRefreshData = () => {
    addToast({
      title: 'Data Refreshed',
      message: 'Segment data has been refreshed successfully',
      variant: 'success'
    });
  };

  const handleExportCustomers = () => {
    exportToCsv('segment-customers', filteredCustomers as unknown as Record<string, unknown>[]);
    addToast({
      title: 'Export Started',
      message: `Exporting ${filteredCustomers.length} customers to CSV`,
      variant: 'success'
    });
  };

  const handleSendCampaign = () => {
    addToast({
      title: 'Campaign Draft Created',
      message: `Campaign draft created for ${filteredCustomers.length} customers`,
      variant: 'success'
    });
  };

  return (
    <div className="w-full h-full px-3 py-2 ">
      {/* Header */}
      <div className="mb-3">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-2"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Segments
        </button>

        {isLoading && (
          <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
            Loading…
          </div>
        )}
        {loadError && !isLoading && (
          <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {loadError}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{segment.name}</h1>
            <p className="text-gray-600 mt-1">{segment.description}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleRefreshData}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => router.push(`/crm/customers/segments/edit/${segmentId}`)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Edit className="h-4 w-4" />
              <span>Edit Segment</span>
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Customers</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {segment.customerCount.toLocaleString()}
              </p>
            </div>
            <Users className="h-10 w-10 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                ${(segment.totalRevenue / 1000).toFixed(0)}K
              </p>
            </div>
            <DollarSign className="h-10 w-10 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                ${segment.avgOrderValue.toLocaleString()}
              </p>
            </div>
            <Target className="h-10 w-10 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Growth Rate</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                +{segment.growthRate}%
              </p>
            </div>
            <TrendingUp className="h-10 w-10 text-green-600" />
          </div>
        </div>
      </div>

      {/* Segment Criteria */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Segment Criteria</h2>
        <div className="flex flex-wrap gap-2">
          {segment.criteria.map((criterion, index) => (
            <span
              key={index}
              className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
            >
              {criterion}
            </span>
          ))}
        </div>
      </div>

      {/* Customer List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-gray-900">Customers in Segment</h2>
            <div className="flex gap-3">
              <button
                onClick={handleSendCampaign}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                <Mail className="h-4 w-4" />
                <span>Send Campaign</span>
              </button>
              <button
                onClick={handleExportCustomers}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total Spent</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Last Purchase</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-600 font-medium">
                          {customer.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-gray-900">{customer.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center">
                      <Building2 className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900">{customer.company}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="h-3 w-3 mr-1" />
                        {customer.email}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="h-3 w-3 mr-1" />
                        {customer.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-1" />
                      {customer.location}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <span className="font-semibold text-gray-900">
                      ${customer.totalSpent.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-600">
                    {new Date(customer.lastPurchase).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      customer.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {customer.status}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <button
                      onClick={() => router.push(`/crm/customers/${customer.id}`)}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                    >
                      <Eye className="h-4 w-4" />
                      <span className="text-sm">View</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCustomers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mb-2" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
