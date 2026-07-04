'use client';

import { useState, useEffect } from 'react';
import { AfterSalesPagesService } from '@/services/after-sales-pages.service';
import { useRouter } from 'next/navigation';
import { Search, Eye, Edit, Plus, Package, CheckCircle, Clock, XCircle, AlertTriangle, User, Calendar, MapPin, FileText, Download, Filter, Send, MoreVertical, ShoppingCart, Truck, Phone } from 'lucide-react';

interface PartsRequisition {
  id: string;
  requisitionNumber: string;
  requestDate: string;
  requiredDate: string;
  requestedBy: string;
  department: 'Service Operations' | 'Field Service' | 'Installation' | 'Maintenance' | 'Quality Assurance';
  serviceRequestId?: string;
  contractId?: string;
  customerId?: string;
  customerName?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'draft' | 'submitted' | 'approved' | 'partially_approved' | 'rejected' | 'in_procurement' | 'received' | 'partially_received' | 'delivered' | 'completed' | 'cancelled';
  approvedBy?: string;
  approvalDate?: string;
  totalItems: number;
  totalValue: number;
  estimatedCost: number;
  actualCost: number;
  supplier?: string;
  expectedDelivery?: string;
  deliveryLocation: string;
  justification: string;
  internalNotes: string;
  items: RequisitionItem[];
  attachments: string[];
  trackingNumber?: string;
  deliveredDate?: string;
  receivedBy?: string;
}

interface RequisitionItem {
  id: string;
  partNumber: string;
  partName: string;
  category: string;
  manufacturer: string;
  requestedQuantity: number;
  approvedQuantity: number;
  receivedQuantity: number;
  unitCost: number;
  totalCost: number;
  currentStock: number;
  urgencyLevel: 'normal' | 'urgent' | 'critical';
  alternativeAccepted: boolean;
  supplierPartNumber: string;
  status: 'pending' | 'approved' | 'rejected' | 'ordered' | 'received';
  notes: string;
}

function mapPartsRequisition(r: any): PartsRequisition {
  return { ...(r as PartsRequisition), items: Array.isArray(r?.items) ? r.items : [], attachments: Array.isArray(r?.attachments) ? r.attachments : [] };
}

export default function PartsRequisitionPage() {
  const [mockRequisitions, setMockRequisitions] = useState<PartsRequisition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = (await AfterSalesPagesService.partsRequisitions()) as any[];
        if (!cancelled) setMockRequisitions(Array.isArray(raw) ? raw.map(mapPartsRequisition) : []);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load requisitions');
          setMockRequisitions([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);
  const router = useRouter();
  const [requisitions, setRequisitions] = useState<PartsRequisition[]>(mockRequisitions);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('requestDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRequisition, setSelectedRequisition] = useState<PartsRequisition | null>(null);
  const [showRequisitionModal, setShowRequisitionModal] = useState(false);

  // Filter and search requisitions
  const filteredRequisitions = requisitions.filter(req => {
    const matchesSearch = 
      req.requisitionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.requestedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.items.some(item => 
        item.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.partName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    const matchesStatus = selectedStatus === 'all' || req.status === selectedStatus;
    const matchesPriority = selectedPriority === 'all' || req.priority === selectedPriority;
    const matchesDepartment = selectedDepartment === 'all' || req.department === selectedDepartment;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesDepartment;
  });

  // Sort requisitions
  const sortedRequisitions = [...filteredRequisitions].sort((a, b) => {
    let aValue: any = a[sortBy as keyof PartsRequisition];
    let bValue: any = b[sortBy as keyof PartsRequisition];
    
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    
    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'partially_approved': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'in_procurement': return 'bg-purple-100 text-purple-800';
      case 'received': return 'bg-emerald-100 text-emerald-800';
      case 'partially_received': return 'bg-yellow-100 text-yellow-800';
      case 'delivered': return 'bg-teal-100 text-teal-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDepartmentColor = (department: string) => {
    switch (department) {
      case 'Service Operations': return 'bg-blue-100 text-blue-800';
      case 'Field Service': return 'bg-green-100 text-green-800';
      case 'Installation': return 'bg-purple-100 text-purple-800';
      case 'Maintenance': return 'bg-orange-100 text-orange-800';
      case 'Quality Assurance': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleRequisitionClick = (requisition: PartsRequisition) => {
    setSelectedRequisition(requisition);
    setShowRequisitionModal(true);
  };

  const calculateStats = () => {
    const pendingApproval = requisitions.filter(r => r.status === 'submitted').length;
    const totalValue = requisitions.reduce((sum, req) => sum + req.totalValue, 0);
    const urgentRequests = requisitions.filter(r => r.priority === 'urgent').length;
    const inProcurement = requisitions.filter(r => r.status === 'in_procurement').length;
    const completedToday = requisitions.filter(r => 
      r.status === 'completed' && 
      new Date(r.deliveredDate || '').toDateString() === new Date().toDateString()
    ).length;
    const overdueItems = requisitions.filter(r => 
      new Date(r.requiredDate) < new Date() && 
      !['completed', 'delivered', 'cancelled'].includes(r.status)
    ).length;

    return {
      pendingApproval,
      totalValue,
      urgentRequests,
      inProcurement,
      completedToday,
      overdueItems
    };
  };

  const stats = calculateStats();

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Parts Requisition</h1>
          <p className="text-gray-600">Manage service parts requests and procurement</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
          <button
            onClick={() => router.push('/after-sales-service/parts/requisition')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            New Requisition
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-2">
        <div className="bg-white p-3 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900">{requisitions.length}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white p-3 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Approval</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pendingApproval}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        
        <div className="bg-white p-3 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">₹{(stats.totalValue / 1000).toFixed(0)}K</p>
            </div>
            <Package className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white p-3 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Urgent</p>
              <p className="text-2xl font-bold text-red-600">{stats.urgentRequests}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>
        
        <div className="bg-white p-3 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Procurement</p>
              <p className="text-2xl font-bold text-purple-600">{stats.inProcurement}</p>
            </div>
            <ShoppingCart className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        
        <div className="bg-white p-3 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-red-600">{stats.overdueItems}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search requisitions..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="requestDate">Sort by Request Date</option>
            <option value="requiredDate">Sort by Required Date</option>
            <option value="priority">Sort by Priority</option>
            <option value="totalValue">Sort by Value</option>
            <option value="status">Sort by Status</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>

        {showFilters && (
          <div className="bg-gray-50 p-3 rounded-lg grid grid-cols-1 md:grid-cols-4 gap-2">
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="in_procurement">In Procurement</option>
              <option value="received">Received</option>
              <option value="completed">Completed</option>
            </select>
            
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
            >
              <option value="all">All Departments</option>
              <option value="Service Operations">Service Operations</option>
              <option value="Field Service">Field Service</option>
              <option value="Installation">Installation</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Quality Assurance">Quality Assurance</option>
            </select>
            
            <div className="flex gap-2">
              <button className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Apply
              </button>
              <button className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                Reset
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Requisitions Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Requisition Details
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Requestor & Department
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items & Value
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timeline & Delivery
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status & Priority
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer Info
                </th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedRequisitions.map((requisition) => (
                <tr 
                  key={requisition.id} 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleRequisitionClick(requisition)}
                >
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-gray-900">{requisition.requisitionNumber}</div>
                      <div className="text-xs text-gray-500">
                        Requested: {new Date(requisition.requestDate).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        Required: {new Date(requisition.requiredDate).toLocaleDateString()}
                      </div>
                      {requisition.serviceRequestId && (
                        <div className="text-xs text-blue-600">SR: {requisition.serviceRequestId}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="flex items-center text-sm font-medium text-gray-900">
                        <User className="w-4 h-4 mr-1" />
                        {requisition.requestedBy}
                      </div>
                      <div className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDepartmentColor(requisition.department)}`}>
                        {requisition.department}
                      </div>
                      {requisition.approvedBy && (
                        <div className="text-xs text-green-600">
                          Approved by: {requisition.approvedBy}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-gray-900">
                        {requisition.totalItems} items
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        ₹{(requisition.totalValue / 1000).toFixed(1)}K
                      </div>
                      <div className="text-xs text-gray-500">
                        Est: ₹{(requisition.estimatedCost / 1000).toFixed(1)}K
                      </div>
                      {requisition.actualCost > 0 && (
                        <div className="text-xs text-green-600">
                          Actual: ₹{(requisition.actualCost / 1000).toFixed(1)}K
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="space-y-1">
                      {requisition.expectedDelivery && (
                        <div className="text-sm text-gray-900">
                          Expected: {new Date(requisition.expectedDelivery).toLocaleDateString()}
                        </div>
                      )}
                      <div className="flex items-center text-xs text-gray-500">
                        <MapPin className="w-3 h-3 mr-1" />
                        {requisition.deliveryLocation}
                      </div>
                      {requisition.trackingNumber && (
                        <div className="text-xs text-blue-600">
                          Track: {requisition.trackingNumber}
                        </div>
                      )}
                      {requisition.deliveredDate && (
                        <div className="text-xs text-green-600">
                          Delivered: {new Date(requisition.deliveredDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(requisition.status)}`}>
                        {requisition.status.replace('_', ' ').toUpperCase()}
                      </div>
                      <div className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(requisition.priority)}`}>
                        {requisition.priority.toUpperCase()}
                      </div>
                      {requisition.supplier && (
                        <div className="text-xs text-gray-500">
                          Supplier: {requisition.supplier}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="space-y-1">
                      {requisition.customerName ? (
                        <>
                          <div className="text-sm font-medium text-gray-900">
                            {requisition.customerName}
                          </div>
                          <div className="text-xs text-gray-500">
                            ID: {requisition.customerId}
                          </div>
                          {requisition.contractId && (
                            <div className="text-xs text-blue-600">
                              Contract: {requisition.contractId}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-sm text-gray-500">
                          Internal Request
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/after-sales-service/parts/requisition/view/${requisition.id}`);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                       
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/after-sales-service/parts/requisition/edit/${requisition.id}`);
                        }}
                        className="text-gray-600 hover:text-gray-900"
                       
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {requisition.trackingNumber && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle tracking
                          }}
                          className="text-green-600 hover:text-green-900"
                         
                        >
                          <Truck className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Requisition Details Modal */}
      {showRequisitionModal && selectedRequisition && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 z-50">
          <div className="bg-white rounded-lg p-3 w-full  max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-bold text-gray-900">Requisition Details</h2>
              <button
                onClick={() => setShowRequisitionModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              {/* Basic Information */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                <div className="bg-gray-50 p-3 rounded-lg space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Requisition #:</span>
                    <span className="font-medium">{selectedRequisition.requisitionNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Requested By:</span>
                    <span className="font-medium">{selectedRequisition.requestedBy}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Department:</span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getDepartmentColor(selectedRequisition.department)}`}>
                      {selectedRequisition.department}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Priority:</span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(selectedRequisition.priority)}`}>
                      {selectedRequisition.priority.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedRequisition.status)}`}>
                      {selectedRequisition.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">Timeline</h3>
                <div className="bg-gray-50 p-3 rounded-lg space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Request Date:</span>
                    <span className="font-medium">{new Date(selectedRequisition.requestDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Required Date:</span>
                    <span className="font-medium">{new Date(selectedRequisition.requiredDate).toLocaleDateString()}</span>
                  </div>
                  {selectedRequisition.approvalDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Approved Date:</span>
                      <span className="font-medium">{new Date(selectedRequisition.approvalDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  {selectedRequisition.expectedDelivery && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Expected Delivery:</span>
                      <span className="font-medium">{new Date(selectedRequisition.expectedDelivery).toLocaleDateString()}</span>
                    </div>
                  )}
                  {selectedRequisition.deliveredDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Delivered Date:</span>
                      <span className="font-medium">{new Date(selectedRequisition.deliveredDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Financial Summary */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">Financial Summary</h3>
                <div className="bg-gray-50 p-3 rounded-lg space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Items:</span>
                    <span className="font-medium">{selectedRequisition.totalItems}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estimated Cost:</span>
                    <span className="font-medium">₹{(selectedRequisition.estimatedCost / 1000).toFixed(1)}K</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Value:</span>
                    <span className="font-medium">₹{(selectedRequisition.totalValue / 1000).toFixed(1)}K</span>
                  </div>
                  {selectedRequisition.actualCost > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Actual Cost:</span>
                      <span className="font-medium text-green-600">₹{(selectedRequisition.actualCost / 1000).toFixed(1)}K</span>
                    </div>
                  )}
                  {selectedRequisition.supplier && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Supplier:</span>
                      <span className="font-medium">{selectedRequisition.supplier}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Items List */}
              <div className="lg:col-span-3 space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">Requisition Items</h3>
                <div className="bg-gray-50 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Part</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cost</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedRequisition.items.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-2">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{item.partNumber}</div>
                              <div className="text-xs text-gray-500">{item.partName}</div>
                            </div>
                          </td>
                          <td className="px-4 py-2">
                            <div className="text-sm">
                              <div>Req: {item.requestedQuantity}</div>
                              {item.approvedQuantity > 0 && (
                                <div className="text-green-600">App: {item.approvedQuantity}</div>
                              )}
                              {item.receivedQuantity > 0 && (
                                <div className="text-blue-600">Rec: {item.receivedQuantity}</div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-2">
                            <div className="text-sm">
                              <div>₹{item.unitCost.toLocaleString()}</div>
                              <div className="text-gray-500">Total: ₹{item.totalCost.toLocaleString()}</div>
                            </div>
                          </td>
                          <td className="px-4 py-2">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                              {item.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-4 py-2">
                            <div className="text-xs text-gray-600">{item.notes}</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Justification & Notes */}
              <div className="lg:col-span-3 space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">Justification & Notes</h3>
                <div className="bg-gray-50 p-3 rounded-lg space-y-3">
                  <div>
                    <span className="text-gray-600 font-medium">Justification:</span>
                    <p className="text-gray-700 mt-1">{selectedRequisition.justification}</p>
                  </div>
                  {selectedRequisition.internalNotes && (
                    <div>
                      <span className="text-gray-600 font-medium">Internal Notes:</span>
                      <p className="text-gray-700 mt-1">{selectedRequisition.internalNotes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowRequisitionModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => router.push(`/after-sales-service/parts/requisition/edit/${selectedRequisition.id}`)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Edit Requisition
              </button>
              <button
                onClick={() => router.push(`/after-sales-service/parts/requisition/view/${selectedRequisition.id}`)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                View Full Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}