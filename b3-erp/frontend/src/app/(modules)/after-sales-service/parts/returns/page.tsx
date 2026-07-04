'use client';

import { useState, useEffect } from 'react';
import { AfterSalesPagesService } from '@/services/after-sales-pages.service';
import { useRouter } from 'next/navigation';
import { Search, Eye, Edit, Plus, Package, RotateCcw, AlertTriangle, CheckCircle, XCircle, Clock, User, Calendar, MapPin, FileText, Download, Filter, MoreVertical, TrendingDown, DollarSign, Percent } from 'lucide-react';

interface PartsReturn {
  id: string;
  returnId: string;
  returnDate: string;
  returnedBy: string;
  technicianId: string;
  department: 'Service Operations' | 'Field Service' | 'Installation' | 'Maintenance' | 'Quality Assurance';
  serviceRequestId?: string;
  contractId?: string;
  customerId?: string;
  customerName?: string;
  returnReason: 'unused' | 'defective' | 'wrong_part' | 'excess_stock' | 'warranty_return' | 'expired' | 'damaged' | 'customer_cancelled';
  returnType: 'full_return' | 'partial_return' | 'exchange' | 'credit_note';
  location: string;
  originalRequisitionId?: string;
  originalConsumptionId?: string;
  totalItems: number;
  totalValue: number;
  refundAmount: number;
  creditNoteIssued: boolean;
  creditNoteNumber?: string;
  status: 'pending' | 'inspected' | 'approved' | 'rejected' | 'restocked' | 'scrapped' | 'completed';
  inspectedBy?: string;
  inspectionDate?: string;
  qualityStatus: 'pending' | 'passed' | 'failed' | 'acceptable' | 'not_applicable';
  approvedBy?: string;
  approvalDate?: string;
  items: ReturnItem[];
  restockingFee: number;
  restockingFeePercent: number;
  notes: string;
  attachments: string[];
}

interface ReturnItem {
  id: string;
  partNumber: string;
  partName: string;
  category: string;
  manufacturer: string;
  quantityReturned: number;
  quantityAccepted: number;
  quantityRejected: number;
  unitCost: number;
  totalCost: number;
  returnReason: 'unused' | 'defective' | 'wrong_part' | 'excess_stock' | 'warranty_return' | 'expired' | 'damaged' | 'customer_cancelled';
  condition: 'new' | 'like_new' | 'good' | 'fair' | 'poor' | 'defective';
  restockable: boolean;
  serialNumber?: string;
  batchNumber?: string;
  expiryDate?: string;
  inspectionNotes: string;
  action: 'restock' | 'scrap' | 'repair' | 'vendor_return' | 'pending';
}

function mapPartsReturn(r: any): PartsReturn {
  return { ...(r as PartsReturn), items: Array.isArray(r?.items) ? r.items : [], attachments: Array.isArray(r?.attachments) ? r.attachments : [] };
}

export default function PartsReturnsPage() {
  const [mockReturns, setMockReturns] = useState<PartsReturn[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = (await AfterSalesPagesService.partsReturns()) as any[];
        if (!cancelled) setMockReturns(Array.isArray(raw) ? raw.map(mapPartsReturn) : []);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load returns');
          setMockReturns([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReturn, setSelectedReturn] = useState<PartsReturn | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [reasonFilter, setReasonFilter] = useState<string>('all');

  // Filter returns
  const filteredReturns = mockReturns.filter(ret => {
    const matchesSearch = ret.returnId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ret.returnedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ret.customerName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ret.status === statusFilter;
    const matchesReason = reasonFilter === 'all' || ret.returnReason === reasonFilter;
    return matchesSearch && matchesStatus && matchesReason;
  });

  // Statistics
  const totalReturns = mockReturns.length;
  const pendingReturns = mockReturns.filter(r => r.status === 'pending' || r.status === 'inspected').length;
  const completedReturns = mockReturns.filter(r => r.status === 'completed' || r.status === 'restocked').length;
  const totalReturnValue = mockReturns.reduce((sum, r) => sum + r.totalValue, 0);
  const totalRefundAmount = mockReturns.reduce((sum, r) => sum + r.refundAmount, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'inspected': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'restocked': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'scrapped': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'completed': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getReasonColor = (reason: string) => {
    switch (reason) {
      case 'unused': return 'bg-blue-100 text-blue-700';
      case 'defective': return 'bg-red-100 text-red-700';
      case 'wrong_part': return 'bg-orange-100 text-orange-700';
      case 'excess_stock': return 'bg-cyan-100 text-cyan-700';
      case 'warranty_return': return 'bg-purple-100 text-purple-700';
      case 'expired': return 'bg-gray-100 text-gray-700';
      case 'damaged': return 'bg-amber-100 text-amber-700';
      case 'customer_cancelled': return 'bg-pink-100 text-pink-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getReturnTypeIcon = (type: string) => {
    switch (type) {
      case 'full_return': return <RotateCcw className="h-4 w-4" />;
      case 'partial_return': return <TrendingDown className="h-4 w-4" />;
      case 'exchange': return <Package className="h-4 w-4" />;
      case 'credit_note': return <FileText className="h-4 w-4" />;
      default: return <RotateCcw className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3">
      {/* Header */}
      <div className="mb-3">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <RotateCcw className="h-8 w-8 text-emerald-600" />
          Parts Returns
        </h1>
        <p className="text-gray-600 mt-1">Manage service parts returns and refunds</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 mb-3">
        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Returns</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{totalReturns}</p>
            </div>
            <div className="bg-emerald-100 p-3 rounded-lg">
              <RotateCcw className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">{pendingReturns}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{completedReturns}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(totalReturnValue)}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Refund Amount</p>
              <p className="text-2xl font-bold text-purple-600 mt-2">{formatCurrency(totalRefundAmount)}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 mb-3 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by return ID, technician, or customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="inspected">Inspected</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="restocked">Restocked</option>
              <option value="scrapped">Scrapped</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div>
            <select
              value={reasonFilter}
              onChange={(e) => setReasonFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="all">All Reasons</option>
              <option value="unused">Unused</option>
              <option value="defective">Defective</option>
              <option value="wrong_part">Wrong Part</option>
              <option value="excess_stock">Excess Stock</option>
              <option value="warranty_return">Warranty Return</option>
              <option value="expired">Expired</option>
              <option value="damaged">Damaged</option>
              <option value="customer_cancelled">Customer Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg p-3 mb-3 shadow-md">
        <div className="flex items-center justify-between">
          <div className="text-white">
            <h3 className="text-lg font-semibold mb-1">Record Parts Return</h3>
            <p className="text-emerald-100 text-sm">Process returned service parts and manage refunds</p>
          </div>
          <button
            className="bg-white text-emerald-600 px-3 py-2 rounded-lg font-medium hover:bg-emerald-50 transition-colors flex items-center gap-2 shadow-md"
            onClick={() => router.push('/after-sales-service/parts/returns')}
          >
            <Plus className="h-5 w-5" />
            Record Return
          </button>
        </div>
      </div>

      {/* Returns Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Return ID</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Returned By</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Refund</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReturns.map((ret) => (
                <tr key={ret.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <RotateCcw className="h-4 w-4 text-emerald-600" />
                      <span className="font-medium text-gray-900">{ret.returnId}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      {new Date(ret.returnDate).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{ret.returnedBy}</div>
                        <div className="text-xs text-gray-500">{ret.department}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{ret.customerName || '-'}</div>
                    {ret.serviceRequestId && (
                      <div className="text-xs text-gray-500">{ret.serviceRequestId}</div>
                    )}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getReasonColor(ret.returnReason)}`}>
                      {ret.returnReason.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      {getReturnTypeIcon(ret.returnType)}
                      {ret.returnType.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">{ret.totalItems}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{formatCurrency(ret.totalValue)}</div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="text-sm font-medium text-purple-600">{formatCurrency(ret.refundAmount)}</div>
                    {ret.creditNoteIssued && (
                      <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                        <CheckCircle className="h-3 w-3" />
                        CN: {ret.creditNoteNumber}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(ret.status)}`}>
                      {ret.status.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedReturn(ret);
                          setShowDetailsModal(true);
                        }}
                        className="text-emerald-600 hover:text-emerald-800 transition-colors"
                       
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => router.push(`/after-sales-service/parts/returns/edit/${ret.id}`)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                       
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredReturns.length === 0 && (
          <div className="text-center py-12">
            <RotateCcw className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No returns found</h3>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedReturn && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 z-50">
          <div className="bg-white rounded-lg  w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-3 py-2 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Return Details: {selectedReturn.returnId}</h2>
                <p className="text-sm text-gray-600 mt-1">Complete information about the parts return</p>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6">
              {/* Return Information */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Return Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Return Date:</span>
                      <span className="font-medium">{new Date(selectedReturn.returnDate).toLocaleDateString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Returned By:</span>
                      <span className="font-medium">{selectedReturn.returnedBy}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Department:</span>
                      <span className="font-medium">{selectedReturn.department}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Location:</span>
                      <span className="font-medium">{selectedReturn.location}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Financial Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Value:</span>
                      <span className="font-medium">{formatCurrency(selectedReturn.totalValue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Restocking Fee ({selectedReturn.restockingFeePercent}%):</span>
                      <span className="font-medium text-red-600">-{formatCurrency(selectedReturn.restockingFee)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-gray-900 font-semibold">Refund Amount:</span>
                      <span className="font-bold text-purple-600">{formatCurrency(selectedReturn.refundAmount)}</span>
                    </div>
                    {selectedReturn.creditNoteIssued && (
                      <div className="flex justify-between items-center bg-green-50 p-2 rounded">
                        <span className="text-green-700 flex items-center gap-1">
                          <CheckCircle className="h-4 w-4" />
                          Credit Note Issued:
                        </span>
                        <span className="font-medium text-green-900">{selectedReturn.creditNoteNumber}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Returned Items */}
              <div className="mb-3">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Returned Items</h3>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Part</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Returned</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Accepted</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rejected</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Condition</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Value</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedReturn.items.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-3">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{item.partName}</div>
                              <div className="text-xs text-gray-500">{item.partNumber}</div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm">{item.quantityReturned}</td>
                          <td className="px-4 py-3 text-sm text-green-600 font-medium">{item.quantityAccepted}</td>
                          <td className="px-4 py-3 text-sm text-red-600 font-medium">{item.quantityRejected}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              item.condition === 'new' ? 'bg-green-100 text-green-700' :
                              item.condition === 'like_new' ? 'bg-emerald-100 text-emerald-700' :
                              item.condition === 'good' ? 'bg-blue-100 text-blue-700' :
                              item.condition === 'fair' ? 'bg-yellow-100 text-yellow-700' :
                              item.condition === 'poor' ? 'bg-orange-100 text-orange-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {item.condition.replace('_', ' ').toUpperCase()}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              item.action === 'restock' ? 'bg-green-100 text-green-700' :
                              item.action === 'scrap' ? 'bg-red-100 text-red-700' :
                              item.action === 'repair' ? 'bg-yellow-100 text-yellow-700' :
                              item.action === 'vendor_return' ? 'bg-purple-100 text-purple-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {item.action.replace('_', ' ').toUpperCase()}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-medium">{formatCurrency(item.totalCost)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Notes */}
              {selectedReturn.notes && (
                <div className="mb-3">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Notes</h3>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-700">
                    {selectedReturn.notes}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => router.push(`/after-sales-service/parts/returns/edit/${selectedReturn.id}`)}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit Return
                </button>
                <button
                  onClick={() => router.push(`/after-sales-service/parts/returns/view/${selectedReturn.id}`)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  View Full Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
