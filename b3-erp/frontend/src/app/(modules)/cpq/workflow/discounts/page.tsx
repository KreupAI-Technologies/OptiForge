'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cpqWorkflowRequestService } from '@/services/cpq/cpq-orphans.service'
import {
  Percent,
  Search,
  Filter,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  TrendingDown,
  DollarSign,
  User,
  MessageSquare,
  Eye
} from 'lucide-react'
import {
  ApproveDiscountModal,
  RejectDiscountModal,
  AddDiscountCommentModal,
  ViewQuoteModal,
  DiscountRequest
} from '@/components/cpq/DiscountWorkflowModals'

export default function CPQWorkflowDiscountsPage() {
  const router = useRouter()

  // Modal states
  const [isApproveOpen, setIsApproveOpen] = useState(false)
  const [isRejectOpen, setIsRejectOpen] = useState(false)
  const [isCommentOpen, setIsCommentOpen] = useState(false)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [selectedDiscount, setSelectedDiscount] = useState<DiscountRequest | null>(null)

  const [discounts, setDiscounts] = useState<DiscountRequest[]>([
    {
      id: 'DISC-001',
      quoteNumber: 'QT-2024-1234',
      customerName: 'Prestige Properties Ltd',
      customerType: 'strategic',
      industry: 'Real Estate',
      originalValue: 2850000,
      discountPercentage: 18,
      discountAmount: 513000,
      finalValue: 2337000,
      requestedBy: 'Neha Singh',
      requestDate: '2024-10-18 09:15 AM',
      reason: 'Bulk order discount',
      justification: 'Customer ordering 25+ kitchens for builder project. Competitor quote is ₹2.4L per unit. Need to match pricing to win deal.',
      currentApprover: 'Finance Head',
      status: 'pending',
      priority: 'urgent',
      productCategory: 'Modular Kitchens',
      quantity: 25,
      competitorPrice: 2400000,
      marginAfterDiscount: 22.5,
      approvalChain: [
        {
          level: 1,
          approver: 'Priya Sharma',
          role: 'Sales Manager',
          status: 'approved',
          actionDate: '2024-10-18 10:20 AM',
          comments: 'Customer is repeat buyer, discount justified for volume'
        },
        {
          level: 2,
          approver: 'Amit Patel',
          role: 'Finance Head',
          status: 'pending'
        },
        {
          level: 3,
          approver: 'Sunita Reddy',
          role: 'VP Sales',
          status: 'pending'
        }
      ],
      comments: [
        {
          id: 'CMT-001',
          author: 'Neha Singh',
          message: 'Competitor is offering ₹2.4L per unit. Customer has given us last chance to match.',
          timestamp: '2024-10-18 09:20 AM'
        },
        {
          id: 'CMT-002',
          author: 'Priya Sharma',
          message: 'This is a strategic account. Customer has done 3 projects worth ₹12Cr with us.',
          timestamp: '2024-10-18 10:20 AM'
        }
      ]
    },
    {
      id: 'DISC-002',
      quoteNumber: 'QT-2024-1189',
      customerName: 'Urban Homes Pvt Ltd',
      customerType: 'repeat',
      industry: 'Real Estate',
      originalValue: 3200000,
      discountPercentage: 12,
      discountAmount: 384000,
      finalValue: 2816000,
      requestedBy: 'Rahul Kumar',
      requestDate: '2024-10-17 02:30 PM',
      reason: 'Early payment discount',
      justification: 'Customer willing to pay 80% advance instead of standard 50%. Requesting discount for improved cash flow.',
      currentApprover: 'Finance Head',
      status: 'pending',
      priority: 'medium',
      productCategory: 'Premium Kitchens',
      quantity: 12,
      marginAfterDiscount: 28.3,
      approvalChain: [
        {
          level: 1,
          approver: 'Priya Sharma',
          role: 'Sales Manager',
          status: 'approved',
          actionDate: '2024-10-17 03:45 PM',
          comments: 'Good customer, payment history excellent'
        },
        {
          level: 2,
          approver: 'Amit Patel',
          role: 'Finance Head',
          status: 'pending'
        }
      ],
      comments: [
        {
          id: 'CMT-003',
          author: 'Rahul Kumar',
          message: 'Customer offering 80% advance payment. This will help our cash flow significantly.',
          timestamp: '2024-10-17 02:35 PM'
        }
      ]
    },
    {
      id: 'DISC-003',
      quoteNumber: 'QT-2024-1156',
      customerName: 'Coastal Builders',
      customerType: 'new',
      industry: 'Construction',
      originalValue: 6400000,
      discountPercentage: 22,
      discountAmount: 1408000,
      finalValue: 4992000,
      requestedBy: 'Suresh Rao',
      requestDate: '2024-10-16 11:00 AM',
      reason: 'New customer acquisition',
      justification: 'First-time customer with large project (50+ units). Willing to sign 3-year partnership agreement if we match competitor pricing.',
      currentApprover: 'VP Sales',
      status: 'pending',
      priority: 'high',
      productCategory: 'Standard Kitchens',
      quantity: 52,
      competitorPrice: 5100000,
      marginAfterDiscount: 18.5,
      approvalChain: [
        {
          level: 1,
          approver: 'Priya Sharma',
          role: 'Sales Manager',
          status: 'approved',
          actionDate: '2024-10-16 12:30 PM',
          comments: 'Large opportunity, customer has 200+ unit pipeline'
        },
        {
          level: 2,
          approver: 'Amit Patel',
          role: 'Finance Head',
          status: 'approved',
          actionDate: '2024-10-16 03:15 PM',
          comments: 'Margins acceptable for volume and future potential'
        },
        {
          level: 3,
          approver: 'Sunita Reddy',
          role: 'VP Sales',
          status: 'pending'
        }
      ],
      comments: [
        {
          id: 'CMT-004',
          author: 'Suresh Rao',
          message: 'Customer has 3 more projects in pipeline worth ₹2Cr+ each. This could be a strategic partnership.',
          timestamp: '2024-10-16 11:05 AM'
        },
        {
          id: 'CMT-005',
          author: 'Amit Patel',
          message: 'Approved. Future potential justifies the discount. Ensure partnership agreement is signed.',
          timestamp: '2024-10-16 03:15 PM'
        }
      ]
    },
    {
      id: 'DISC-004',
      quoteNumber: 'QT-2024-1098',
      customerName: 'Royal Residences',
      customerType: 'vip',
      industry: 'Hospitality',
      originalValue: 1250000,
      discountPercentage: 8,
      discountAmount: 100000,
      finalValue: 1150000,
      requestedBy: 'Anjali Mehta',
      requestDate: '2024-10-15 10:00 AM',
      reason: 'VIP customer discount',
      justification: 'Long-term customer with 10+ years relationship. Completed 15 projects worth ₹8Cr total.',
      currentApprover: 'None',
      status: 'approved',
      priority: 'low',
      productCategory: 'Service Agreement',
      quantity: 1,
      marginAfterDiscount: 32.8,
      approvalChain: [
        {
          level: 1,
          approver: 'Priya Sharma',
          role: 'Sales Manager',
          status: 'approved',
          actionDate: '2024-10-15 11:30 AM',
          comments: 'Standard discount for VIP customer, within approved limits'
        }
      ],
      comments: []
    },
    {
      id: 'DISC-005',
      quoteNumber: 'QT-2024-1045',
      customerName: 'Luxury Apartments Ltd',
      customerType: 'new',
      industry: 'Real Estate',
      originalValue: 3800000,
      discountPercentage: 15,
      discountAmount: 570000,
      finalValue: 3230000,
      requestedBy: 'Karan Malhotra',
      requestDate: '2024-10-14 03:30 PM',
      reason: 'Price matching request',
      justification: 'Customer claims competitor offering 18% discount. Requesting 15% to stay competitive.',
      currentApprover: 'None',
      status: 'rejected',
      priority: 'medium',
      productCategory: 'Premium Kitchens',
      quantity: 15,
      competitorPrice: 3116000,
      marginAfterDiscount: 16.2,
      approvalChain: [
        {
          level: 1,
          approver: 'Priya Sharma',
          role: 'Sales Manager',
          status: 'rejected',
          actionDate: '2024-10-14 05:15 PM',
          comments: 'Margins too thin. Customer credit check shows payment delays. Risk not justified.'
        }
      ],
      comments: [
        {
          id: 'CMT-006',
          author: 'Karan Malhotra',
          message: 'Customer is price sensitive. Need discount to close the deal.',
          timestamp: '2024-10-14 03:35 PM'
        },
        {
          id: 'CMT-007',
          author: 'Priya Sharma',
          message: 'Rejected. Credit check shows customer has payment delays with 2 suppliers. Too risky at these margins.',
          timestamp: '2024-10-14 05:15 PM'
        }
      ]
    },
    {
      id: 'DISC-006',
      quoteNumber: 'QT-2024-1267',
      customerName: 'Metro Builders Ltd',
      customerType: 'strategic',
      industry: 'Construction',
      originalValue: 5600000,
      discountPercentage: 20,
      discountAmount: 1120000,
      finalValue: 4480000,
      requestedBy: 'Vikram Desai',
      requestDate: '2024-10-18 01:00 PM',
      reason: 'Strategic partnership discount',
      justification: 'Customer signing exclusive 2-year contract for all their kitchen requirements (projected ₹15Cr revenue).',
      currentApprover: 'Sales Manager',
      status: 'pending',
      priority: 'high',
      productCategory: 'Bulk Order',
      quantity: 45,
      marginAfterDiscount: 20.5,
      approvalChain: [
        {
          level: 1,
          approver: 'Priya Sharma',
          role: 'Sales Manager',
          status: 'pending'
        },
        {
          level: 2,
          approver: 'Amit Patel',
          role: 'Finance Head',
          status: 'pending'
        },
        {
          level: 3,
          approver: 'Sunita Reddy',
          role: 'VP Sales',
          status: 'pending'
        }
      ],
      comments: [
        {
          id: 'CMT-008',
          author: 'Vikram Desai',
          message: 'This is exclusive partnership with volume commitment. Customer guarantees ₹15Cr over 2 years.',
          timestamp: '2024-10-18 01:05 PM'
        }
      ]
    }
  ])

  const getCustomerTypeColor = (type: string) => {
    const colors: any = {
      new: 'bg-blue-100 text-blue-700 border-blue-200',
      repeat: 'bg-green-100 text-green-700 border-green-200',
      vip: 'bg-purple-100 text-purple-700 border-purple-200',
      strategic: 'bg-orange-100 text-orange-700 border-orange-200'
    }
    return colors[type] || colors.new
  }

  const getStatusColor = (status: string) => {
    const colors: any = {
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      approved: 'bg-green-100 text-green-700 border-green-200',
      rejected: 'bg-red-100 text-red-700 border-red-200',
      expired: 'bg-gray-100 text-gray-700 border-gray-200'
    }
    return colors[status] || colors.pending
  }

  const getPriorityColor = (priority: string) => {
    const colors: any = {
      low: 'bg-blue-100 text-blue-700 border-blue-200',
      medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      high: 'bg-orange-100 text-orange-700 border-orange-200',
      urgent: 'bg-red-100 text-red-700 border-red-200'
    }
    return colors[priority] || colors.medium
  }

  const getMarginColor = (margin: number) => {
    if (margin >= 30) return 'text-green-600'
    if (margin >= 20) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getStepStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  // Modal handlers
  const handleApprove = (discount: DiscountRequest) => {
    setSelectedDiscount(discount)
    setIsApproveOpen(true)
  }

  const handleReject = (discount: DiscountRequest) => {
    setSelectedDiscount(discount)
    setIsRejectOpen(true)
  }

  const handleAddComment = (discount: DiscountRequest) => {
    setSelectedDiscount(discount)
    setIsCommentOpen(true)
  }

  const handleView = (discount: DiscountRequest) => {
    setSelectedDiscount(discount)
    setIsViewOpen(true)
  }

  const handleApproveSubmit = async (data: { comments: string; conditions?: string }) => {
    if (selectedDiscount) {
      try {
        await cpqWorkflowRequestService.update(selectedDiscount.id, { status: 'approved' })
      } catch {
        // best-effort backend update; still reflect the decision locally
      }
      setDiscounts((prev) =>
        prev.map((d) => (d.id === selectedDiscount.id ? { ...d, status: 'approved' } : d)),
      )
    }
    setIsApproveOpen(false)
  }

  const handleRejectSubmit = async (data: { reason: string; comments: string; alternativeSuggestion?: string }) => {
    if (selectedDiscount) {
      try {
        await cpqWorkflowRequestService.update(selectedDiscount.id, { status: 'rejected' })
      } catch {
        // best-effort backend update; still reflect the decision locally
      }
      setDiscounts((prev) =>
        prev.map((d) => (d.id === selectedDiscount.id ? { ...d, status: 'rejected' } : d)),
      )
    }
    setIsRejectOpen(false)
  }

  const handleCommentSubmit = (comment: string) => {
    console.log('Comment added:', selectedDiscount?.quoteNumber, comment)
    // TODO: API call to add comment
    setIsCommentOpen(false)
  }

  const totalRequests = discounts.length
  const pendingRequests = discounts.filter(d => d.status === 'pending').length
  const approvedRequests = discounts.filter(d => d.status === 'approved').length
  const rejectedRequests = discounts.filter(d => d.status === 'rejected').length
  const totalDiscountValue = discounts.filter(d => d.status === 'approved' || d.status === 'pending').reduce((sum, d) => sum + d.discountAmount, 0)
  const avgDiscount = (discounts.reduce((sum, d) => sum + d.discountPercentage, 0) / discounts.length).toFixed(1)

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
      <div className="grid grid-cols-1 md:grid-cols-6 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-5 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Requests</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{totalRequests}</p>
            </div>
            <Percent className="h-10 w-10 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-5 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-900 mt-1">{pendingRequests}</p>
            </div>
            <Clock className="h-10 w-10 text-yellow-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-5 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Approved</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{approvedRequests}</p>
            </div>
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-5 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Rejected</p>
              <p className="text-2xl font-bold text-red-900 mt-1">{rejectedRequests}</p>
            </div>
            <XCircle className="h-10 w-10 text-red-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-5 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Total Value</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">₹{(totalDiscountValue / 100000).toFixed(1)}L</p>
            </div>
            <DollarSign className="h-10 w-10 text-purple-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-5 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Avg Discount</p>
              <p className="text-2xl font-bold text-orange-900 mt-1">{avgDiscount}%</p>
            </div>
            <TrendingDown className="h-10 w-10 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Customer Type Filters */}
      <div className="mb-3 flex gap-3 overflow-x-auto pb-2">
        <button className="px-4 py-2 bg-blue-100 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-200 text-sm font-medium whitespace-nowrap">
          All Requests ({totalRequests})
        </button>
        <button className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm whitespace-nowrap">
          New Customers ({discounts.filter(d => d.customerType === 'new').length})
        </button>
        <button className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm whitespace-nowrap">
          Repeat ({discounts.filter(d => d.customerType === 'repeat').length})
        </button>
        <button className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm whitespace-nowrap">
          VIP ({discounts.filter(d => d.customerType === 'vip').length})
        </button>
        <button className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm whitespace-nowrap">
          Strategic ({discounts.filter(d => d.customerType === 'strategic').length})
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by quote number, customer, or approver..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Discount Requests */}
      <div className="space-y-2">
        {discounts.map((discount) => (
          <div
            key={discount.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-5"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base font-semibold text-gray-900">{discount.quoteNumber}</h3>
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${getCustomerTypeColor(discount.customerType)}`}>
                    {discount.customerType}
                  </span>
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${getStatusColor(discount.status)}`}>
                    {discount.status}
                  </span>
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${getPriorityColor(discount.priority)}`}>
                    {discount.priority}
                  </span>
                </div>
                <p className="text-xs text-gray-500">{discount.id} • {discount.customerName}</p>
              </div>
            </div>

            {/* Discount Details */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-2">
              <div className="bg-gray-50 rounded p-3">
                <p className="text-xs text-gray-500 mb-1">Original Value</p>
                <p className="text-sm font-bold text-gray-900">₹{(discount.originalValue / 100000).toFixed(2)}L</p>
              </div>
              <div className="bg-red-50 rounded p-3">
                <p className="text-xs text-red-600 mb-1">Discount</p>
                <p className="text-sm font-bold text-red-700">{discount.discountPercentage}% (₹{(discount.discountAmount / 100000).toFixed(2)}L)</p>
              </div>
              <div className="bg-blue-50 rounded p-3">
                <p className="text-xs text-blue-600 mb-1">Final Value</p>
                <p className="text-sm font-bold text-blue-700">₹{(discount.finalValue / 100000).toFixed(2)}L</p>
              </div>
              <div className="bg-green-50 rounded p-3">
                <p className="text-xs text-green-600 mb-1">Margin After Discount</p>
                <p className={`text-sm font-bold ${getMarginColor(discount.marginAfterDiscount)}`}>
                  {discount.marginAfterDiscount}%
                </p>
              </div>
              <div className="bg-purple-50 rounded p-3">
                <p className="text-xs text-purple-600 mb-1">Quantity</p>
                <p className="text-sm font-bold text-purple-700">{discount.quantity} units</p>
              </div>
            </div>

            {/* Request Info */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-2 text-xs">
              <div>
                <p className="text-gray-500">Requested By</p>
                <p className="font-semibold text-gray-900">{discount.requestedBy}</p>
              </div>
              <div>
                <p className="text-gray-500">Request Date</p>
                <p className="font-semibold text-gray-900">{discount.requestDate}</p>
              </div>
              <div>
                <p className="text-gray-500">Product Category</p>
                <p className="font-semibold text-gray-900">{discount.productCategory}</p>
              </div>
            </div>

            {/* Reason & Justification */}
            <div className="mb-2">
              <p className="text-xs font-semibold text-gray-700 mb-1">Reason: <span className="font-normal">{discount.reason}</span></p>
              <p className="text-xs text-gray-600 bg-yellow-50 border border-yellow-200 rounded p-2">{discount.justification}</p>
            </div>

            {/* Competitor Price */}
            {discount.competitorPrice && (
              <div className="mb-2 flex items-center gap-2 text-xs">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <span className="text-gray-700">
                  Competitor Price: <span className="font-semibold">₹{(discount.competitorPrice / 100000).toFixed(2)}L</span>
                  {discount.competitorPrice > discount.finalValue ? (
                    <span className="text-green-600 ml-2">✓ We're cheaper by ₹{((discount.competitorPrice - discount.finalValue) / 100000).toFixed(2)}L</span>
                  ) : (
                    <span className="text-red-600 ml-2">✗ We're costlier by ₹{((discount.finalValue - discount.competitorPrice) / 100000).toFixed(2)}L</span>
                  )}
                </span>
              </div>
            )}

            {/* Approval Chain */}
            <div className="mb-2">
              <p className="text-xs font-semibold text-gray-700 mb-2">Approval Chain:</p>
              <div className="space-y-2">
                {discount.approvalChain.map((step) => (
                  <div key={step.level} className="flex items-start gap-3 text-xs">
                    <div className="flex-shrink-0 mt-0.5">
                      {getStepStatusIcon(step.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900">Level {step.level}: {step.approver}</p>
                        <span className="text-gray-500">({step.role})</span>
                        <span className={`px-2 py-0.5 text-xs rounded border ${
                          step.status === 'approved' ? 'bg-green-50 text-green-700 border-green-200' :
                          step.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                          'bg-yellow-50 text-yellow-700 border-yellow-200'
                        }`}>
                          {step.status}
                        </span>
                      </div>
                      {step.actionDate && (
                        <p className="text-gray-500 mt-0.5">{step.actionDate}</p>
                      )}
                      {step.comments && (
                        <p className="text-gray-600 mt-1 italic">&ldquo;{step.comments}&rdquo;</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Comments */}
            {discount.comments.length > 0 && (
              <div className="mb-2">
                <p className="text-xs font-semibold text-gray-700 mb-2">Comments:</p>
                <div className="space-y-2">
                  {discount.comments.map((comment) => (
                    <div key={comment.id} className="bg-gray-50 rounded p-3 text-xs">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="h-3 w-3 text-gray-500" />
                        <span className="font-semibold text-gray-900">{comment.author}</span>
                        <span className="text-gray-400 ml-auto">{comment.timestamp}</span>
                      </div>
                      <p className="text-gray-700">{comment.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2">
              {discount.status === 'pending' && (
                <>
                  <button
                    onClick={() => handleApprove(discount)}
                    className="px-3 py-2 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700 flex items-center gap-1"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(discount)}
                    className="px-3 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700 flex items-center gap-1"
                  >
                    <XCircle className="h-4 w-4" />
                    Reject
                  </button>
                  <button
                    onClick={() => handleAddComment(discount)}
                    className="px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-1"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Add Comment
                  </button>
                </>
              )}
              <button
                onClick={() => handleView(discount)}
                className="px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-1"
              >
                <Eye className="h-4 w-4" />
                View Quote
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Discount Approval Info */}
      <div className="mt-6 bg-purple-50 border border-purple-200 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-purple-900 mb-2">Discount Approval Guidelines:</h3>
        <ul className="text-xs text-purple-700 space-y-1">
          <li><strong>Auto-Approved:</strong> Discounts up to 5% for any customer type</li>
          <li><strong>Sales Manager:</strong> 6-10% discount (Repeat/VIP customers), 6-8% (New customers)</li>
          <li><strong>Finance Head:</strong> 11-15% discount (requires margin analysis)</li>
          <li><strong>VP Sales:</strong> 16-20% discount (strategic customers only)</li>
          <li><strong>CEO:</strong> 20%+ discount (exceptional cases with business justification)</li>
          <li><strong>Margin Rule:</strong> Minimum 15% margin must be maintained after discount</li>
        </ul>
      </div>

      {/* Modals */}
      <ApproveDiscountModal
        isOpen={isApproveOpen}
        onClose={() => setIsApproveOpen(false)}
        onApprove={handleApproveSubmit}
        discount={selectedDiscount}
      />

      <RejectDiscountModal
        isOpen={isRejectOpen}
        onClose={() => setIsRejectOpen(false)}
        onReject={handleRejectSubmit}
        discount={selectedDiscount}
      />

      <AddDiscountCommentModal
        isOpen={isCommentOpen}
        onClose={() => setIsCommentOpen(false)}
        onAddComment={handleCommentSubmit}
        discount={selectedDiscount}
      />

      <ViewQuoteModal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        discount={selectedDiscount}
      />
    </div>
  )
}
