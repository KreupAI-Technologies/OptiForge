'use client';

import { useState } from 'react';
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
const mockSegment: SegmentDetails = {
  id: '1',
  name: 'Enterprise Customers',
  description: 'Large organizations with over 500 employees and annual revenue exceeding $50M',
  customerCount: 156,
  totalRevenue: 2450000,
  avgOrderValue: 15705,
  growthRate: 12.5,
  createdDate: '2024-01-15',
  lastUpdated: '2024-10-20',
  criteria: [
    'Company size > 500 employees',
    'Annual revenue > $50M',
    'Contract value > $10K',
    'Active for > 6 months',
  ],
  status: 'active',
};

const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'John Smith',
    company: 'Tech Corp International',
    email: 'john.smith@techcorp.com',
    phone: '+1 234-567-8900',
    location: 'New York, NY',
    totalSpent: 125000,
    lastPurchase: '2024-10-15',
    status: 'active',
    segment: 'Enterprise Customers',
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    company: 'Global Manufacturing Ltd',
    email: 'sarah.j@globalmanuf.com',
    phone: '+1 234-567-8901',
    location: 'Chicago, IL',
    totalSpent: 98000,
    lastPurchase: '2024-10-12',
    status: 'active',
    segment: 'Enterprise Customers',
  },
  {
    id: '3',
    name: 'Michael Chen',
    company: 'Enterprise Solutions Inc',
    email: 'mchen@entsolutions.com',
    phone: '+1 234-567-8902',
    location: 'San Francisco, CA',
    totalSpent: 156000,
    lastPurchase: '2024-10-18',
    status: 'active',
    segment: 'Enterprise Customers',
  },
  {
    id: '4',
    name: 'Emily Davis',
    company: 'Mega Industries Corp',
    email: 'emily.davis@megaindustries.com',
    phone: '+1 234-567-8903',
    location: 'Boston, MA',
    totalSpent: 87000,
    lastPurchase: '2024-10-10',
    status: 'active',
    segment: 'Enterprise Customers',
  },
  {
    id: '5',
    name: 'David Wilson',
    company: 'Prime Logistics Group',
    email: 'dwilson@primelogistics.com',
    phone: '+1 234-567-8904',
    location: 'Atlanta, GA',
    totalSpent: 112000,
    lastPurchase: '2024-10-14',
    status: 'active',
    segment: 'Enterprise Customers',
  },
];

export default function SegmentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { addToast } = useToast();
  const segmentId = params.id as string;

  const [segment] = useState<SegmentDetails>(mockSegment);
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

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
