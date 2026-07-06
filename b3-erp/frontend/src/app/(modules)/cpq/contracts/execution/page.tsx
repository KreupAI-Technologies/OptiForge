'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { cpqContractService } from '@/services/cpq/cpq-contract.service'
import {
  FileCheck,
  Search,
  Filter,
  Download,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  Calendar,
  DollarSign,
  Package,
  RefreshCw,
  Eye,
  Mail
} from 'lucide-react'

interface ExecutedContract {
  id: string
  contractNumber: string
  contractType: string
  customerName: string
  customerContact: string
  customerEmail: string
  contractValue: number
  signedDate: string
  startDate: string
  endDate: string
  status: 'active' | 'completed' | 'expiring' | 'expired' | 'cancelled'
  executionStatus: 'on-track' | 'delayed' | 'at-risk' | 'completed'
  paymentStatus: 'paid' | 'partial' | 'pending' | 'overdue'
  deliveryStatus: 'scheduled' | 'in-progress' | 'delivered' | 'installed' | 'delayed'
  warrantyEndDate: string
  supportLevel: string
  milestones: Milestone[]
  payments: Payment[]
  renewalEligible: boolean
}

interface Milestone {
  id: string
  name: string
  percentage: number
  dueDate: string
  status: 'completed' | 'in-progress' | 'pending' | 'delayed'
  completedDate?: string
}

interface Payment {
  id: string
  description: string
  amount: number
  dueDate: string
  paidDate?: string
  status: 'paid' | 'pending' | 'overdue'
}

export default function CPQContractsExecutionPage() {
  const router = useRouter()

  const [contracts, setContracts] = useState<ExecutedContract[]>([])

  useEffect(() => {
    const load = async () => {
      const data = await cpqContractService.findAllContracts({ status: 'active' as any })
      const list = Array.isArray(data) ? data : []
      const mapped: ExecutedContract[] = list.map((c: any) => ({
        id: c?.id ?? '',
        contractNumber: c?.contractNumber ?? '',
        contractType: c?.title ?? c?.contractType ?? '',
        customerName: c?.customerName ?? '',
        customerContact: '',
        customerEmail: '',
        contractValue: c?.totalValue ?? c?.value ?? 0,
        signedDate: c?.executedAt ?? c?.createdAt ?? '',
        startDate: c?.startDate ?? '',
        endDate: c?.endDate ?? '',
        status: (c?.status ?? 'active') as any,
        executionStatus: 'on-track' as any,
        paymentStatus: 'pending' as any,
        deliveryStatus: 'scheduled' as any,
        warrantyEndDate: c?.endDate ?? '',
        supportLevel: c?.supportLevel ?? '',
        renewalEligible: Boolean(c?.autoRenew),
        milestones: Array.isArray(c?.milestones) ? c.milestones : [],
        payments: Array.isArray(c?.paymentSchedule)
          ? c.paymentSchedule.map((p: any, i: number) => ({
              id: `PAY-${i}`,
              description: p?.description ?? '',
              amount: p?.amount ?? 0,
              dueDate: p?.dueDate ?? '',
              status: 'pending' as any,
            }))
          : (Array.isArray(c?.payments) ? c.payments : []),
      }))
      setContracts(mapped)
    }
    load()
  }, [])

  const _mockContracts: ExecutedContract[] = [
    {
      id: 'EXEC-001',
      contractNumber: 'CONT-2024-1234',
      contractType: 'Premium Service Agreement',
      customerName: 'Prestige Properties Ltd',
      customerContact: 'Mr. Arun Sharma',
      customerEmail: 'arun.sharma@prestigeproperties.com',
      contractValue: 4500000,
      signedDate: '2024-09-15',
      startDate: '2024-10-01',
      endDate: '2025-09-30',
      status: 'active',
      executionStatus: 'on-track',
      paymentStatus: 'partial',
      deliveryStatus: 'in-progress',
      warrantyEndDate: '2028-09-30',
      supportLevel: 'Premium',
      renewalEligible: true,
      milestones: [
        {
          id: 'MS-001',
          name: 'Advance Payment',
          percentage: 50,
          dueDate: '2024-09-20',
          status: 'completed',
          completedDate: '2024-09-18'
        },
        {
          id: 'MS-002',
          name: 'Delivery',
          percentage: 40,
          dueDate: '2024-10-15',
          status: 'in-progress'
        },
        {
          id: 'MS-003',
          name: 'Installation',
          percentage: 10,
          dueDate: '2024-10-25',
          status: 'pending'
        }
      ],
      payments: [
        {
          id: 'PAY-001',
          description: 'Advance Payment (50%)',
          amount: 2250000,
          dueDate: '2024-09-20',
          paidDate: '2024-09-18',
          status: 'paid'
        },
        {
          id: 'PAY-002',
          description: 'On Delivery (40%)',
          amount: 1800000,
          dueDate: '2024-10-15',
          status: 'pending'
        },
        {
          id: 'PAY-003',
          description: 'On Installation (10%)',
          amount: 450000,
          dueDate: '2024-10-25',
          status: 'pending'
        }
      ]
    },
    {
      id: 'EXEC-002',
      contractNumber: 'CONT-2024-1228',
      contractType: 'Standard Sales Contract',
      customerName: 'Urban Homes Pvt Ltd',
      customerContact: 'Ms. Priya Verma',
      customerEmail: 'priya.verma@urbanhomes.in',
      contractValue: 2850000,
      signedDate: '2024-08-20',
      startDate: '2024-09-01',
      endDate: '2024-11-30',
      status: 'active',
      executionStatus: 'delayed',
      paymentStatus: 'paid',
      deliveryStatus: 'delayed',
      warrantyEndDate: '2027-11-30',
      supportLevel: 'Standard',
      renewalEligible: false,
      milestones: [
        {
          id: 'MS-004',
          name: 'Advance Payment',
          percentage: 50,
          dueDate: '2024-08-25',
          status: 'completed',
          completedDate: '2024-08-23'
        },
        {
          id: 'MS-005',
          name: 'Delivery',
          percentage: 40,
          dueDate: '2024-09-25',
          status: 'delayed'
        },
        {
          id: 'MS-006',
          name: 'Installation',
          percentage: 10,
          dueDate: '2024-10-05',
          status: 'pending'
        }
      ],
      payments: [
        {
          id: 'PAY-004',
          description: 'Advance Payment (50%)',
          amount: 1425000,
          dueDate: '2024-08-25',
          paidDate: '2024-08-23',
          status: 'paid'
        },
        {
          id: 'PAY-005',
          description: 'On Delivery (40%)',
          amount: 1140000,
          dueDate: '2024-09-25',
          paidDate: '2024-09-26',
          status: 'paid'
        },
        {
          id: 'PAY-006',
          description: 'On Installation (10%)',
          amount: 285000,
          dueDate: '2024-10-05',
          paidDate: '2024-10-06',
          status: 'paid'
        }
      ]
    },
    {
      id: 'EXEC-003',
      contractNumber: 'CONT-2024-1215',
      contractType: 'Bulk Order Contract',
      customerName: 'Metro Builders Ltd',
      customerContact: 'Mr. Rajesh Kapoor',
      customerEmail: 'rajesh.kapoor@metrobuilders.com',
      contractValue: 8200000,
      signedDate: '2024-07-10',
      startDate: '2024-07-20',
      endDate: '2024-12-31',
      status: 'active',
      executionStatus: 'on-track',
      paymentStatus: 'partial',
      deliveryStatus: 'in-progress',
      warrantyEndDate: '2027-12-31',
      supportLevel: 'Premium',
      renewalEligible: true,
      milestones: [
        {
          id: 'MS-007',
          name: 'Advance Payment',
          percentage: 40,
          dueDate: '2024-07-15',
          status: 'completed',
          completedDate: '2024-07-14'
        },
        {
          id: 'MS-008',
          name: 'Phase 1 Delivery',
          percentage: 30,
          dueDate: '2024-09-30',
          status: 'completed',
          completedDate: '2024-09-28'
        },
        {
          id: 'MS-009',
          name: 'Phase 2 Delivery',
          percentage: 20,
          dueDate: '2024-11-15',
          status: 'in-progress'
        },
        {
          id: 'MS-010',
          name: 'Final Installation',
          percentage: 10,
          dueDate: '2024-12-15',
          status: 'pending'
        }
      ],
      payments: [
        {
          id: 'PAY-007',
          description: 'Advance (40%)',
          amount: 3280000,
          dueDate: '2024-07-15',
          paidDate: '2024-07-14',
          status: 'paid'
        },
        {
          id: 'PAY-008',
          description: 'Phase 1 Delivery (30%)',
          amount: 2460000,
          dueDate: '2024-10-05',
          paidDate: '2024-10-03',
          status: 'paid'
        },
        {
          id: 'PAY-009',
          description: 'Phase 2 Delivery (20%)',
          amount: 1640000,
          dueDate: '2024-11-20',
          status: 'pending'
        },
        {
          id: 'PAY-010',
          description: 'Final Installation (10%)',
          amount: 820000,
          dueDate: '2024-12-20',
          status: 'pending'
        }
      ]
    },
    {
      id: 'EXEC-004',
      contractNumber: 'CONT-2024-1198',
      contractType: 'Service Agreement',
      customerName: 'Royal Residences',
      customerContact: 'Ms. Anjali Mehta',
      customerEmail: 'anjali.mehta@royalresidences.in',
      contractValue: 1250000,
      signedDate: '2024-03-15',
      startDate: '2024-04-01',
      endDate: '2024-09-30',
      status: 'completed',
      executionStatus: 'completed',
      paymentStatus: 'paid',
      deliveryStatus: 'installed',
      warrantyEndDate: '2027-09-30',
      supportLevel: 'Basic',
      renewalEligible: true,
      milestones: [
        {
          id: 'MS-011',
          name: 'Advance Payment',
          percentage: 50,
          dueDate: '2024-03-20',
          status: 'completed',
          completedDate: '2024-03-18'
        },
        {
          id: 'MS-012',
          name: 'Delivery',
          percentage: 40,
          dueDate: '2024-05-15',
          status: 'completed',
          completedDate: '2024-05-12'
        },
        {
          id: 'MS-013',
          name: 'Installation',
          percentage: 10,
          dueDate: '2024-05-25',
          status: 'completed',
          completedDate: '2024-05-23'
        }
      ],
      payments: [
        {
          id: 'PAY-011',
          description: 'Advance Payment (50%)',
          amount: 625000,
          dueDate: '2024-03-20',
          paidDate: '2024-03-18',
          status: 'paid'
        },
        {
          id: 'PAY-012',
          description: 'On Delivery (40%)',
          amount: 500000,
          dueDate: '2024-05-20',
          paidDate: '2024-05-18',
          status: 'paid'
        },
        {
          id: 'PAY-013',
          description: 'On Installation (10%)',
          amount: 125000,
          dueDate: '2024-05-30',
          paidDate: '2024-05-28',
          status: 'paid'
        }
      ]
    },
    {
      id: 'EXEC-005',
      contractNumber: 'CONT-2023-1876',
      contractType: 'Standard Sales Contract',
      customerName: 'Green Valley Apartments',
      customerContact: 'Mr. Suresh Reddy',
      customerEmail: 'suresh.reddy@greenvalley.com',
      contractValue: 3200000,
      signedDate: '2023-09-10',
      startDate: '2023-10-01',
      endDate: '2024-09-30',
      status: 'expiring',
      executionStatus: 'completed',
      paymentStatus: 'paid',
      deliveryStatus: 'installed',
      warrantyEndDate: '2027-09-30',
      supportLevel: 'Standard',
      renewalEligible: true,
      milestones: [
        {
          id: 'MS-014',
          name: 'Advance Payment',
          percentage: 50,
          dueDate: '2023-09-15',
          status: 'completed',
          completedDate: '2023-09-12'
        },
        {
          id: 'MS-015',
          name: 'Delivery',
          percentage: 40,
          dueDate: '2023-11-01',
          status: 'completed',
          completedDate: '2023-10-28'
        },
        {
          id: 'MS-016',
          name: 'Installation',
          percentage: 10,
          dueDate: '2023-11-15',
          status: 'completed',
          completedDate: '2023-11-12'
        }
      ],
      payments: [
        {
          id: 'PAY-014',
          description: 'Advance Payment (50%)',
          amount: 1600000,
          dueDate: '2023-09-15',
          paidDate: '2023-09-12',
          status: 'paid'
        },
        {
          id: 'PAY-015',
          description: 'On Delivery (40%)',
          amount: 1280000,
          dueDate: '2023-11-05',
          paidDate: '2023-11-03',
          status: 'paid'
        },
        {
          id: 'PAY-016',
          description: 'On Installation (10%)',
          amount: 320000,
          dueDate: '2023-11-20',
          paidDate: '2023-11-18',
          status: 'paid'
        }
      ]
    }
  ]
  void _mockContracts

  const getStatusColor = (status: string) => {
    const colors: any = {
      active: 'bg-green-100 text-green-700 border-green-200',
      completed: 'bg-blue-100 text-blue-700 border-blue-200',
      expiring: 'bg-orange-100 text-orange-700 border-orange-200',
      expired: 'bg-red-100 text-red-700 border-red-200',
      cancelled: 'bg-gray-100 text-gray-700 border-gray-200'
    }
    return colors[status] || colors.active
  }

  const getExecutionColor = (status: string) => {
    const colors: any = {
      'on-track': 'bg-green-100 text-green-700 border-green-200',
      delayed: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'at-risk': 'bg-orange-100 text-orange-700 border-orange-200',
      completed: 'bg-blue-100 text-blue-700 border-blue-200'
    }
    return colors[status] || colors['on-track']
  }

  const getPaymentColor = (status: string) => {
    const colors: any = {
      paid: 'bg-green-100 text-green-700 border-green-200',
      partial: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      pending: 'bg-orange-100 text-orange-700 border-orange-200',
      overdue: 'bg-red-100 text-red-700 border-red-200'
    }
    return colors[status] || colors.pending
  }

  const getDeliveryColor = (status: string) => {
    const colors: any = {
      scheduled: 'bg-blue-100 text-blue-700 border-blue-200',
      'in-progress': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      delivered: 'bg-green-100 text-green-700 border-green-200',
      installed: 'bg-purple-100 text-purple-700 border-purple-200',
      delayed: 'bg-red-100 text-red-700 border-red-200'
    }
    return colors[status] || colors.scheduled
  }

  const getMilestoneIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'in-progress':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'delayed':
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const totalContracts = contracts.length
  const activeContracts = contracts.filter(c => c.status === 'active').length
  const expiringContracts = contracts.filter(c => c.status === 'expiring').length
  const totalValue = contracts.filter(c => c.status === 'active' || c.status === 'expiring').reduce((sum, c) => sum + c.contractValue, 0)
  const renewableContracts = contracts.filter(c => c.renewalEligible).length

  return (
    <div className="w-full h-full px-4 py-2">
      {/* Action Buttons */}
      <div className="mb-3 flex justify-end">
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </button>
          <button className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-5 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Contracts</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{totalContracts}</p>
            </div>
            <FileCheck className="h-10 w-10 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-5 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Active</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{activeContracts}</p>
            </div>
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-5 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Expiring Soon</p>
              <p className="text-2xl font-bold text-orange-900 mt-1">{expiringContracts}</p>
            </div>
            <AlertTriangle className="h-10 w-10 text-orange-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-5 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Total Value</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">₹{(totalValue / 10000000).toFixed(2)}Cr</p>
            </div>
            <DollarSign className="h-10 w-10 text-purple-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-5 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">Renewable</p>
              <p className="text-2xl font-bold text-yellow-900 mt-1">{renewableContracts}</p>
            </div>
            <RefreshCw className="h-10 w-10 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Status Filters */}
      <div className="mb-3 flex gap-3 overflow-x-auto pb-2">
        <button className="px-4 py-2 bg-blue-100 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-200 text-sm font-medium whitespace-nowrap">
          All Contracts ({totalContracts})
        </button>
        <button className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm whitespace-nowrap">
          Active ({activeContracts})
        </button>
        <button className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm whitespace-nowrap">
          Expiring ({expiringContracts})
        </button>
        <button className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm whitespace-nowrap">
          Completed ({contracts.filter(c => c.status === 'completed').length})
        </button>
        <button className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm whitespace-nowrap">
          Renewable ({renewableContracts})
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by contract number, customer, or type..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Executed Contracts */}
      <div className="space-y-2">
        {contracts.map((contract) => (
          <div
            key={contract.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-5"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base font-semibold text-gray-900">{contract.contractType}</h3>
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${getStatusColor(contract.status)}`}>
                    {contract.status}
                  </span>
                  {contract.renewalEligible && (
                    <span className="px-2 py-0.5 text-xs font-semibold rounded-full border bg-purple-100 text-purple-700 border-purple-200">
                      Renewable
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500">{contract.contractNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-blue-600">₹{(contract.contractValue / 100000).toFixed(2)}L</p>
                <p className="text-xs text-gray-500">Contract Value</p>
              </div>
            </div>

            {/* Customer & Contract Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2 text-xs">
              <div>
                <p className="text-gray-500">Customer</p>
                <p className="font-semibold text-gray-900">{contract.customerName}</p>
                <p className="text-gray-600">{contract.customerContact}</p>
              </div>
              <div>
                <p className="text-gray-500">Contract Period</p>
                <p className="font-semibold text-gray-900">
                  {new Date(contract.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
                <p className="text-gray-600">to {new Date(contract.endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
              </div>
              <div>
                <p className="text-gray-500">Warranty Until</p>
                <p className="font-semibold text-gray-900">
                  {new Date(contract.warrantyEndDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Support Level</p>
                <p className="font-semibold text-gray-900">{contract.supportLevel}</p>
              </div>
            </div>

            {/* Status Indicators */}
            <div className="flex gap-3 mb-2">
              <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getExecutionColor(contract.executionStatus)}`}>
                Execution: {contract.executionStatus}
              </span>
              <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getPaymentColor(contract.paymentStatus)}`}>
                Payment: {contract.paymentStatus}
              </span>
              <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getDeliveryColor(contract.deliveryStatus)}`}>
                Delivery: {contract.deliveryStatus}
              </span>
            </div>

            {/* Milestones */}
            <div className="mb-2">
              <p className="text-xs font-semibold text-gray-700 mb-2">Milestones:</p>
              <div className="space-y-2">
                {contract.milestones.map((milestone) => (
                  <div key={milestone.id} className="flex items-center gap-3 text-xs">
                    <div className="flex-shrink-0">
                      {getMilestoneIcon(milestone.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">{milestone.name}</span>
                          <span className="text-gray-500">({milestone.percentage}%)</span>
                        </div>
                        <span className={`px-2 py-0.5 text-xs rounded border ${
                          milestone.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' :
                          milestone.status === 'in-progress' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                          milestone.status === 'delayed' ? 'bg-red-50 text-red-700 border-red-200' :
                          'bg-gray-50 text-gray-500 border-gray-200'
                        }`}>
                          {milestone.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-gray-600">
                        <Calendar className="h-3 w-3" />
                        <span>Due: {new Date(milestone.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                        {milestone.completedDate && (
                          <span className="text-green-600">
                            • Completed: {new Date(milestone.completedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Schedule */}
            <div className="mb-2">
              <p className="text-xs font-semibold text-gray-700 mb-2">Payment Schedule:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {contract.payments.map((payment) => (
                  <div key={payment.id} className="bg-gray-50 rounded p-2 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-gray-900">{payment.description}</span>
                      <span className={`px-2 py-0.5 text-xs rounded border ${getPaymentColor(payment.status)}`}>
                        {payment.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-gray-600">
                      <span>₹{(payment.amount / 100000).toFixed(2)}L</span>
                      <span>Due: {new Date(payment.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                    </div>
                    {payment.paidDate && (
                      <div className="text-green-600 mt-0.5">
                        Paid: {new Date(payment.paidDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button className="px-3 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-1">
                <Eye className="h-4 w-4" />
                View Contract
              </button>
              {contract.renewalEligible && (
                <button className="px-3 py-2 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700 flex items-center gap-1">
                  <RefreshCw className="h-4 w-4" />
                  Renew
                </button>
              )}
              <button className="px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-1">
                <Mail className="h-4 w-4" />
                Contact Customer
              </button>
              <button className="px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-1">
                <Download className="h-4 w-4" />
                Download
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Contract Execution Info */}
      <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-green-900 mb-2">Contract Execution Tracking:</h3>
        <ul className="text-xs text-green-700 space-y-1">
          <li><strong>Real-time Tracking:</strong> Monitor contract execution status, milestones, and deliveries</li>
          <li><strong>Payment Monitoring:</strong> Track payment schedules and identify overdue payments</li>
          <li><strong>Renewal Management:</strong> Proactive alerts for expiring contracts to retain customers</li>
          <li><strong>Warranty Tracking:</strong> Monitor warranty periods and support obligations</li>
          <li><strong>Performance Analytics:</strong> Track on-time delivery, payment collection, and customer satisfaction</li>
        </ul>
      </div>
    </div>
  )
}
