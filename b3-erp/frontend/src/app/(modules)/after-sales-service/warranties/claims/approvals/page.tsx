'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  Eye,
  FileText,
  AlertTriangle,
  DollarSign,
  Calendar,
  User,
  Package,
  Phone,
  Mail,
  Star,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Download,
  Upload,
  Camera,
  Wrench,
  Shield,
  ChevronRight,
  Edit
} from 'lucide-react';
import { exportToCsv } from '@/lib/export';

interface ClaimApproval {
  id: string;
  claimNumber: string;
  warrantyNumber: string;
  warrantyType: 'Standard' | 'Extended' | 'Manufacturer' | 'Dealer';
  status: 'Pending Review' | 'Under Investigation' | 'Requires Documentation' | 'Ready for Approval' | 'Approved' | 'Rejected';
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  customer: {
    name: string;
    phone: string;
    email: string;
    customerId: string;
  };
  equipment: {
    model: string;
    serialNumber: string;
    category: string;
    installationDate: string;
  };
  claimDetails: {
    issueDescription: string;
    faultCategory: string;
    reportedDate: string;
    submittedDate: string;
    claimedAmount: number;
    estimatedAmount?: number;
    partsCost?: number;
    laborCost?: number;
  };
  technician: {
    name: string;
    id: string;
    assessment: string;
    visitDate: string;
    recommendation: 'Approve' | 'Reject' | 'Investigate' | 'Request More Info';
  };
  documentation: {
    photos: number;
    videos: number;
    reports: number;
    invoices: number;
    isComplete: boolean;
    missingDocs?: string[];
  };
  approval: {
    assignedTo?: string;
    reviewStarted?: string;
    lastUpdated: string;
    notes?: string;
    escalated: boolean;
    escalationReason?: string;
  };
  warranty: {
    startDate: string;
    endDate: string;
    coverage: string;
    remainingValue: number;
    previousClaims: number;
  };
  riskFactors: string[];
  urgencyScore: number; // 1-10
}

const ClaimsApprovalsPage = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterAssignee, setFilterAssignee] = useState('');
  const [filterAmount, setFilterAmount] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<ClaimApproval | null>(null);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject' | null>(null);
  const [approvalNotes, setApprovalNotes] = useState('');

  const claimApprovals: ClaimApproval[] = [
    {
      id: '1',
      claimNumber: 'CLM-2025-0001',
      warrantyNumber: 'WRN-2025-00001',
      warrantyType: 'Standard',
      status: 'Ready for Approval',
      priority: 'High',
      customer: {
        name: 'Sharma Modular Kitchens Pvt Ltd',
        phone: '+91-98765-43210',
        email: 'claims@sharma-kitchens.com',
        customerId: 'CUST001'
      },
      equipment: {
        model: 'Modular Kitchen Premium SS-304',
        serialNumber: 'MK-SS304-2025-001',
        category: 'Modular Kitchen',
        installationDate: '2024-06-15'
      },
      claimDetails: {
        issueDescription: 'Gas burner ignition system failure - requires control valve replacement and safety calibration',
        faultCategory: 'Component Failure',
        reportedDate: '2025-01-15',
        submittedDate: '2025-01-16',
        claimedAmount: 15000,
        estimatedAmount: 12500,
        partsCost: 8000,
        laborCost: 4500
      },
      technician: {
        name: 'Rajesh Kumar',
        id: 'TECH-001',
        assessment: 'Genuine manufacturing defect in control valve. Replacement required under warranty terms.',
        visitDate: '2025-01-16',
        recommendation: 'Approve'
      },
      documentation: {
        photos: 8,
        videos: 2,
        reports: 1,
        invoices: 0,
        isComplete: true
      },
      approval: {
        assignedTo: 'Priya Sharma',
        reviewStarted: '2025-01-17',
        lastUpdated: '2025-01-17',
        escalated: false
      },
      warranty: {
        startDate: '2024-06-15',
        endDate: '2025-06-14',
        coverage: 'Parts & Labor',
        remainingValue: 85000,
        previousClaims: 0
      },
      riskFactors: [],
      urgencyScore: 7
    },
    {
      id: '2',
      claimNumber: 'CLM-2025-0002',
      warrantyNumber: 'WRN-2024-00456',
      warrantyType: 'Extended',
      status: 'Under Investigation',
      priority: 'Critical',
      customer: {
        name: 'Prestige Developers Bangalore',
        phone: '+91-98765-54321',
        email: 'warranty@prestigegroup.com',
        customerId: 'CUST002'
      },
      equipment: {
        model: 'Built-in Hob 4 Burner Gas',
        serialNumber: 'HB-4B-2024-234',
        category: 'Cooking Appliances',
        installationDate: '2024-03-20'
      },
      claimDetails: {
        issueDescription: 'Gas leak detected from main supply line connection causing safety hazard',
        faultCategory: 'Safety Issue',
        reportedDate: '2025-01-14',
        submittedDate: '2025-01-14',
        claimedAmount: 25000,
        estimatedAmount: 22000,
        partsCost: 15000,
        laborCost: 7000
      },
      technician: {
        name: 'Suresh Rao',
        id: 'TECH-002',
        assessment: 'Safety-critical issue requires immediate attention. Installation error during initial setup.',
        visitDate: '2025-01-15',
        recommendation: 'Investigate'
      },
      documentation: {
        photos: 15,
        videos: 3,
        reports: 2,
        invoices: 1,
        isComplete: false,
        missingDocs: ['Gas safety certificate', 'Installation compliance report']
      },
      approval: {
        assignedTo: 'Vikram Singh',
        reviewStarted: '2025-01-15',
        lastUpdated: '2025-01-16',
        escalated: true,
        escalationReason: 'Safety-critical issue requiring senior approval'
      },
      warranty: {
        startDate: '2024-03-20',
        endDate: '2027-03-19',
        coverage: 'Comprehensive',
        remainingValue: 125000,
        previousClaims: 1
      },
      riskFactors: ['Safety Critical', 'Installation Related', 'High Value'],
      urgencyScore: 10
    },
    {
      id: '3',
      claimNumber: 'CLM-2025-0003',
      warrantyNumber: 'WRN-2024-00789',
      warrantyType: 'Manufacturer',
      status: 'Requires Documentation',
      priority: 'Medium',
      customer: {
        name: 'Urban Interiors & Designers',
        phone: '+91-98765-67890',
        email: 'service@urbaninteriors.co.in',
        customerId: 'CUST003'
      },
      equipment: {
        model: 'Chimney Auto Clean 90cm',
        serialNumber: 'CH-AC90-2024-067',
        category: 'Kitchen Appliances',
        installationDate: '2024-05-10'
      },
      claimDetails: {
        issueDescription: 'Auto-clean function not working, filter mechanism jammed',
        faultCategory: 'Mechanical Failure',
        reportedDate: '2025-01-12',
        submittedDate: '2025-01-13',
        claimedAmount: 8500,
        estimatedAmount: 7200,
        partsCost: 4500,
        laborCost: 2700
      },
      technician: {
        name: 'Prakash M',
        id: 'TECH-003',
        assessment: 'Filter mechanism shows wear beyond normal usage. Requires investigation into usage patterns.',
        visitDate: '2025-01-13',
        recommendation: 'Request More Info'
      },
      documentation: {
        photos: 5,
        videos: 0,
        reports: 1,
        invoices: 0,
        isComplete: false,
        missingDocs: ['Usage log', 'Maintenance records', 'Customer usage declaration']
      },
      approval: {
        assignedTo: 'Anita Desai',
        reviewStarted: '2025-01-14',
        lastUpdated: '2025-01-16',
        escalated: false
      },
      warranty: {
        startDate: '2024-05-10',
        endDate: '2026-05-09',
        coverage: 'Parts Only',
        remainingValue: 45000,
        previousClaims: 0
      },
      riskFactors: ['Usage Related', 'Documentation Incomplete'],
      urgencyScore: 5
    },
    {
      id: '4',
      claimNumber: 'CLM-2025-0004',
      warrantyNumber: 'WRN-2024-00234',
      warrantyType: 'Dealer',
      status: 'Pending Review',
      priority: 'Low',
      customer: {
        name: 'Elite Contractors & Builders',
        phone: '+91-98765-44444',
        email: 'warranty@elitecontractors.com',
        customerId: 'CUST004'
      },
      equipment: {
        model: 'Built-in Oven 60L',
        serialNumber: 'OV-60L-2024-543',
        category: 'Cooking Appliances',
        installationDate: '2024-07-01'
      },
      claimDetails: {
        issueDescription: 'Temperature sensor giving incorrect readings, affecting cooking performance',
        faultCategory: 'Sensor Malfunction',
        reportedDate: '2025-01-10',
        submittedDate: '2025-01-11',
        claimedAmount: 6500,
        estimatedAmount: 5800,
        partsCost: 3500,
        laborCost: 2300
      },
      technician: {
        name: 'Arun Reddy',
        id: 'TECH-004',
        assessment: 'Temperature sensor requires calibration. May need replacement if calibration fails.',
        visitDate: '2025-01-12',
        recommendation: 'Approve'
      },
      documentation: {
        photos: 3,
        videos: 1,
        reports: 1,
        invoices: 0,
        isComplete: true
      },
      approval: {
        lastUpdated: '2025-01-12',
        escalated: false
      },
      warranty: {
        startDate: '2024-07-01',
        endDate: '2025-06-30',
        coverage: 'Labor Only',
        remainingValue: 15000,
        previousClaims: 1
      },
      riskFactors: [],
      urgencyScore: 3
    },
    {
      id: '5',
      claimNumber: 'CLM-2025-0005',
      warrantyNumber: 'WRN-2024-00567',
      warrantyType: 'Extended',
      status: 'Approved',
      priority: 'Medium',
      customer: {
        name: 'DLF Universal Projects',
        phone: '+91-98765-11111',
        email: 'maintenance@dlf.co.in',
        customerId: 'CUST005'
      },
      equipment: {
        model: 'Dishwasher 14 Place Settings',
        serialNumber: 'DW-14PS-2023-890',
        category: 'Kitchen Appliances',
        installationDate: '2023-08-15'
      },
      claimDetails: {
        issueDescription: 'Water pump motor failure causing drainage issues',
        faultCategory: 'Motor Failure',
        reportedDate: '2025-01-08',
        submittedDate: '2025-01-09',
        claimedAmount: 18000,
        estimatedAmount: 16500,
        partsCost: 12000,
        laborCost: 4500
      },
      technician: {
        name: 'Maria Gonzalez',
        id: 'TECH-005',
        assessment: 'Motor failure due to normal wear. Well within warranty terms for replacement.',
        visitDate: '2025-01-10',
        recommendation: 'Approve'
      },
      documentation: {
        photos: 6,
        videos: 1,
        reports: 1,
        invoices: 1,
        isComplete: true
      },
      approval: {
        assignedTo: 'Rohit Sharma',
        reviewStarted: '2025-01-11',
        lastUpdated: '2025-01-12',
        notes: 'Approved for motor replacement. Schedule service within 48 hours.',
        escalated: false
      },
      warranty: {
        startDate: '2023-08-15',
        endDate: '2026-08-14',
        coverage: 'Comprehensive',
        remainingValue: 95000,
        previousClaims: 2
      },
      riskFactors: [],
      urgencyScore: 6
    },
    {
      id: '6',
      claimNumber: 'CLM-2025-0006',
      warrantyNumber: 'WRN-2024-00890',
      warrantyType: 'Standard',
      status: 'Rejected',
      priority: 'Low',
      customer: {
        name: 'Modern Living Solutions',
        phone: '+91-98765-66666',
        email: 'support@modernliving.co.in',
        customerId: 'CUST006'
      },
      equipment: {
        model: 'RO Water Purifier 10L',
        serialNumber: 'RO-10L-2024-678',
        category: 'Water Treatment',
        installationDate: '2024-09-01'
      },
      claimDetails: {
        issueDescription: 'Filter cartridges need frequent replacement, claiming defective filtration system',
        faultCategory: 'Performance Issue',
        reportedDate: '2025-01-05',
        submittedDate: '2025-01-06',
        claimedAmount: 12000,
        estimatedAmount: 0,
        partsCost: 8000,
        laborCost: 4000
      },
      technician: {
        name: 'James Wilson',
        id: 'TECH-006',
        assessment: 'Filter replacement is normal maintenance. Water quality in area requires frequent changes.',
        visitDate: '2025-01-07',
        recommendation: 'Reject'
      },
      documentation: {
        photos: 4,
        videos: 0,
        reports: 1,
        invoices: 0,
        isComplete: true
      },
      approval: {
        assignedTo: 'Sunita Verma',
        reviewStarted: '2025-01-08',
        lastUpdated: '2025-01-09',
        notes: 'Rejected - Filter replacement is routine maintenance, not covered under warranty.',
        escalated: false
      },
      warranty: {
        startDate: '2024-09-01',
        endDate: '2025-08-31',
        coverage: 'Parts & Labor',
        remainingValue: 35000,
        previousClaims: 0
      },
      riskFactors: ['Maintenance Related'],
      urgencyScore: 2
    }
  ];

  const filteredClaims = claimApprovals.filter(claim => {
    const matchesSearch = claim.claimNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         claim.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         claim.equipment.model.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !filterStatus || claim.status === filterStatus;
    const matchesPriority = !filterPriority || claim.priority === filterPriority;
    const matchesAssignee = !filterAssignee || claim.approval.assignedTo === filterAssignee;
    
    let matchesAmount = true;
    if (filterAmount) {
      const amount = claim.claimDetails.claimedAmount;
      switch (filterAmount) {
        case 'low':
          matchesAmount = amount <= 10000;
          break;
        case 'medium':
          matchesAmount = amount > 10000 && amount <= 25000;
          break;
        case 'high':
          matchesAmount = amount > 25000;
          break;
      }
    }
    
    return matchesSearch && matchesStatus && matchesPriority && matchesAssignee && matchesAmount;
  });

  const stats = {
    totalPending: claimApprovals.filter(c => ['Pending Review', 'Under Investigation', 'Requires Documentation', 'Ready for Approval'].includes(c.status)).length,
    criticalPending: claimApprovals.filter(c => c.priority === 'Critical' && ['Pending Review', 'Under Investigation', 'Ready for Approval'].includes(c.status)).length,
    totalValue: claimApprovals.reduce((sum, c) => sum + c.claimDetails.claimedAmount, 0),
    avgProcessingTime: 2.3, // days
    approvalRate: Math.round((claimApprovals.filter(c => c.status === 'Approved').length / claimApprovals.length) * 100)
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending Review': return 'bg-gray-100 text-gray-700';
      case 'Under Investigation': return 'bg-yellow-100 text-yellow-700';
      case 'Requires Documentation': return 'bg-orange-100 text-orange-700';
      case 'Ready for Approval': return 'bg-blue-100 text-blue-700';
      case 'Approved': return 'bg-green-100 text-green-700';
      case 'Rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-red-100 text-red-700 border-red-300';
      case 'High': return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'Medium': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'Low': return 'bg-green-100 text-green-700 border-green-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getUrgencyColor = (score: number) => {
    if (score >= 8) return 'text-red-600';
    if (score >= 6) return 'text-orange-600';
    if (score >= 4) return 'text-yellow-600';
    return 'text-green-600';
  };

  const handleApprovalAction = (action: 'approve' | 'reject') => {
    setApprovalAction(action);
    // In real app, this would call API to approve/reject claim
    console.log(`${action} claim with notes:`, approvalNotes);
    setSelectedClaim(null);
    setApprovalAction(null);
    setApprovalNotes('');
  };

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="h-7 w-7 text-blue-600" />
            Claims Approvals
          </h1>
          <p className="text-sm text-gray-500 mt-1">Review and approve warranty claim requests</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/after-sales-service/warranties/claims')}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <FileText className="h-4 w-4" />
            All Claims
          </button>
          <button
            onClick={() => exportToCsv('warranty-claim-approvals', filteredClaims)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Download className="h-4 w-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Review</p>
              <p className="text-2xl font-bold text-orange-600">{stats.totalPending}</p>
            </div>
            <Clock className="h-8 w-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Critical</p>
              <p className="text-2xl font-bold text-red-600">{stats.criticalPending}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <div className="text-xs text-gray-500 mt-1">High priority</div>
        </div>

        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-purple-600">₹{(stats.totalValue / 1000).toFixed(0)}K</p>
            </div>
            <DollarSign className="h-8 w-8 text-purple-600" />
          </div>
          <div className="text-xs text-gray-500 mt-1">Claims value</div>
        </div>

        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Processing</p>
              <p className="text-2xl font-bold text-blue-600">{stats.avgProcessingTime}</p>
            </div>
            <Calendar className="h-8 w-8 text-blue-600" />
          </div>
          <div className="text-xs text-gray-500 mt-1">Days to resolve</div>
        </div>

        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Approval Rate</p>
              <p className="text-2xl font-bold text-green-600">{stats.approvalRate}%</p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <div className="text-xs text-gray-500 mt-1">Success rate</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-3 rounded-lg border border-gray-200">
        <div className="flex flex-col md:flex-row gap-2">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by claim number, customer, or equipment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <Filter className="h-4 w-4" />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 pt-4 border-t border-gray-200">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="Pending Review">Pending Review</option>
              <option value="Under Investigation">Under Investigation</option>
              <option value="Requires Documentation">Requires Documentation</option>
              <option value="Ready for Approval">Ready for Approval</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>

            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Priority</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            <select
              value={filterAssignee}
              onChange={(e) => setFilterAssignee(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Assignees</option>
              <option value="Priya Sharma">Priya Sharma</option>
              <option value="Vikram Singh">Vikram Singh</option>
              <option value="Anita Desai">Anita Desai</option>
              <option value="Rohit Sharma">Rohit Sharma</option>
              <option value="Sunita Verma">Sunita Verma</option>
            </select>

            <select
              value={filterAmount}
              onChange={(e) => setFilterAmount(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Amounts</option>
              <option value="low">Low (≤₹10K)</option>
              <option value="medium">Medium (₹10K-25K)</option>
              <option value="high">High ({'>'}₹25K)</option>
            </select>
          </div>
        )}
      </div>

      {/* Claims List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-3 py-2 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Claims for Approval ({filteredClaims.length})
          </h2>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredClaims.map((claim) => (
            <div key={claim.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{claim.claimNumber}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(claim.status)}`}>
                      {claim.status}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(claim.priority)}`}>
                      {claim.priority}
                    </span>
                    <div className="flex items-center gap-1">
                      <Star className={`h-4 w-4 ${getUrgencyColor(claim.urgencyScore)}`} />
                      <span className={`text-sm font-medium ${getUrgencyColor(claim.urgencyScore)}`}>
                        {claim.urgencyScore}/10
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-2">
                    <div>
                      <h4 className="font-medium text-gray-800 mb-1">Customer</h4>
                      <p className="text-sm text-gray-600">{claim.customer.name}</p>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                        <Phone className="h-3 w-3" />
                        {claim.customer.phone}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 mb-1">Equipment</h4>
                      <p className="text-sm text-gray-600">{claim.equipment.model}</p>
                      <p className="text-xs text-gray-500">{claim.equipment.category}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 mb-1">Claim Amount</h4>
                      <p className="text-sm font-semibold text-gray-900">₹{claim.claimDetails.claimedAmount.toLocaleString()}</p>
                      {claim.claimDetails.estimatedAmount && (
                        <p className="text-xs text-green-600">Est: ₹{claim.claimDetails.estimatedAmount.toLocaleString()}</p>
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 mb-1">Technician</h4>
                      <p className="text-sm text-gray-600">{claim.technician.name}</p>
                      <p className="text-xs text-gray-500">{claim.technician.recommendation}</p>
                    </div>
                  </div>

                  <div className="mb-2">
                    <h4 className="font-medium text-gray-800 mb-2">Issue Description</h4>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                      {claim.claimDetails.issueDescription}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Reported: {claim.claimDetails.reportedDate}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      <span>Warranty: {claim.warrantyNumber}</span>
                    </div>
                    {claim.approval.assignedTo && (
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>Assigned: {claim.approval.assignedTo}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Camera className="h-4 w-4" />
                      <span>{claim.documentation.photos} photos</span>
                    </div>
                  </div>

                  {claim.riskFactors.length > 0 && (
                    <div className="mt-3">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm font-medium text-yellow-800">Risk Factors:</span>
                        <div className="flex flex-wrap gap-1">
                          {claim.riskFactors.map((risk, index) => (
                            <span key={index} className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full">
                              {risk}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => setSelectedClaim(claim)}
                    className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md"
                   
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  {['Ready for Approval', 'Under Investigation'].includes(claim.status) && (
                    <>
                      <button
                        onClick={() => {
                          setSelectedClaim(claim);
                          setApprovalAction('approve');
                        }}
                        className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-md"
                       
                      >
                        <ThumbsUp className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedClaim(claim);
                          setApprovalAction('reject');
                        }}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md"
                       
                      >
                        <ThumbsDown className="h-4 w-4" />
                      </button>
                    </>
                  )}
                  <button
                    className="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-md"
                   
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Claim Details Modal */}
      {selectedClaim && !approvalAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 z-50">
          <div className="bg-white rounded-lg shadow-xl  w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-3 py-2 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Claim Details - {selectedClaim.claimNumber}</h2>
              <button
                onClick={() => setSelectedClaim(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-3">
              {/* Status & Priority */}
              <div className="flex items-center gap-3">
                <span className={`px-3 py-2 text-sm font-medium rounded-full ${getStatusColor(selectedClaim.status)}`}>
                  {selectedClaim.status}
                </span>
                <span className={`px-3 py-2 text-sm font-medium rounded-full border ${getPriorityColor(selectedClaim.priority)}`}>
                  {selectedClaim.priority} Priority
                </span>
                <div className="flex items-center gap-1">
                  <Star className={`h-5 w-5 ${getUrgencyColor(selectedClaim.urgencyScore)}`} />
                  <span className={`text-sm font-medium ${getUrgencyColor(selectedClaim.urgencyScore)}`}>
                    Urgency: {selectedClaim.urgencyScore}/10
                  </span>
                </div>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Customer Information</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Name:</strong> {selectedClaim.customer.name}</div>
                    <div><strong>Phone:</strong> {selectedClaim.customer.phone}</div>
                    <div><strong>Email:</strong> {selectedClaim.customer.email}</div>
                    <div><strong>Customer ID:</strong> {selectedClaim.customer.customerId}</div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Equipment Details</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Model:</strong> {selectedClaim.equipment.model}</div>
                    <div><strong>Serial Number:</strong> {selectedClaim.equipment.serialNumber}</div>
                    <div><strong>Category:</strong> {selectedClaim.equipment.category}</div>
                    <div><strong>Installation:</strong> {selectedClaim.equipment.installationDate}</div>
                  </div>
                </div>
              </div>

              {/* Issue Details */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Issue Details</h3>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                    <div><strong>Fault Category:</strong> {selectedClaim.claimDetails.faultCategory}</div>
                    <div><strong>Reported Date:</strong> {selectedClaim.claimDetails.reportedDate}</div>
                  </div>
                  <p className="text-gray-700">{selectedClaim.claimDetails.issueDescription}</p>
                </div>
              </div>

              {/* Financial Details */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Financial Breakdown</h3>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center">
                    <div>
                      <div className="text-2xl font-bold text-purple-600">₹{selectedClaim.claimDetails.claimedAmount.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">Claimed Amount</div>
                    </div>
                    {selectedClaim.claimDetails.estimatedAmount && (
                      <div>
                        <div className="text-2xl font-bold text-blue-600">₹{selectedClaim.claimDetails.estimatedAmount.toLocaleString()}</div>
                        <div className="text-sm text-gray-500">Estimated Amount</div>
                      </div>
                    )}
                    {selectedClaim.claimDetails.partsCost && (
                      <div>
                        <div className="text-2xl font-bold text-green-600">₹{selectedClaim.claimDetails.partsCost.toLocaleString()}</div>
                        <div className="text-sm text-gray-500">Parts Cost</div>
                      </div>
                    )}
                    {selectedClaim.claimDetails.laborCost && (
                      <div>
                        <div className="text-2xl font-bold text-orange-600">₹{selectedClaim.claimDetails.laborCost.toLocaleString()}</div>
                        <div className="text-sm text-gray-500">Labor Cost</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Technician Assessment */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Technician Assessment</h3>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <strong>{selectedClaim.technician.name}</strong> ({selectedClaim.technician.id})
                    </div>
                    <div className="text-sm text-gray-600">Visit Date: {selectedClaim.technician.visitDate}</div>
                  </div>
                  <p className="text-gray-700 mb-2">{selectedClaim.technician.assessment}</p>
                  <div className="flex items-center gap-2">
                    <strong>Recommendation:</strong>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      selectedClaim.technician.recommendation === 'Approve' ? 'bg-green-100 text-green-700' :
                      selectedClaim.technician.recommendation === 'Reject' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {selectedClaim.technician.recommendation}
                    </span>
                  </div>
                </div>
              </div>

              {/* Documentation Status */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Documentation</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{selectedClaim.documentation.photos}</div>
                    <div className="text-sm text-gray-500">Photos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{selectedClaim.documentation.videos}</div>
                    <div className="text-sm text-gray-500">Videos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{selectedClaim.documentation.reports}</div>
                    <div className="text-sm text-gray-500">Reports</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{selectedClaim.documentation.invoices}</div>
                    <div className="text-sm text-gray-500">Invoices</div>
                  </div>
                </div>
                {!selectedClaim.documentation.isComplete && selectedClaim.documentation.missingDocs && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="font-medium text-yellow-800 mb-2">Missing Documentation:</h4>
                    <ul className="list-disc list-inside text-sm text-yellow-700">
                      {selectedClaim.documentation.missingDocs.map((doc, index) => (
                        <li key={index}>{doc}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Warranty Information */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Warranty Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div>
                    <div><strong>Warranty Number:</strong> {selectedClaim.warrantyNumber}</div>
                    <div><strong>Type:</strong> {selectedClaim.warrantyType}</div>
                    <div><strong>Coverage:</strong> {selectedClaim.warranty.coverage}</div>
                  </div>
                  <div>
                    <div><strong>Start Date:</strong> {selectedClaim.warranty.startDate}</div>
                    <div><strong>End Date:</strong> {selectedClaim.warranty.endDate}</div>
                    <div><strong>Previous Claims:</strong> {selectedClaim.warranty.previousClaims}</div>
                  </div>
                </div>
              </div>

              {/* Risk Factors */}
              {selectedClaim.riskFactors.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Risk Factors</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedClaim.riskFactors.map((risk, index) => (
                      <span key={index} className="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 border border-yellow-300 rounded-full">
                        {risk}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                {['Ready for Approval', 'Under Investigation'].includes(selectedClaim.status) && (
                  <>
                    <button
                      onClick={() => setApprovalAction('approve')}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      Approve Claim
                    </button>
                    <button
                      onClick={() => setApprovalAction('reject')}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      Reject Claim
                    </button>
                  </>
                )}
                <button
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Download Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approval Action Modal */}
      {selectedClaim && approvalAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-3 py-2 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {approvalAction === 'approve' ? 'Approve Claim' : 'Reject Claim'}
              </h2>
            </div>

            <div className="p-6 space-y-2">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm"><strong>Claim:</strong> {selectedClaim.claimNumber}</div>
                <div className="text-sm"><strong>Customer:</strong> {selectedClaim.customer.name}</div>
                <div className="text-sm"><strong>Amount:</strong> ₹{selectedClaim.claimDetails.claimedAmount.toLocaleString()}</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {approvalAction === 'approve' ? 'Approval Notes' : 'Rejection Reason'}
                </label>
                <textarea
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder={approvalAction === 'approve' ? 'Add approval notes...' : 'Specify reason for rejection...'}
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleApprovalAction(approvalAction)}
                  className={`flex-1 px-4 py-2 rounded-md text-white ${
                    approvalAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  Confirm {approvalAction === 'approve' ? 'Approval' : 'Rejection'}
                </button>
                <button
                  onClick={() => setApprovalAction(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClaimsApprovalsPage;