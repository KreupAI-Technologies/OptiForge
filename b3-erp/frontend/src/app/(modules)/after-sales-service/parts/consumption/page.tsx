'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Eye, Edit, Plus, Package, TrendingUp, TrendingDown, BarChart3, PieChart, Calendar, User, MapPin, Wrench, FileText, Download, Filter, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

interface PartsConsumption {
  id: string;
  consumptionId: string;
  consumptionDate: string;
  consumedBy: string;
  technicianId: string;
  department: 'Service Operations' | 'Field Service' | 'Installation' | 'Maintenance' | 'Quality Assurance';
  serviceRequestId?: string;
  contractId?: string;
  customerId?: string;
  customerName?: string;
  jobType: 'repair' | 'maintenance' | 'installation' | 'replacement' | 'upgrade' | 'inspection';
  location: string;
  workOrderNumber?: string;
  totalItems: number;
  totalValue: number;
  consumptionType: 'planned' | 'unplanned' | 'emergency' | 'warranty' | 'preventive';
  approvalStatus: 'auto_approved' | 'pending' | 'approved' | 'rejected' | 'requires_review';
  approvedBy?: string;
  approvalDate?: string;
  items: ConsumptionItem[];
  laborHours: number;
  completionStatus: 'completed' | 'partial' | 'pending' | 'cancelled';
  customerSatisfaction?: number;
  costCenter: string;
  billable: boolean;
  notes: string;
  attachments: string[];
}

interface ConsumptionItem {
  id: string;
  partNumber: string;
  partName: string;
  category: string;
  manufacturer: string;
  quantityConsumed: number;
  unitCost: number;
  totalCost: number;
  stockBefore: number;
  stockAfter: number;
  reason: 'defective' | 'worn_out' | 'damaged' | 'upgrade' | 'preventive' | 'customer_request' | 'inspection';
  replacementType: 'identical' | 'alternative' | 'upgraded';
  warranty: boolean;
  serialNumber?: string;
  batchNumber?: string;
  notes: string;
}

const mockConsumptions: PartsConsumption[] = [
  {
    id: '1',
    consumptionId: 'PC-2025-001',
    consumptionDate: '2025-10-23',
    consumedBy: 'Suresh Patel',
    technicianId: 'TECH001',
    department: 'Service Operations',
    serviceRequestId: 'SR-2025-145',
    contractId: 'AMC-2025-0001',
    customerId: 'CUST001',
    customerName: 'Sharma Modular Kitchens Pvt Ltd',
    jobType: 'repair',
    location: 'Mumbai, Maharashtra',
    workOrderNumber: 'WO-2025-089',
    totalItems: 4,
    totalValue: 2400,
    consumptionType: 'unplanned',
    approvalStatus: 'auto_approved',
    approvedBy: 'System',
    approvalDate: '2025-10-23',
    items: [
      {
        id: '1',
        partNumber: 'KIT-HNG-001',
        partName: 'Cabinet Hinge - Soft Close',
        category: 'Hardware',
        manufacturer: 'Hettich',
        quantityConsumed: 4,
        unitCost: 450,
        totalCost: 1800,
        stockBefore: 249,
        stockAfter: 245,
        reason: 'defective',
        replacementType: 'identical',
        warranty: true,
        serialNumber: '',
        batchNumber: 'HT-2025-B123',
        notes: 'Soft close mechanism failed, replaced under warranty'
      },
      {
        id: '2',
        partNumber: 'MCH-SCR-008',
        partName: 'Mounting Screws Set',
        category: 'Hardware',
        manufacturer: 'Hafele',
        quantityConsumed: 2,
        unitCost: 125,
        totalCost: 250,
        stockBefore: 158,
        stockAfter: 156,
        reason: 'damaged',
        replacementType: 'identical',
        warranty: false,
        serialNumber: '',
        batchNumber: '',
        notes: 'Screws stripped during hinge replacement'
      },
      {
        id: '3',
        partNumber: 'CON-ADH-015',
        partName: 'Industrial Adhesive',
        category: 'Consumable',
        manufacturer: 'Fevicol',
        quantityConsumed: 1,
        unitCost: 350,
        totalCost: 350,
        stockBefore: 46,
        stockAfter: 45,
        reason: 'preventive',
        replacementType: 'identical',
        warranty: false,
        serialNumber: '',
        batchNumber: 'FV-2025-ADH',
        notes: 'Additional reinforcement for cabinet mounting'
      }
    ],
    laborHours: 3.5,
    completionStatus: 'completed',
    customerSatisfaction: 4.8,
    costCenter: 'SERVICE-001',
    billable: false,
    notes: 'Customer reported cabinet door not closing properly. Found faulty hinges and replaced under AMC warranty.',
    attachments: ['before_photo.jpg', 'after_photo.jpg', 'customer_signature.pdf']
  },
  {
    id: '2',
    consumptionId: 'PC-2025-002',
    consumptionDate: '2025-10-22',
    consumedBy: 'Amit Singh',
    technicianId: 'TECH002',
    department: 'Field Service',
    serviceRequestId: 'SR-2025-142',
    contractId: 'CMC-2025-0012',
    customerId: 'CUST002',
    customerName: 'Elite Kitchen Solutions',
    jobType: 'replacement',
    location: 'Delhi, NCR',
    workOrderNumber: 'WO-2025-087',
    totalItems: 2,
    totalValue: 1750,
    consumptionType: 'emergency',
    approvalStatus: 'approved',
    approvedBy: 'Service Manager',
    approvalDate: '2025-10-22',
    items: [
      {
        id: '1',
        partNumber: 'ELC-LED-012',
        partName: 'LED Strip Light - Under Cabinet',
        category: 'Electronics',
        manufacturer: 'Philips',
        quantityConsumed: 1,
        unitCost: 1250,
        totalCost: 1250,
        stockBefore: 36,
        stockAfter: 35,
        reason: 'defective',
        replacementType: 'identical',
        warranty: true,
        serialNumber: 'LED-2025-001234',
        batchNumber: 'PH-LED-B456',
        notes: 'LED strip completely failed, no power'
      },
      {
        id: '2',
        partNumber: 'ELC-PWR-025',
        partName: 'Power Adapter 24V',
        category: 'Electronics',
        manufacturer: 'Mean Well',
        quantityConsumed: 1,
        unitCost: 500,
        totalCost: 500,
        stockBefore: 29,
        stockAfter: 28,
        reason: 'defective',
        replacementType: 'identical',
        warranty: true,
        serialNumber: 'PWR-2025-005678',
        batchNumber: '',
        notes: 'Power adapter burned out, replaced with same model'
      }
    ],
    laborHours: 2.0,
    completionStatus: 'completed',
    customerSatisfaction: 4.5,
    costCenter: 'SERVICE-002',
    billable: false,
    notes: 'Emergency call for kitchen lighting failure. Customer has important dinner party tonight.',
    attachments: ['emergency_approval.pdf', 'completion_report.pdf']
  },
  {
    id: '3',
    consumptionId: 'PC-2025-003',
    consumptionDate: '2025-10-21',
    consumedBy: 'Ravi Kumar',
    technicianId: 'TECH003',
    department: 'Installation',
    serviceRequestId: '',
    contractId: '',
    customerId: 'CUST003',
    customerName: 'Modern Home Interiors',
    jobType: 'installation',
    location: 'Bangalore, Karnataka',
    workOrderNumber: 'WO-2025-085',
    totalItems: 12,
    totalValue: 8950,
    consumptionType: 'planned',
    approvalStatus: 'auto_approved',
    approvedBy: 'System',
    approvalDate: '2025-10-21',
    items: [
      {
        id: '1',
        partNumber: 'MCH-DRW-025',
        partName: 'Drawer Slide - Heavy Duty',
        category: 'Mechanical',
        manufacturer: 'Blum',
        quantityConsumed: 8,
        unitCost: 890,
        totalCost: 7120,
        stockBefore: 8,
        stockAfter: 0,
        reason: 'customer_request',
        replacementType: 'identical',
        warranty: false,
        serialNumber: '',
        batchNumber: 'BL-DRW-2025',
        notes: 'New installation for modular kitchen project'
      },
      {
        id: '2',
        partNumber: 'MCH-SCR-015',
        partName: 'Heavy Duty Mounting Screws',
        category: 'Hardware',
        manufacturer: 'Hafele',
        quantityConsumed: 64,
        unitCost: 25,
        totalCost: 1600,
        stockBefore: 180,
        stockAfter: 116,
        reason: 'customer_request',
        replacementType: 'identical',
        warranty: false,
        serialNumber: '',
        batchNumber: '',
        notes: '8 screws per drawer slide, 8 slides total'
      },
      {
        id: '3',
        partNumber: 'CON-LUB-012',
        partName: 'Hinge Lubricant',
        category: 'Consumable',
        manufacturer: '3M',
        quantityConsumed: 2,
        unitCost: 115,
        totalCost: 230,
        stockBefore: 26,
        stockAfter: 24,
        reason: 'preventive',
        replacementType: 'identical',
        warranty: false,
        serialNumber: '',
        batchNumber: '',
        notes: 'Applied to all moving parts for smooth operation'
      }
    ],
    laborHours: 6.0,
    completionStatus: 'completed',
    customerSatisfaction: 4.9,
    costCenter: 'INSTALL-001',
    billable: true,
    notes: 'Premium kitchen installation project. Customer very satisfied with quality and finish.',
    attachments: ['installation_photos.zip', 'quality_checklist.pdf']
  },
  {
    id: '4',
    consumptionId: 'PC-2025-004',
    consumptionDate: '2025-10-20',
    consumedBy: 'Deepak Sharma',
    technicianId: 'TECH004',
    department: 'Maintenance',
    serviceRequestId: 'SR-2025-138',
    contractId: 'AMC-2025-0033',
    customerId: 'CUST004',
    customerName: 'Luxury Kitchen Designs',
    jobType: 'maintenance',
    location: 'Chennai, Tamil Nadu',
    workOrderNumber: 'WO-2025-083',
    totalItems: 6,
    totalValue: 1450,
    consumptionType: 'preventive',
    approvalStatus: 'auto_approved',
    approvedBy: 'System',
    approvalDate: '2025-10-20',
    items: [
      {
        id: '1',
        partNumber: 'CON-CLN-008',
        partName: 'Kitchen Cleaner - Stainless Steel',
        category: 'Consumable',
        manufacturer: 'Weiman',
        quantityConsumed: 4,
        unitCost: 125,
        totalCost: 500,
        stockBefore: 854,
        stockAfter: 850,
        reason: 'preventive',
        replacementType: 'identical',
        warranty: false,
        serialNumber: '',
        batchNumber: '',
        notes: 'Quarterly deep cleaning of stainless steel surfaces'
      },
      {
        id: '2',
        partNumber: 'CON-LUB-012',
        partName: 'Hinge Lubricant',
        category: 'Consumable',
        manufacturer: '3M',
        quantityConsumed: 3,
        unitCost: 85,
        totalCost: 255,
        stockBefore: 27,
        stockAfter: 24,
        reason: 'preventive',
        replacementType: 'identical',
        warranty: false,
        serialNumber: '',
        batchNumber: '',
        notes: 'Lubricated all cabinet hinges and drawer slides'
      },
      {
        id: '3',
        partNumber: 'CON-POL-005',
        partName: 'Wood Polish - Premium',
        category: 'Consumable',
        manufacturer: 'Godrej',
        quantityConsumed: 2,
        unitCost: 145,
        totalCost: 290,
        stockBefore: 35,
        stockAfter: 33,
        reason: 'preventive',
        replacementType: 'identical',
        warranty: false,
        serialNumber: '',
        batchNumber: '',
        notes: 'Applied premium polish to maintain wood finish'
      },
      {
        id: '4',
        partNumber: 'CON-CLO-010',
        partName: 'Microfiber Cleaning Cloth',
        category: 'Consumable',
        manufacturer: 'Scotch-Brite',
        quantityConsumed: 12,
        unitCost: 35,
        totalCost: 420,
        stockBefore: 75,
        stockAfter: 63,
        reason: 'preventive',
        replacementType: 'identical',
        warranty: false,
        serialNumber: '',
        batchNumber: '',
        notes: 'Used for cleaning and polishing activities'
      }
    ],
    laborHours: 4.5,
    completionStatus: 'completed',
    customerSatisfaction: 4.7,
    costCenter: 'MAINTENANCE-001',
    billable: false,
    notes: 'Scheduled quarterly maintenance completed successfully. All systems functioning optimally.',
    attachments: ['maintenance_checklist.pdf', 'before_after_photos.zip']
  },
  {
    id: '5',
    consumptionId: 'PC-2025-005',
    consumptionDate: '2025-10-19',
    consumedBy: 'Manoj Kumar',
    technicianId: 'TECH005',
    department: 'Quality Assurance',
    serviceRequestId: 'SR-2025-135',
    customerId: 'CUST005',
    customerName: 'Premium Kitchen Works',
    jobType: 'inspection',
    location: 'Pune, Maharashtra',
    workOrderNumber: 'WO-2025-081',
    totalItems: 2,
    totalValue: 450,
    consumptionType: 'unplanned',
    approvalStatus: 'pending',
    laborHours: 1.5,
    completionStatus: 'partial',
    costCenter: 'QA-001',
    billable: false,
    notes: 'Quality inspection revealed minor issues. Awaiting approval for additional part replacement.',
    items: [
      {
        id: '1',
        partNumber: 'TLS-MSR-008',
        partName: 'Digital Calipers',
        category: 'Tools',
        manufacturer: 'Mitutoyo',
        quantityConsumed: 1,
        unitCost: 350,
        totalCost: 350,
        stockBefore: 9,
        stockAfter: 8,
        reason: 'inspection',
        replacementType: 'identical',
        warranty: false,
        serialNumber: 'MIT-001234',
        batchNumber: '',
        notes: 'Used for precision measurement during quality inspection'
      },
      {
        id: '2',
        partNumber: 'CON-MRK-003',
        partName: 'Marking Tape',
        category: 'Consumable',
        manufacturer: '3M',
        quantityConsumed: 2,
        unitCost: 50,
        totalCost: 100,
        stockBefore: 48,
        stockAfter: 46,
        reason: 'inspection',
        replacementType: 'identical',
        warranty: false,
        serialNumber: '',
        batchNumber: '',
        notes: 'Used for marking inspection points and issues'
      }
    ],
    attachments: ['inspection_report.pdf']
  }
];

export default function PartsConsumptionPage() {
  const router = useRouter();
  const [consumptions, setConsumptions] = useState<PartsConsumption[]>(mockConsumptions);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedJobType, setSelectedJobType] = useState<string>('all');
  const [selectedConsumptionType, setSelectedConsumptionType] = useState<string>('all');
  const [selectedDateRange, setSelectedDateRange] = useState<string>('7days');
  const [sortBy, setSortBy] = useState<string>('consumptionDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedConsumption, setSelectedConsumption] = useState<PartsConsumption | null>(null);
  const [showConsumptionModal, setShowConsumptionModal] = useState(false);

  // Filter and search consumptions
  const filteredConsumptions = consumptions.filter(consumption => {
    const matchesSearch = 
      consumption.consumptionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consumption.consumedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consumption.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consumption.items.some(item => 
        item.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.partName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    const matchesDepartment = selectedDepartment === 'all' || consumption.department === selectedDepartment;
    const matchesJobType = selectedJobType === 'all' || consumption.jobType === selectedJobType;
    const matchesConsumptionType = selectedConsumptionType === 'all' || consumption.consumptionType === selectedConsumptionType;
    
    // Date range filter
    const consumptionDate = new Date(consumption.consumptionDate);
    const now = new Date();
    let matchesDateRange = true;
    
    switch (selectedDateRange) {
      case '7days':
        matchesDateRange = (now.getTime() - consumptionDate.getTime()) <= 7 * 24 * 60 * 60 * 1000;
        break;
      case '30days':
        matchesDateRange = (now.getTime() - consumptionDate.getTime()) <= 30 * 24 * 60 * 60 * 1000;
        break;
      case '90days':
        matchesDateRange = (now.getTime() - consumptionDate.getTime()) <= 90 * 24 * 60 * 60 * 1000;
        break;
      default:
        matchesDateRange = true;
    }
    
    return matchesSearch && matchesDepartment && matchesJobType && matchesConsumptionType && matchesDateRange;
  });

  // Sort consumptions
  const sortedConsumptions = [...filteredConsumptions].sort((a, b) => {
    let aValue: any = a[sortBy as keyof PartsConsumption];
    let bValue: any = b[sortBy as keyof PartsConsumption];
    
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

  const getJobTypeColor = (jobType: string) => {
    switch (jobType) {
      case 'repair': return 'bg-red-100 text-red-800';
      case 'maintenance': return 'bg-orange-100 text-orange-800';
      case 'installation': return 'bg-purple-100 text-purple-800';
      case 'replacement': return 'bg-yellow-100 text-yellow-800';
      case 'upgrade': return 'bg-blue-100 text-blue-800';
      case 'inspection': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConsumptionTypeColor = (type: string) => {
    switch (type) {
      case 'planned': return 'bg-green-100 text-green-800';
      case 'unplanned': return 'bg-yellow-100 text-yellow-800';
      case 'emergency': return 'bg-red-100 text-red-800';
      case 'warranty': return 'bg-blue-100 text-blue-800';
      case 'preventive': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCompletionStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleConsumptionClick = (consumption: PartsConsumption) => {
    setSelectedConsumption(consumption);
    setShowConsumptionModal(true);
  };

  const calculateStats = () => {
    const totalValue = consumptions.reduce((sum, consumption) => sum + consumption.totalValue, 0);
    const totalItems = consumptions.reduce((sum, consumption) => sum + consumption.totalItems, 0);
    const emergencyConsumptions = consumptions.filter(c => c.consumptionType === 'emergency').length;
    const warrantyConsumptions = consumptions.filter(c => c.consumptionType === 'warranty').length;
    const avgCustomerSatisfaction = consumptions
      .filter(c => c.customerSatisfaction)
      .reduce((sum, c) => sum + (c.customerSatisfaction || 0), 0) / 
      consumptions.filter(c => c.customerSatisfaction).length;
    const billableConsumptions = consumptions.filter(c => c.billable).length;

    return {
      totalValue,
      totalItems,
      emergencyConsumptions,
      warrantyConsumptions,
      avgCustomerSatisfaction: avgCustomerSatisfaction || 0,
      billableConsumptions
    };
  };

  const stats = calculateStats();

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Parts Consumption</h1>
          <p className="text-gray-600">Track and analyze parts usage across service operations</p>
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
            onClick={() => router.push('/after-sales-service/parts/consumption')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Record Consumption
          </button>
          <button
            onClick={() => router.push('/after-sales-service/parts/consumption')}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <BarChart3 className="w-4 h-4" />
            Analytics
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-2">
        <div className="bg-white p-3 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Records</p>
              <p className="text-2xl font-bold text-gray-900">{consumptions.length}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white p-3 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">₹{(stats.totalValue / 1000).toFixed(0)}K</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white p-3 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Items Consumed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalItems}</p>
            </div>
            <Package className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white p-3 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Emergency</p>
              <p className="text-2xl font-bold text-red-600">{stats.emergencyConsumptions}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>
        
        <div className="bg-white p-3 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Warranty</p>
              <p className="text-2xl font-bold text-blue-600">{stats.warrantyConsumptions}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white p-3 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Satisfaction</p>
              <p className="text-2xl font-bold text-green-600">{stats.avgCustomerSatisfaction.toFixed(1)}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600" />
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
              placeholder="Search consumption records..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={selectedDateRange}
            onChange={(e) => setSelectedDateRange(e.target.value)}
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="all">All Time</option>
          </select>
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="consumptionDate">Sort by Date</option>
            <option value="totalValue">Sort by Value</option>
            <option value="totalItems">Sort by Items</option>
            <option value="department">Sort by Department</option>
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
            
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={selectedJobType}
              onChange={(e) => setSelectedJobType(e.target.value)}
            >
              <option value="all">All Job Types</option>
              <option value="repair">Repair</option>
              <option value="maintenance">Maintenance</option>
              <option value="installation">Installation</option>
              <option value="replacement">Replacement</option>
              <option value="upgrade">Upgrade</option>
              <option value="inspection">Inspection</option>
            </select>
            
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={selectedConsumptionType}
              onChange={(e) => setSelectedConsumptionType(e.target.value)}
            >
              <option value="all">All Consumption Types</option>
              <option value="planned">Planned</option>
              <option value="unplanned">Unplanned</option>
              <option value="emergency">Emergency</option>
              <option value="warranty">Warranty</option>
              <option value="preventive">Preventive</option>
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

      {/* Consumption Records Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Consumption Details
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Technician & Job
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items & Value
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer & Location
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type & Status
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedConsumptions.map((consumption) => (
                <tr 
                  key={consumption.id} 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleConsumptionClick(consumption)}
                >
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-gray-900">{consumption.consumptionId}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(consumption.consumptionDate).toLocaleDateString()}
                      </div>
                      {consumption.workOrderNumber && (
                        <div className="text-xs text-blue-600">WO: {consumption.workOrderNumber}</div>
                      )}
                      {consumption.serviceRequestId && (
                        <div className="text-xs text-purple-600">SR: {consumption.serviceRequestId}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="flex items-center text-sm font-medium text-gray-900">
                        <User className="w-4 h-4 mr-1" />
                        {consumption.consumedBy}
                      </div>
                      <div className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDepartmentColor(consumption.department)}`}>
                        {consumption.department}
                      </div>
                      <div className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getJobTypeColor(consumption.jobType)}`}>
                        {consumption.jobType.toUpperCase()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {consumption.laborHours}h labor
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-gray-900">
                        {consumption.totalItems} items
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        ₹{(consumption.totalValue / 1000).toFixed(1)}K
                      </div>
                      <div className="text-xs text-gray-500">
                        Cost Center: {consumption.costCenter}
                      </div>
                      {consumption.billable ? (
                        <div className="text-xs text-green-600">Billable</div>
                      ) : (
                        <div className="text-xs text-gray-500">Non-billable</div>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="space-y-1">
                      {consumption.customerName ? (
                        <>
                          <div className="text-sm font-medium text-gray-900">
                            {consumption.customerName}
                          </div>
                          <div className="text-xs text-gray-500">
                            ID: {consumption.customerId}
                          </div>
                        </>
                      ) : (
                        <div className="text-sm text-gray-500">Internal Job</div>
                      )}
                      <div className="flex items-center text-xs text-gray-500">
                        <MapPin className="w-3 h-3 mr-1" />
                        {consumption.location}
                      </div>
                      {consumption.contractId && (
                        <div className="text-xs text-blue-600">
                          Contract: {consumption.contractId}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getConsumptionTypeColor(consumption.consumptionType)}`}>
                        {consumption.consumptionType.toUpperCase()}
                      </div>
                      <div className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCompletionStatusColor(consumption.completionStatus)}`}>
                        {consumption.completionStatus.toUpperCase()}
                      </div>
                      <div className="text-xs text-gray-500 capitalize">
                        {consumption.approvalStatus.replace('_', ' ')}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="space-y-1">
                      {consumption.customerSatisfaction && (
                        <>
                          <div className="text-sm font-medium text-green-600">
                            {consumption.customerSatisfaction.toFixed(1)} ★
                          </div>
                          <div className="text-xs text-gray-500">Customer Rating</div>
                        </>
                      )}
                      {consumption.attachments.length > 0 && (
                        <div className="text-xs text-blue-600">
                          {consumption.attachments.length} attachments
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/after-sales-service/parts/consumption/view/${consumption.id}`);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                       
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/after-sales-service/parts/consumption/edit/${consumption.id}`);
                        }}
                        className="text-gray-600 hover:text-gray-900"
                       
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle download report
                        }}
                        className="text-green-600 hover:text-green-900"
                       
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Consumption Details Modal */}
      {showConsumptionModal && selectedConsumption && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 z-50">
          <div className="bg-white rounded-lg p-3 w-full  max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-bold text-gray-900">Consumption Details</h2>
              <button
                onClick={() => setShowConsumptionModal(false)}
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
                    <span className="text-gray-600">Consumption ID:</span>
                    <span className="font-medium">{selectedConsumption.consumptionId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">{new Date(selectedConsumption.consumptionDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Technician:</span>
                    <span className="font-medium">{selectedConsumption.consumedBy}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Department:</span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getDepartmentColor(selectedConsumption.department)}`}>
                      {selectedConsumption.department}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Job Type:</span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getJobTypeColor(selectedConsumption.jobType)}`}>
                      {selectedConsumption.jobType.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Job Details */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">Job Details</h3>
                <div className="bg-gray-50 p-3 rounded-lg space-y-3">
                  {selectedConsumption.workOrderNumber && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Work Order:</span>
                      <span className="font-medium">{selectedConsumption.workOrderNumber}</span>
                    </div>
                  )}
                  {selectedConsumption.serviceRequestId && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Service Request:</span>
                      <span className="font-medium">{selectedConsumption.serviceRequestId}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Labor Hours:</span>
                    <span className="font-medium">{selectedConsumption.laborHours}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getCompletionStatusColor(selectedConsumption.completionStatus)}`}>
                      {selectedConsumption.completionStatus.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Location:</span>
                    <span className="font-medium">{selectedConsumption.location}</span>
                  </div>
                </div>
              </div>

              {/* Financial Summary */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">Financial Summary</h3>
                <div className="bg-gray-50 p-3 rounded-lg space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Items:</span>
                    <span className="font-medium">{selectedConsumption.totalItems}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Value:</span>
                    <span className="font-medium">₹{(selectedConsumption.totalValue / 1000).toFixed(1)}K</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cost Center:</span>
                    <span className="font-medium">{selectedConsumption.costCenter}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Billable:</span>
                    <span className={`font-medium ${selectedConsumption.billable ? 'text-green-600' : 'text-gray-600'}`}>
                      {selectedConsumption.billable ? 'Yes' : 'No'}
                    </span>
                  </div>
                  {selectedConsumption.customerSatisfaction && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Customer Rating:</span>
                      <span className="font-medium text-green-600">{selectedConsumption.customerSatisfaction.toFixed(1)} ★</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Consumed Items */}
              <div className="lg:col-span-3 space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">Consumed Items</h3>
                <div className="bg-gray-50 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Part</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cost</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Stock Impact</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedConsumption.items.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-2">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{item.partNumber}</div>
                              <div className="text-xs text-gray-500">{item.partName}</div>
                              <div className="text-xs text-gray-500">{item.manufacturer}</div>
                            </div>
                          </td>
                          <td className="px-4 py-2">
                            <div className="text-sm font-medium text-gray-900">{item.quantityConsumed}</div>
                            {item.warranty && (
                              <div className="text-xs text-green-600">Under Warranty</div>
                            )}
                          </td>
                          <td className="px-4 py-2">
                            <div className="text-sm">
                              <div>₹{item.unitCost.toLocaleString()}</div>
                              <div className="text-gray-500">Total: ₹{item.totalCost.toLocaleString()}</div>
                            </div>
                          </td>
                          <td className="px-4 py-2">
                            <div className="text-sm">
                              <div>Before: {item.stockBefore}</div>
                              <div>After: {item.stockAfter}</div>
                            </div>
                          </td>
                          <td className="px-4 py-2">
                            <div className="text-xs text-gray-600 capitalize">{item.reason.replace('_', ' ')}</div>
                            <div className="text-xs text-gray-500 capitalize">{item.replacementType}</div>
                          </td>
                          <td className="px-4 py-2">
                            <div className="text-xs text-gray-600">{item.notes}</div>
                            {item.batchNumber && (
                              <div className="text-xs text-blue-600">Batch: {item.batchNumber}</div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Notes */}
              {selectedConsumption.notes && (
                <div className="lg:col-span-3 space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900">Notes</h3>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-gray-700">{selectedConsumption.notes}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowConsumptionModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => router.push(`/after-sales-service/parts/consumption/edit/${selectedConsumption.id}`)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Edit Record
              </button>
              <button
                onClick={() => router.push(`/after-sales-service/parts/consumption/view/${selectedConsumption.id}`)}
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