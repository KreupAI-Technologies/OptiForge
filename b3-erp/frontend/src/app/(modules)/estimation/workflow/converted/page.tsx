'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { costEstimateService } from '@/services/estimation-cost-estimate.service'
import {
  CheckCircle2,
  Eye,
  FileText,
  TrendingUp,
  ExternalLink,
  ArrowLeft,
  Search,
  Filter,
  Download,
  User,
  DollarSign,
  Calendar,
  Award
} from 'lucide-react'

interface ConvertedEstimate {
  id: string
  estimateNumber: string
  orderNumber: string
  projectName: string
  customerName: string
  contactPerson: string
  category: string
  estimatedValue: number
  finalOrderValue: number
  variance: number
  variancePercent: number
  items: number
  createdBy: string
  estimateDate: string
  approvedDate: string
  convertedDate: string
  conversionTime: number
  paymentTerms: string
  deliveryTimeline: string
  status: 'order-confirmed' | 'in-production' | 'partial-delivered' | 'completed'
}

const companyId = 'default-company-id'

export default function EstimateWorkflowConvertedPage() {
  const router = useRouter()

  const [convertedEstimates, setConvertedEstimates] = useState<ConvertedEstimate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        setLoading(true)
        const data = await costEstimateService.findAll(companyId, { status: 'Converted to Order' })
        const list = Array.isArray(data) ? data : []
        const mapped: ConvertedEstimate[] = list.map((e) => {
          const orderValue = e.totalCost || 0
          return {
            id: e.id,
            estimateNumber: e.estimateNumber,
            orderNumber: '',
            projectName: e.title,
            customerName: e.customerName || '',
            contactPerson: e.customerName || '',
            category: e.estimateType || '',
            estimatedValue: orderValue,
            finalOrderValue: orderValue,
            variance: 0,
            variancePercent: 0,
            items: 0,
            createdBy: e.submittedBy || '',
            estimateDate: e.estimateDate ? e.estimateDate.slice(0, 10) : '',
            approvedDate: e.approvedAt ? e.approvedAt.slice(0, 10) : '',
            convertedDate: e.updatedAt ? e.updatedAt.slice(0, 10) : '',
            conversionTime: 0,
            paymentTerms: '',
            deliveryTimeline: '',
            status: 'order-confirmed',
          }
        })
        if (mounted) setConvertedEstimates(mapped)
      } catch (err) {
        console.error('Failed to load converted estimates:', err)
        if (mounted) setConvertedEstimates([])
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'order-confirmed':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'in-production':
        return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'partial-delivered':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getVarianceColor = (variance: number) => {
    if (variance > 0) return 'text-green-600'
    if (variance < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  const totalConverted = convertedEstimates.length
  const totalEstimatedValue = convertedEstimates.reduce((sum, e) => sum + e.estimatedValue, 0)
  const totalOrderValue = convertedEstimates.reduce((sum, e) => sum + e.finalOrderValue, 0)
  const avgConversionTime = totalConverted > 0 ? convertedEstimates.reduce((sum, e) => sum + e.conversionTime, 0) / totalConverted : 0
  const conversionRate = totalEstimatedValue > 0 ? ((totalOrderValue - totalEstimatedValue) / totalEstimatedValue) * 100 : 0

  return (
    <div className="w-full h-full px-4 py-2">
      {/* Action Buttons */}
      <div className="mb-3 flex justify-end">
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </button>
          <button className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-5 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Converted Orders</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{totalConverted}</p>
              <p className="text-xs text-green-700 mt-1">This month</p>
            </div>
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-5 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Order Value</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">₹{(totalOrderValue / 10000000).toFixed(2)}Cr</p>
              <p className="text-xs text-blue-700 mt-1">Total revenue</p>
            </div>
            <DollarSign className="h-10 w-10 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-5 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Value Uplift</p>
              <p className={`text-2xl font-bold mt-1 ${getVarianceColor(conversionRate)}`}>
                {conversionRate > 0 ? '+' : ''}{conversionRate.toFixed(1)}%
              </p>
              <p className="text-xs text-purple-700 mt-1">vs estimates</p>
            </div>
            <TrendingUp className="h-10 w-10 text-purple-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-5 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Avg Conversion Time</p>
              <p className="text-2xl font-bold text-orange-900 mt-1">{avgConversionTime.toFixed(0)}</p>
              <p className="text-xs text-orange-700 mt-1">days</p>
            </div>
            <Calendar className="h-10 w-10 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Converted Estimates Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Converted Estimates</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Estimate → Order</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Estimate Value</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Order Value</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Variance</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Conversion</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-3 py-8 text-center text-sm text-gray-500">
                    Loading converted estimates...
                  </td>
                </tr>
              ) : convertedEstimates.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-3 py-8 text-center text-sm text-gray-500">
                    No converted estimates found.
                  </td>
                </tr>
              ) : (
                convertedEstimates.map((estimate) => (
                <tr key={estimate.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-blue-600 text-sm">{estimate.estimateNumber}</p>
                        <span className="text-gray-400">→</span>
                        <p className="font-medium text-green-600 text-sm">{estimate.orderNumber}</p>
                      </div>
                      <p className="text-sm text-gray-900 mt-1">{estimate.projectName}</p>
                      <p className="text-xs text-gray-600 mt-1">{estimate.category} • {estimate.items} items</p>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{estimate.customerName}</p>
                      <p className="text-xs text-gray-600 mt-1">{estimate.contactPerson}</p>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <p className="text-sm font-medium text-gray-600">₹{(estimate.estimatedValue / 100000).toFixed(2)}L</p>
                  </td>
                  <td className="px-3 py-2">
                    <p className="text-sm font-bold text-green-600">₹{(estimate.finalOrderValue / 100000).toFixed(2)}L</p>
                  </td>
                  <td className="px-3 py-2">
                    <div>
                      <p className={`text-sm font-semibold ${getVarianceColor(estimate.variance)}`}>
                        {estimate.variance > 0 ? '+' : ''}₹{(Math.abs(estimate.variance) / 1000).toFixed(0)}K
                      </p>
                      <p className={`text-xs ${getVarianceColor(estimate.variance)}`}>
                        {estimate.variancePercent > 0 ? '+' : ''}{estimate.variancePercent.toFixed(1)}%
                      </p>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-900">{estimate.conversionTime} days</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{estimate.convertedDate}</p>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(estimate.status)}`}>
                      {estimate.status.toUpperCase().replace('-', ' ')}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg">
                        <ExternalLink className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg">
                        <FileText className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
