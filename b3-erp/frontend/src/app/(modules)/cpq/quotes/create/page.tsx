'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Save,
  Send,
  Plus,
  X,
  Search,
  Calculator
} from 'lucide-react'
import { cpqQuoteService } from '@/services/cpq/cpq-quote.service'

interface QuoteLineItem {
  id: string
  productName: string
  description: string
  quantity: number
  unitPrice: number
  discount: number
  tax: number
  total: number
}

export default function CPQQuotesCreatePage() {
  const router = useRouter()

  const [quoteData, setQuoteData] = useState({
    customerName: '',
    contactPerson: '',
    email: '',
    phone: '',
    projectName: '',
    projectType: 'modular-kitchen',
    validityDays: 30,
    paymentTerms: 'net-30',
    deliveryTerms: 'ex-works',
    notes: ''
  })

  const [lineItems, setLineItems] = useState<QuoteLineItem[]>([
    {
      id: '1',
      productName: 'Premium Modular Kitchen',
      description: 'L-shaped layout with soft-close cabinets',
      quantity: 1,
      unitPrice: 2500000,
      discount: 10,
      tax: 18,
      total: 2655000
    }
  ])

  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => {
      const discountedPrice = item.unitPrice * (1 - item.discount / 100)
      return sum + (discountedPrice * item.quantity)
    }, 0)
  }

  const calculateTotalTax = () => {
    return lineItems.reduce((sum, item) => {
      const discountedPrice = item.unitPrice * (1 - item.discount / 100)
      const itemSubtotal = discountedPrice * item.quantity
      return sum + (itemSubtotal * item.tax / 100)
    }, 0)
  }

  const calculateGrandTotal = () => {
    return calculateSubtotal() + calculateTotalTax()
  }

  const addLineItem = () => {
    const newItem: QuoteLineItem = {
      id: String(lineItems.length + 1),
      productName: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      tax: 18,
      total: 0
    }
    setLineItems([...lineItems, newItem])
  }

  const removeLineItem = (id: string) => {
    setLineItems(lineItems.filter(item => item.id !== id))
  }

  const handleSaveDraft = async () => {
    await cpqQuoteService.create({
      quote: {
        customerName: quoteData.customerName ?? '',
        title: quoteData.projectName || 'New Quote',
        validityDays: Number(quoteData.validityDays) || 30,
        notes: quoteData.notes ?? ''
      } as any,
      items: (Array.isArray(lineItems) ? lineItems : []).map(li => ({
        productName: li.productName,
        description: li.description,
        quantity: li.quantity,
        unitPrice: li.unitPrice,
        discountPercentage: li.discount,
        taxPercentage: li.tax
      } as any))
    })
    router.push('/cpq/quotes')
  }

  return (
    <div className="w-full h-full px-4 py-2">
      {/* Action Buttons */}
      <div className="mb-3 flex justify-between items-center">
        <button 
          onClick={() => router.push('/cpq/quotes')}
          className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Quotes
        </button>
        <div className="flex items-center gap-3">
          <button onClick={handleSaveDraft} className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Save className="h-4 w-4" />
            Save Draft
          </button>
          <button className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Send className="h-4 w-4" />
            Generate Quote
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-3">
          {/* Customer Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Customer Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={quoteData.customerName}
                    onChange={(e) => setQuoteData({...quoteData, customerName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Select or enter customer"
                  />
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Person
                </label>
                <input
                  type="text"
                  value={quoteData.contactPerson}
                  onChange={(e) => setQuoteData({...quoteData, contactPerson: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Contact person name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={quoteData.email}
                  onChange={(e) => setQuoteData({...quoteData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="customer@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={quoteData.phone}
                  onChange={(e) => setQuoteData({...quoteData, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>
          </div>

          {/* Project Details */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Project Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Name *
                </label>
                <input
                  type="text"
                  value={quoteData.projectName}
                  onChange={(e) => setQuoteData({...quoteData, projectName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Premium Kitchen - Tower A"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Type
                </label>
                <select
                  value={quoteData.projectType}
                  onChange={(e) => setQuoteData({...quoteData, projectType: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="modular-kitchen">Modular Kitchen</option>
                  <option value="l-shaped">L-Shaped Kitchen</option>
                  <option value="island">Island Kitchen</option>
                  <option value="straight">Straight Kitchen</option>
                  <option value="custom">Custom Design</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quote Validity (Days)
                </label>
                <input
                  type="number"
                  value={quoteData.validityDays}
                  onChange={(e) => setQuoteData({...quoteData, validityDays: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-gray-900">Quote Items</h2>
              <button
                onClick={addLineItem}
                className="px-3 py-1.5 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                Add Item
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Product</th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-500">Qty</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Unit Price</th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-500">Disc%</th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-500">Tax%</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Total</th>
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {lineItems.map((item) => (
                    <tr key={item.id}>
                      <td className="px-3 py-3">
                        <input
                          type="text"
                          value={item.productName}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                          placeholder="Product name"
                        />
                        <input
                          type="text"
                          value={item.description}
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded mt-1"
                          placeholder="Description"
                        />
                      </td>
                      <td className="px-3 py-3">
                        <input
                          type="number"
                          value={item.quantity}
                          className="w-16 px-2 py-1 text-sm text-center border border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-3 py-3">
                        <input
                          type="number"
                          value={item.unitPrice}
                          className="w-24 px-2 py-1 text-sm text-right border border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-3 py-3">
                        <input
                          type="number"
                          value={item.discount}
                          className="w-16 px-2 py-1 text-sm text-center border border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-3 py-3">
                        <input
                          type="number"
                          value={item.tax}
                          className="w-16 px-2 py-1 text-sm text-center border border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-3 py-3 text-right">
                        <span className="text-sm font-semibold text-gray-900">
                          ₹{item.total.toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <button
                          onClick={() => removeLineItem(item.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Terms & Conditions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Terms
                </label>
                <select
                  value={quoteData.paymentTerms}
                  onChange={(e) => setQuoteData({...quoteData, paymentTerms: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="net-15">Net 15 days</option>
                  <option value="net-30">Net 30 days</option>
                  <option value="net-45">Net 45 days</option>
                  <option value="net-60">Net 60 days</option>
                  <option value="50-50">50% Advance, 50% on Delivery</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Terms
                </label>
                <select
                  value={quoteData.deliveryTerms}
                  onChange={(e) => setQuoteData({...quoteData, deliveryTerms: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="ex-works">Ex-Works</option>
                  <option value="fob">FOB (Free on Board)</option>
                  <option value="cif">CIF (Cost, Insurance, Freight)</option>
                  <option value="delivered">Delivered to Site</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Notes
                </label>
                <textarea
                  value={quoteData.notes}
                  onChange={(e) => setQuoteData({...quoteData, notes: e.target.value})}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Any special terms, conditions, or notes for this quote..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sticky top-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Quote Summary
            </h2>
            
            <div className="space-y-3 mb-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium text-gray-900">
                  ₹{calculateSubtotal().toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Tax:</span>
                <span className="font-medium text-gray-900">
                  ₹{calculateTotalTax().toLocaleString('en-IN')}
                </span>
              </div>
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between">
                  <span className="text-base font-semibold text-gray-900">Grand Total:</span>
                  <span className="text-xl font-bold text-blue-600">
                    ₹{calculateGrandTotal().toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-3 mb-2">
              <h3 className="text-sm font-medium text-blue-900 mb-2">Quote Details</h3>
              <div className="space-y-2 text-xs text-blue-700">
                <div className="flex justify-between">
                  <span>Items:</span>
                  <span className="font-medium">{lineItems.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Valid for:</span>
                  <span className="font-medium">{quoteData.validityDays} days</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment:</span>
                  <span className="font-medium">{quoteData.paymentTerms}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <button className="w-full px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2">
                <Send className="h-4 w-4" />
                Generate & Send Quote
              </button>
              <button onClick={handleSaveDraft} className="w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2">
                <Save className="h-4 w-4" />
                Save as Draft
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
