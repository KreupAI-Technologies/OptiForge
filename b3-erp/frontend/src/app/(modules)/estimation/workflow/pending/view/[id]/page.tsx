'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, CheckCircle, XCircle, Clock, User, DollarSign, Calendar, FileText, MessageSquare, Download } from 'lucide-react'
import { estimationWorkflowStageService } from '@/services/estimation-workflow-stage.service'

interface EstimateItem {
  id: string
  itemCode: string
  description: string
  category: string
  quantity: number
  unit: string
  rate: number
  amount: number
}

export default function ViewPendingEstimatePage() {
  const router = useRouter()
  const params = useParams()
  const estimateId = params?.id as string

  // Mock data - would come from API
  const estimateData = {
    id: estimateId,
    estimateNumber: 'EST-2025-0142',
    projectName: 'Luxury Penthouse - Ultra Premium Kitchen',
    customerName: 'DLF Limited',
    contactPerson: 'Mr. Amit Verma',
    contactEmail: 'amit.verma@dlf.com',
    contactPhone: '+91 98765 43210',
    category: 'Premium Modular Kitchen',
    estimatedValue: 8500000,
    submittedBy: 'Amit Sharma',
    submittedDate: '2025-10-18',
    submittedTime: '14:30',
    pendingWith: 'Mr. Suresh Iyer (Senior Manager)',
    pendingDays: 2,
    priority: 'high' as const,
    approvalLevel: 'Level 2',
    comments: 3,
    status: 'Pending Approval',
    validityDays: 30,
    paymentTerms: '40% Advance, 30% During Installation, 30% On Completion',
    deliveryTime: '45 working days from order confirmation',
    items: [
      {
        id: '1',
        itemCode: 'BASE-001',
        description: 'Premium Base Cabinet 600mm - Italian Walnut',
        category: 'Base Cabinets',
        quantity: 8,
        unit: 'Unit',
        rate: 28500,
        amount: 228000
      },
      {
        id: '2',
        itemCode: 'WALL-002',
        description: 'Wall Cabinet 900mm with Glass Door - Frosted',
        category: 'Wall Cabinets',
        quantity: 5,
        unit: 'Unit',
        rate: 32000,
        amount: 160000
      },
      {
        id: '3',
        itemCode: 'COUNTER-003',
        description: 'Italian Marble Countertop - Statuario',
        category: 'Countertops',
        quantity: 25,
        unit: 'Sq.Ft',
        rate: 8500,
        amount: 212500
      },
      {
        id: '4',
        itemCode: 'ISLAND-004',
        description: 'Kitchen Island with Breakfast Counter',
        category: 'Island Units',
        quantity: 1,
        unit: 'Unit',
        rate: 185000,
        amount: 185000
      },
      {
        id: '5',
        itemCode: 'APPL-005',
        description: 'Built-in Oven - Bosch Premium',
        category: 'Appliances',
        quantity: 1,
        unit: 'Unit',
        rate: 125000,
        amount: 125000
      },
      {
        id: '6',
        itemCode: 'APPL-006',
        description: 'Built-in Microwave - Bosch Premium',
        category: 'Appliances',
        quantity: 1,
        unit: 'Unit',
        rate: 65000,
        amount: 65000
      },
      {
        id: '7',
        itemCode: 'HARD-007',
        description: 'Soft Close Hinges - Blum Premium',
        category: 'Hardware',
        quantity: 45,
        unit: 'Set',
        rate: 850,
        amount: 38250
      },
      {
        id: '8',
        itemCode: 'LIGHT-008',
        description: 'Under Cabinet LED Lighting',
        category: 'Lighting',
        quantity: 15,
        unit: 'M',
        rate: 1800,
        amount: 27000
      }
    ]
  }

  const COMPANY_ID = 'company-001'

  const handleApprove = async () => {
    if (!confirm(`Are you sure you want to approve "${estimateData.projectName}"?`)) return
    try {
      await estimationWorkflowStageService.update(COMPANY_ID, estimateId, { status: 'active' })
      router.push('/estimation/workflow/pending')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to approve estimate.')
    }
  }

  const handleReject = async () => {
    if (!confirm(`Are you sure you want to reject "${estimateData.projectName}"? Please provide a reason in comments.`)) return
    try {
      await estimationWorkflowStageService.update(COMPANY_ID, estimateId, { status: 'inactive' })
      router.push('/estimation/workflow/pending')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to reject estimate.')
    }
  }

  const handleViewComments = () => {
    router.push(`/estimation/workflow/pending/comments/${estimateId}`)
  }

  const handleDownload = () => {
    console.log('Downloading estimate PDF:', estimateId)
    // Would trigger PDF download
  }

  const handleBack = () => {
    router.push('/estimation/workflow/pending')
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'low':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  // Group items by category
  const itemsByCategory = estimateData.items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = []
    }
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, typeof estimateData.items>)

  return (
    <div className="w-full h-full flex flex-col bg-gray-50">
      <div className="flex-none bg-white border-b border-gray-200 px-3 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{estimateData.projectName}</h1>
              <p className="text-sm text-gray-500 mt-1">{estimateData.estimateNumber}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
            <button
              onClick={handleViewComments}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2 relative"
            >
              <MessageSquare className="w-4 h-4" />
              Comments
              {estimateData.comments > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {estimateData.comments}
                </span>
              )}
            </button>
            <button
              onClick={handleReject}
              className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 flex items-center gap-2"
            >
              <XCircle className="w-4 h-4" />
              Reject
            </button>
            <button
              onClick={handleApprove}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Approve
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-3">
        <div className="grid grid-cols-3 gap-3">
          {/* Main Content */}
          <div className="col-span-2 space-y-3">
            {/* Estimate Details */}
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Estimate Details
              </h2>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Customer</p>
                  <p className="font-semibold text-gray-900">{estimateData.customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Contact Person</p>
                  <p className="font-medium text-gray-900">{estimateData.contactPerson}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Email</p>
                  <p className="font-medium text-gray-900">{estimateData.contactEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Phone</p>
                  <p className="font-medium text-gray-900">{estimateData.contactPhone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Category</p>
                  <p className="font-medium text-gray-900">{estimateData.category}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Value</p>
                  <p className="font-bold text-xl text-green-600">
                    ₹{estimateData.estimatedValue.toLocaleString()}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500 mb-1">Payment Terms</p>
                  <p className="font-medium text-gray-900">{estimateData.paymentTerms}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Validity</p>
                  <p className="font-medium text-gray-900">{estimateData.validityDays} days</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Delivery Time</p>
                  <p className="font-medium text-gray-900">{estimateData.deliveryTime}</p>
                </div>
              </div>
            </div>

            {/* Items by Category */}
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Estimate Items</h2>

              {Object.entries(itemsByCategory).map(([category, items]) => (
                <div key={category} className="mb-3 last:mb-0">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-semibold text-gray-900">{category}</h3>
                    <span className="text-sm text-gray-600">
                      {items.length} items · ₹{items.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-y border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item Code</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Qty</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Unit</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Rate (₹)</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount (₹)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {items.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.itemCode}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{item.description}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 text-right">{item.quantity}</td>
                            <td className="px-4 py-3 text-sm text-gray-600 text-center">{item.unit}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 text-right">{item.rate.toLocaleString()}</td>
                            <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">{item.amount.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                        <tr>
                          <td colSpan={5} className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">
                            {category} Subtotal:
                          </td>
                          <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">
                            ₹{items.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              ))}

              {/* Grand Total */}
              <div className="mt-6 pt-6 border-t-2 border-gray-300">
                <div className="flex justify-between items-center">
                  <div className="text-base font-semibold text-gray-900">
                    Grand Total ({estimateData.items.length} items)
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    ₹{estimateData.estimatedValue.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="col-span-1 space-y-3">
            {/* Status Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-3 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Approval Status</h3>

              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Status</p>
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                    <Clock className="w-4 h-4" />
                    {estimateData.status}
                  </span>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Priority</p>
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(estimateData.priority)}`}>
                    {estimateData.priority.toUpperCase()}
                  </span>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500 mb-1 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Pending Days
                  </p>
                  <p className="text-2xl font-bold text-orange-600">{estimateData.pendingDays} days</p>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500 mb-1">Approval Level</p>
                  <p className="font-medium text-gray-900">{estimateData.approvalLevel}</p>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500 mb-1">Pending With</p>
                  <p className="font-semibold text-gray-900">{estimateData.pendingWith}</p>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500 mb-1 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Submitted By
                  </p>
                  <p className="font-medium text-gray-900">{estimateData.submittedBy}</p>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500 mb-1 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Submitted On
                  </p>
                  <p className="font-medium text-gray-900">
                    {new Date(estimateData.submittedDate).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </p>
                  <p className="text-sm text-gray-600">{estimateData.submittedTime}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                <button
                  onClick={handleApprove}
                  className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 font-medium"
                >
                  <CheckCircle className="w-5 h-5" />
                  Approve Estimate
                </button>
                <button
                  onClick={handleReject}
                  className="w-full px-4 py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 flex items-center justify-center gap-2 font-medium"
                >
                  <XCircle className="w-5 h-5" />
                  Reject Estimate
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
