'use client';

import { useState } from 'react';
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

const mockRequisitions: PartsRequisition[] = [
  {
    id: '1',
    requisitionNumber: 'PR-2025-001',
    requestDate: '2025-10-22',
    requiredDate: '2025-10-25',
    requestedBy: 'Suresh Patel',
    department: 'Service Operations',
    serviceRequestId: 'SR-2025-145',
    contractId: 'AMC-2025-0001',
    customerId: 'CUST001',
    customerName: 'Sharma Modular Kitchens Pvt Ltd',
    priority: 'high',
    status: 'approved',
    approvedBy: 'Maintenance Manager',
    approvalDate: '2025-10-22',
    totalItems: 3,
    totalValue: 2850,
    estimatedCost: 2850,
    actualCost: 2650,
    supplier: 'Kitchen Hardware Supplies',
    expectedDelivery: '2025-10-24',
    deliveryLocation: 'Mumbai Central Warehouse',
    justification: 'Urgent replacement required for customer AMC contract. Cabinet hinges failed during service.',
    internalNotes: 'Customer has premium contract. Ensure quality parts are delivered.',
    items: [
      {
        id: '1',
        partNumber: 'KIT-HNG-001',
        partName: 'Cabinet Hinge - Soft Close',
        category: 'Hardware',
        manufacturer: 'Hettich',
        requestedQuantity: 4,
        approvedQuantity: 4,
        receivedQuantity: 0,
        unitCost: 450,
        totalCost: 1800,
        currentStock: 245,
        urgencyLevel: 'urgent',
        alternativeAccepted: false,
        supplierPartNumber: 'HTH-8645i',
        status: 'ordered',
        notes: 'Premium quality required'
      },
      {
        id: '2',
        partNumber: 'MCH-SCR-008',
        partName: 'Mounting Screws Set',
        category: 'Hardware',
        manufacturer: 'Hafele',
        requestedQuantity: 2,
        approvedQuantity: 2,
        receivedQuantity: 0,
        unitCost: 125,
        totalCost: 250,
        currentStock: 156,
        urgencyLevel: 'normal',
        alternativeAccepted: true,
        supplierPartNumber: 'HFL-SCR-001',
        status: 'ordered',
        notes: 'Standard mounting screws'
      },
      {
        id: '3',
        partNumber: 'CON-ADH-015',
        partName: 'Industrial Adhesive',
        category: 'Consumable',
        manufacturer: 'Fevicol',
        requestedQuantity: 1,
        approvedQuantity: 1,
        receivedQuantity: 0,
        unitCost: 800,
        totalCost: 800,
        currentStock: 45,
        urgencyLevel: 'normal',
        alternativeAccepted: true,
        supplierPartNumber: 'FVC-IND-001',
        status: 'ordered',
        notes: 'For permanent cabinet mounting'
      }
    ],
    attachments: ['service_report.pdf', 'customer_approval.pdf'],
    trackingNumber: 'TRK-2025-001',
    deliveredDate: '',
    receivedBy: ''
  },
  {
    id: '2',
    requisitionNumber: 'PR-2025-002',
    requestDate: '2025-10-21',
    requiredDate: '2025-10-28',
    requestedBy: 'Amit Singh',
    department: 'Field Service',
    serviceRequestId: 'SR-2025-142',
    contractId: 'CMC-2025-0012',
    customerId: 'CUST002',
    customerName: 'Elite Kitchen Solutions',
    priority: 'urgent',
    status: 'in_procurement',
    approvedBy: 'Service Manager',
    approvalDate: '2025-10-21',
    totalItems: 2,
    totalValue: 1750,
    estimatedCost: 1750,
    actualCost: 1650,
    supplier: 'Electrical Components Ltd',
    expectedDelivery: '2025-10-26',
    deliveryLocation: 'Delhi Service Center',
    justification: 'LED strip failure in customer kitchen. Urgent replacement needed to maintain service SLA.',
    internalNotes: 'Customer has complained about delayed service. Priority delivery required.',
    items: [
      {
        id: '1',
        partNumber: 'ELC-LED-012',
        partName: 'LED Strip Light - Under Cabinet',
        category: 'Electronics',
        manufacturer: 'Philips',
        requestedQuantity: 1,
        approvedQuantity: 1,
        receivedQuantity: 0,
        unitCost: 1250,
        totalCost: 1250,
        currentStock: 35,
        urgencyLevel: 'critical',
        alternativeAccepted: false,
        supplierPartNumber: 'PHL-HUE-001',
        status: 'ordered',
        notes: 'Warm white, exact model required'
      },
      {
        id: '2',
        partNumber: 'ELC-PWR-025',
        partName: 'Power Adapter 24V',
        category: 'Electronics',
        manufacturer: 'Mean Well',
        requestedQuantity: 1,
        approvedQuantity: 1,
        receivedQuantity: 0,
        unitCost: 500,
        totalCost: 500,
        currentStock: 28,
        urgencyLevel: 'urgent',
        alternativeAccepted: true,
        supplierPartNumber: 'MW-PWR-24V',
        status: 'ordered',
        notes: 'Compatible power adapter'
      }
    ],
    attachments: ['fault_diagnosis.pdf'],
    trackingNumber: 'TRK-2025-002',
    deliveredDate: '',
    receivedBy: ''
  },
  {
    id: '3',
    requisitionNumber: 'PR-2025-003',
    requestDate: '2025-10-20',
    requiredDate: '2025-10-30',
    requestedBy: 'Ravi Kumar',
    department: 'Installation',
    serviceRequestId: '',
    contractId: '',
    customerId: 'CUST003',
    customerName: 'Modern Home Interiors',
    priority: 'medium',
    status: 'received',
    approvedBy: 'Installation Manager',
    approvalDate: '2025-10-20',
    totalItems: 5,
    totalValue: 4250,
    estimatedCost: 4250,
    actualCost: 4100,
    supplier: 'Premium Hardware Solutions',
    expectedDelivery: '2025-10-25',
    deliveryLocation: 'Bangalore Installation Site',
    justification: 'New installation project requires premium drawer slides for customer satisfaction.',
    internalNotes: 'Customer is design-conscious. Ensure smooth operation and premium finish.',
    items: [
      {
        id: '1',
        partNumber: 'MCH-DRW-025',
        partName: 'Drawer Slide - Heavy Duty',
        category: 'Mechanical',
        manufacturer: 'Blum',
        requestedQuantity: 8,
        approvedQuantity: 8,
        receivedQuantity: 8,
        unitCost: 890,
        totalCost: 7120,
        currentStock: 0,
        urgencyLevel: 'urgent',
        alternativeAccepted: false,
        supplierPartNumber: 'BLM-TND-001',
        status: 'received',
        notes: 'Full extension, soft close'
      }
    ],
    attachments: ['installation_plan.pdf', 'customer_specifications.pdf'],
    trackingNumber: 'TRK-2025-003',
    deliveredDate: '2025-10-23',
    receivedBy: 'Warehouse Manager'
  },
  {
    id: '4',
    requisitionNumber: 'PR-2025-004',
    requestDate: '2025-10-23',
    requiredDate: '2025-11-02',
    requestedBy: 'Deepak Sharma',
    department: 'Maintenance',
    priority: 'low',
    status: 'submitted',
    totalItems: 4,
    totalValue: 1850,
    estimatedCost: 1850,
    actualCost: 0,
    deliveryLocation: 'Chennai Service Center',
    justification: 'Routine maintenance stock replenishment for preventive service operations.',
    internalNotes: 'Standard consumables for monthly service activities.',
    items: [
      {
        id: '1',
        partNumber: 'CON-CLN-008',
        partName: 'Kitchen Cleaner - Stainless Steel',
        category: 'Consumable',
        manufacturer: 'Weiman',
        requestedQuantity: 12,
        approvedQuantity: 0,
        receivedQuantity: 0,
        unitCost: 125,
        totalCost: 1500,
        currentStock: 850,
        urgencyLevel: 'normal',
        alternativeAccepted: true,
        supplierPartNumber: 'WMN-CLN-SS',
        status: 'pending',
        notes: 'Bulk order for cost efficiency'
      },
      {
        id: '2',
        partNumber: 'CON-LUB-012',
        partName: 'Hinge Lubricant',
        category: 'Consumable',
        manufacturer: '3M',
        requestedQuantity: 6,
        approvedQuantity: 0,
        receivedQuantity: 0,
        unitCost: 85,
        totalCost: 510,
        currentStock: 24,
        urgencyLevel: 'normal',
        alternativeAccepted: true,
        supplierPartNumber: '3M-LUB-001',
        status: 'pending',
        notes: 'Silicone-based lubricant'
      }
    ],
    attachments: ['maintenance_schedule.pdf'],
    trackingNumber: '',
    deliveredDate: '',
    receivedBy: ''
  },
  {
    id: '5',
    requisitionNumber: 'PR-2025-005',
    requestDate: '2025-10-19',
    requiredDate: '2025-10-22',
    requestedBy: 'Manoj Kumar',
    department: 'Quality Assurance',
    priority: 'high',
    status: 'rejected',
    totalItems: 2,
    totalValue: 3200,
    estimatedCost: 3200,
    actualCost: 0,
    deliveryLocation: 'Pune Quality Lab',
    justification: 'Specialized tools required for quality inspection of customer complaints.',
    internalNotes: 'Request rejected due to budget constraints. Alternative solution needed.',
    items: [
      {
        id: '1',
        partNumber: 'TLS-DRL-015',
        partName: 'Cordless Drill Bit Set',
        category: 'Tools',
        manufacturer: 'Bosch',
        requestedQuantity: 1,
        approvedQuantity: 0,
        receivedQuantity: 0,
        unitCost: 2500,
        totalCost: 2500,
        currentStock: 12,
        urgencyLevel: 'normal',
        alternativeAccepted: false,
        supplierPartNumber: 'BSH-DRL-PRO',
        status: 'rejected',
        notes: 'Budget exceeded for non-critical tools'
      },
      {
        id: '2',
        partNumber: 'TLS-MSR-008',
        partName: 'Digital Calipers',
        category: 'Tools',
        manufacturer: 'Mitutoyo',
        requestedQuantity: 1,
        approvedQuantity: 0,
        receivedQuantity: 0,
        unitCost: 700,
        totalCost: 700,
        currentStock: 8,
        urgencyLevel: 'normal',
        alternativeAccepted: true,
        supplierPartNumber: 'MIT-CAL-001',
        status: 'rejected',
        notes: 'Alternative measuring tools available'
      }
    ],
    attachments: ['quality_requirements.pdf'],
    trackingNumber: '',
    deliveredDate: '',
    receivedBy: ''
  }
];

export default function PartsRequisitionPage() {
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