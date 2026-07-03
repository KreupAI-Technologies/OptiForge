'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { exportToCsv } from '@/lib/export'
import {
  ArrowLeft,
  Download,
  Star,
  TrendingUp,
  TrendingDown,
  Clock,
  DollarSign,
  Package,
  Truck,
  Award,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Calendar,
  Building2,
  BarChart3,
  Shield,
  Percent,
  CreditCard,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Eye,
  Mail,
  Printer,
  Zap
} from 'lucide-react'

interface Vendor {
  id: string
  name: string
  code: string
  rating: number
  responseDate: string
  validityDays: number
}

interface QuotationItem {
  itemCode: string
  itemName: string
  specification: string
  quantity: number
  unit: string
  vendors: {
    [vendorId: string]: {
      unitPrice: number
      totalPrice: number
      discount: number
      tax: number
      deliveryDays: number
      warranty: string
      remarks?: string
    }
  }
}

interface QuotationComparison {
  rfqNumber: string
  rfqTitle: string
  vendors: Vendor[]
  items: QuotationItem[]
  summary: {
    [vendorId: string]: {
      subtotal: number
      totalDiscount: number
      totalTax: number
      grandTotal: number
      paymentTerms: string
      deliveryTerms: string
      validityDate: string
      technicalScore: number
      commercialScore: number
      overallScore: number
      ranking: number
    }
  }
}

export default function QuotationComparisonPage() {
  const params = useParams()
  const rfqId = params.id as string

  // Mock data
  const [comparisonData] = useState<QuotationComparison>({
    rfqNumber: 'RFQ-2024-001',
    rfqTitle: 'Office Equipment Supply',
    vendors: [
      { id: '1', name: 'Tech Supplies Co.', code: 'VEND-001', rating: 4.5, responseDate: '2024-01-25', validityDays: 30 },
      { id: '2', name: 'Office Pro Ltd', code: 'VEND-002', rating: 4.2, responseDate: '2024-01-26', validityDays: 45 },
      { id: '3', name: 'Business Solutions Inc', code: 'VEND-003', rating: 4.8, responseDate: '2024-01-24', validityDays: 60 }
    ],
    items: [
      {
        itemCode: 'ITEM-001',
        itemName: 'Laptop Dell XPS 15',
        specification: 'Intel i7, 16GB RAM, 512GB SSD',
        quantity: 10,
        unit: 'Unit',
        vendors: {
          '1': { unitPrice: 1500, totalPrice: 15000, discount: 5, tax: 10, deliveryDays: 7, warranty: '2 years' },
          '2': { unitPrice: 1450, totalPrice: 14500, discount: 3, tax: 10, deliveryDays: 10, warranty: '1 year' },
          '3': { unitPrice: 1480, totalPrice: 14800, discount: 8, tax: 10, deliveryDays: 5, warranty: '3 years', remarks: 'Extended warranty included' }
        }
      },
      {
        itemCode: 'ITEM-002',
        itemName: 'Office Chair Ergonomic',
        specification: 'Adjustable height, lumbar support',
        quantity: 25,
        unit: 'Unit',
        vendors: {
          '1': { unitPrice: 450, totalPrice: 11250, discount: 10, tax: 10, deliveryDays: 14, warranty: '1 year' },
          '2': { unitPrice: 420, totalPrice: 10500, discount: 5, tax: 10, deliveryDays: 7, warranty: '1 year' },
          '3': { unitPrice: 435, totalPrice: 10875, discount: 12, tax: 10, deliveryDays: 10, warranty: '2 years' }
        }
      },
      {
        itemCode: 'ITEM-003',
        itemName: 'Wireless Mouse',
        specification: 'Bluetooth 5.0, Rechargeable',
        quantity: 50,
        unit: 'Unit',
        vendors: {
          '1': { unitPrice: 25, totalPrice: 1250, discount: 0, tax: 5, deliveryDays: 3, warranty: '6 months' },
          '2': { unitPrice: 22, totalPrice: 1100, discount: 0, tax: 5, deliveryDays: 5, warranty: '6 months' },
          '3': { unitPrice: 24, totalPrice: 1200, discount: 5, tax: 5, deliveryDays: 3, warranty: '1 year' }
        }
      },
      {
        itemCode: 'ITEM-004',
        itemName: 'Monitor 27" 4K',
        specification: 'IPS Panel, USB-C, Height Adjustable',
        quantity: 15,
        unit: 'Unit',
        vendors: {
          '1': { unitPrice: 500, totalPrice: 7500, discount: 7, tax: 10, deliveryDays: 10, warranty: '2 years' },
          '2': { unitPrice: 480, totalPrice: 7200, discount: 5, tax: 10, deliveryDays: 14, warranty: '2 years' },
          '3': { unitPrice: 490, totalPrice: 7350, discount: 10, tax: 10, deliveryDays: 7, warranty: '3 years' }
        }
      },
      {
        itemCode: 'ITEM-005',
        itemName: 'Desk Standing Adjustable',
        specification: 'Electric, Memory Settings',
        quantity: 8,
        unit: 'Unit',
        vendors: {
          '1': { unitPrice: 800, totalPrice: 6400, discount: 15, tax: 10, deliveryDays: 21, warranty: '5 years' },
          '2': { unitPrice: 750, totalPrice: 6000, discount: 10, tax: 10, deliveryDays: 14, warranty: '3 years' },
          '3': { unitPrice: 780, totalPrice: 6240, discount: 18, tax: 10, deliveryDays: 18, warranty: '5 years' }
        }
      }
    ],
    summary: {
      '1': {
        subtotal: 41400,
        totalDiscount: 3105,
        totalTax: 4229.5,
        grandTotal: 42524.5,
        paymentTerms: 'Net 30',
        deliveryTerms: 'DDP',
        validityDate: '2024-02-24',
        technicalScore: 85,
        commercialScore: 78,
        overallScore: 81.5,
        ranking: 2
      },
      '2': {
        subtotal: 39300,
        totalDiscount: 1772.5,
        totalTax: 4127.75,
        grandTotal: 41655.25,
        paymentTerms: 'Net 45',
        deliveryTerms: 'DAP',
        validityDate: '2024-03-12',
        technicalScore: 75,
        commercialScore: 82,
        overallScore: 78.5,
        ranking: 3
      },
      '3': {
        subtotal: 40465,
        totalDiscount: 4248.25,
        totalTax: 3981.68,
        grandTotal: 40198.43,
        paymentTerms: 'Net 15',
        deliveryTerms: 'DDP',
        validityDate: '2024-03-25',
        technicalScore: 92,
        commercialScore: 85,
        overallScore: 88.5,
        ranking: 1
      }
    }
  })

  const getLowestPrice = (item: QuotationItem) => {
    const prices = Object.values(item.vendors).map(v => v.unitPrice)
    return Math.min(...prices)
  }

  const isLowestPrice = (item: QuotationItem, vendorId: string) => {
    return item.vendors[vendorId].unitPrice === getLowestPrice(item)
  }

  const getBestDelivery = (item: QuotationItem) => {
    const days = Object.values(item.vendors).map(v => v.deliveryDays)
    return Math.min(...days)
  }

  const isBestDelivery = (item: QuotationItem, vendorId: string) => {
    return item.vendors[vendorId].deliveryDays === getBestDelivery(item)
  }

  const getRankingColor = (ranking: number) => {
    switch (ranking) {
      case 1:
        return 'bg-green-100 text-green-800 border-green-300'
      case 2:
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case 3:
        return 'bg-orange-100 text-orange-800 border-orange-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 80) return 'text-blue-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const handleExport = () => {
    exportToCsv('rfq-comparison', comparisonData.vendors as unknown as Record<string, unknown>[])
  }

  const handleAwardContract = (vendorId: string) => {
    console.log('Awarding contract to vendor:', vendorId)
  }

  const handleNegotiate = (vendorId: string) => {
    console.log('Starting negotiation with vendor:', vendorId)
  }

  return (
    <div className="p-6 w-full space-y-3">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link
              href="/procurement/rfq"
              className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
              <span className="text-gray-700">Back</span>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Quotation Comparison</h1>
          </div>
          <div className="ml-11 space-y-1">
            <p className="text-gray-600">RFQ: {comparisonData.rfqNumber} - {comparisonData.rfqTitle}</p>
            <p className="text-sm text-gray-500">Comparing {comparisonData.vendors.length} vendor quotations</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Printer className="h-4 w-4" />
            Print
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Vendor Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
        {comparisonData.vendors.map((vendor) => {
          const summary = comparisonData.summary[vendor.id]
          return (
            <div
              key={vendor.id}
              className={`bg-white rounded-lg border-2 ${summary.ranking === 1 ? 'border-green-500' : 'border-gray-200'
                } overflow-hidden`}
            >
              {/* Ranking Badge */}
              {summary.ranking === 1 && (
                <div className="bg-green-500 text-white px-4 py-2 text-center font-semibold">
                  BEST OVERALL QUOTATION
                </div>
              )}

              <div className="p-4">
                {/* Vendor Info */}
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">{vendor.name}</h3>
                    <p className="text-sm text-gray-500">{vendor.code}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium">{vendor.rating}</span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getRankingColor(summary.ranking)}`}>
                    Rank #{summary.ranking}
                  </span>
                </div>

                {/* Financial Summary */}
                <div className="space-y-2 pb-3 border-b">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">${summary.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Discount:</span>
                    <span className="font-medium text-green-600">-${summary.totalDiscount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax:</span>
                    <span className="font-medium">${summary.totalTax.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold pt-2 border-t">
                    <span>Total:</span>
                    <span className="text-blue-600">${summary.grandTotal.toLocaleString()}</span>
                  </div>
                </div>

                {/* Scores */}
                <div className="grid grid-cols-3 gap-2 py-3 border-b">
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Technical</p>
                    <p className={`text-lg font-bold ${getScoreColor(summary.technicalScore)}`}>
                      {summary.technicalScore}%
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Commercial</p>
                    <p className={`text-lg font-bold ${getScoreColor(summary.commercialScore)}`}>
                      {summary.commercialScore}%
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Overall</p>
                    <p className={`text-lg font-bold ${getScoreColor(summary.overallScore)}`}>
                      {summary.overallScore}%
                    </p>
                  </div>
                </div>

                {/* Terms */}
                <div className="space-y-2 py-3 border-b text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 flex items-center gap-1">
                      <CreditCard className="h-3 w-3" />
                      Payment:
                    </span>
                    <span className="font-medium">{summary.paymentTerms}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 flex items-center gap-1">
                      <Truck className="h-3 w-3" />
                      Delivery:
                    </span>
                    <span className="font-medium">{summary.deliveryTerms}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Valid Until:
                    </span>
                    <span className="font-medium">{summary.validityDate}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-3">
                  {summary.ranking === 1 ? (
                    <button
                      onClick={() => handleAwardContract(vendor.id)}
                      className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium flex items-center justify-center gap-1"
                    >
                      <Award className="h-4 w-4" />
                      Award Contract
                    </button>
                  ) : (
                    <button
                      onClick={() => handleNegotiate(vendor.id)}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center justify-center gap-1"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Negotiate
                    </button>
                  )}
                  <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <Eye className="h-4 w-4 text-gray-600" />
                    <span className="text-gray-700">View</span>
                  </button>
                  <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <Mail className="h-4 w-4 text-gray-600" />
                    <span className="text-gray-700">Email</span>
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Detailed Item Comparison Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-3 py-2 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Detailed Item Comparison</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" rowSpan={2}>
                  Item Details
                </th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" rowSpan={2}>
                  Qty
                </th>
                {comparisonData.vendors.map((vendor) => (
                  <th
                    key={vendor.id}
                    className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-l"
                    colSpan={4}
                  >
                    {vendor.name}
                  </th>
                ))}
              </tr>
              <tr>
                {comparisonData.vendors.map((vendor) => (
                  <React.Fragment key={vendor.id}>
                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 border-l">Unit Price</th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-500">Total</th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-500">Delivery</th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-500">Warranty</th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {comparisonData.items.map((item) => (
                <tr key={item.itemCode} className="hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{item.itemName}</div>
                      <div className="text-xs text-gray-500">{item.itemCode}</div>
                      <div className="text-xs text-gray-600 mt-1">{item.specification}</div>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <div className="text-sm font-medium text-gray-900">{item.quantity}</div>
                    <div className="text-xs text-gray-500">{item.unit}</div>
                  </td>
                  {comparisonData.vendors.map((vendor) => {
                    const vendorItem = item.vendors[vendor.id]
                    return (
                      <React.Fragment key={vendor.id}>
                        <td className="px-3 py-4 text-center border-l">
                          <div className={`text-sm font-medium ${isLowestPrice(item, vendor.id) ? 'text-green-600' : 'text-gray-900'
                            }`}>
                            ${vendorItem.unitPrice}
                            {isLowestPrice(item, vendor.id) && (
                              <TrendingDown className="h-3 w-3 inline ml-1" />
                            )}
                          </div>
                          {vendorItem.discount > 0 && (
                            <div className="text-xs text-gray-500">-{vendorItem.discount}%</div>
                          )}
                        </td>
                        <td className="px-3 py-4 text-center">
                          <div className="text-sm font-medium text-gray-900">
                            ${vendorItem.totalPrice.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500">+{vendorItem.tax}% tax</div>
                        </td>
                        <td className="px-3 py-4 text-center">
                          <div className={`text-sm ${isBestDelivery(item, vendor.id) ? 'text-blue-600 font-medium' : 'text-gray-900'
                            }`}>
                            {vendorItem.deliveryDays} days
                            {isBestDelivery(item, vendor.id) && (
                              <Zap className="h-3 w-3 inline ml-1" />
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-4 text-center">
                          <div className="text-sm text-gray-900">{vendorItem.warranty}</div>
                          {vendorItem.remarks && (
                            <div className="text-xs text-blue-600 mt-1">{vendorItem.remarks}</div>
                          )}
                        </td>
                      </React.Fragment>
                    )
                  })}
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan={2} className="px-3 py-2 text-sm font-semibold text-gray-900">
                  Grand Total
                </td>
                {comparisonData.vendors.map((vendor) => {
                  const summary = comparisonData.summary[vendor.id]
                  return (
                    <td key={vendor.id} colSpan={4} className="px-3 py-2 text-center border-l">
                      <div className={`text-lg font-bold ${summary.ranking === 1 ? 'text-green-600' : 'text-gray-900'
                        }`}>
                        ${summary.grandTotal.toLocaleString()}
                        {summary.ranking === 1 && (
                          <Trophy className="h-5 w-5 inline ml-2 text-yellow-500" />
                        )}
                      </div>
                    </td>
                  )
                })}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Evaluation Criteria */}
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Evaluation Criteria</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
          <div className="flex items-center gap-3">
            <DollarSign className="h-8 w-8 text-blue-500 bg-blue-100 rounded-lg p-1.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">Price (40%)</p>
              <p className="text-xs text-gray-500">Total cost comparison</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Truck className="h-8 w-8 text-green-500 bg-green-100 rounded-lg p-1.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">Delivery (20%)</p>
              <p className="text-xs text-gray-500">Lead time and terms</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-purple-500 bg-purple-100 rounded-lg p-1.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">Quality (25%)</p>
              <p className="text-xs text-gray-500">Warranty and specs</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Star className="h-8 w-8 text-yellow-500 bg-yellow-100 rounded-lg p-1.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">Vendor Rating (15%)</p>
              <p className="text-xs text-gray-500">Past performance</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Add Trophy icon component since it's not in lucide-react
const Trophy = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-5V9a1 1 0 10-2 0v1H4a2 2 0 110-4h1.17C5.06 5.687 5 5.35 5 5zm4 1V5a1 1 0 10-1 1h1zm3 0a1 1 0 10-1-1v1h1z" clipRule="evenodd" />
    <path d="M9 11H3v5a2 2 0 002 2h4v-7zM11 18h4a2 2 0 002-2v-5h-6v7z" />
  </svg>
)