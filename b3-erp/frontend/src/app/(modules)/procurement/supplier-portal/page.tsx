'use client'

import React, { useState, useEffect } from 'react'
import {
  User, Building2, FileText, Package, DollarSign, TrendingUp, Bell, Settings,
  Clock, CheckCircle, XCircle, AlertCircle, Upload, Download, Eye, Edit,
  Plus, Search, Filter, Calendar, Mail, Phone, MapPin, Globe, Shield,
  Award, BarChart3, ShoppingCart, Truck, CreditCard, MessageSquare, HelpCircle,
  LogOut, ChevronRight, Star, ArrowUp, ArrowDown, Paperclip, Send, Zap, Target, Activity
} from 'lucide-react'
import { procurementPagesService } from '@/services/procurement-pages.service'

interface SupplierPurchaseOrder {
  id: string
  date: string
  items: number
  value: number
  status: string
  delivery: string
}

export default function SupplierPortal() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showProfileEdit, setShowProfileEdit] = useState(false)
  const [showQuoteModal, setShowQuoteModal] = useState(false)
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [showRealTimeMonitoring, setShowRealTimeMonitoring] = useState(true)
  const [showAIInsights, setShowAIInsights] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Supplier Info
  const supplierInfo = {
    name: 'TechSupply Solutions Ltd.',
    id: 'SUP-2024-001',
    rating: 4.8,
    status: 'Active',
    memberSince: '2020',
    category: 'Technology & Equipment',
    certifications: ['ISO 9001', 'ISO 14001', 'OHSAS 18001'],
  }

  // Dashboard Metrics
  const metrics = {
    activePos: 12,
    pendingInvoices: 5,
    totalRevenue: 1250000,
    onTimeDelivery: 96.5,
    qualityScore: 98.2,
    responseRate: 94.3,
  }

  // Purchase Orders
  const [purchaseOrders, setPurchaseOrders] = useState<SupplierPurchaseOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setLoadError(null)
    procurementPagesService
      .getPurchaseOrders()
      .then((rows) => {
        if (cancelled) return
        const mapped: SupplierPurchaseOrder[] = (rows ?? []).map((r: any) => ({
          id: r.poNumber ?? r.id ?? '',
          date: (r.poDate ?? '').toString().split('T')[0] || '',
          items: Number(r.lineItemCount ?? r.itemCount ?? r.items ?? 0) || 0,
          value: Number(r.totalAmount ?? 0) || 0,
          status: r.status ?? '',
          delivery: (r.deliveryDate ?? '').toString().split('T')[0] || '',
        }))
        setPurchaseOrders(mapped)
      })
      .catch((err) => {
        if (cancelled) return
        setLoadError(err?.message ?? 'Failed to load purchase orders')
        setPurchaseOrders([])
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  // RFQs
  const rfqs = [
    { id: 'RFQ-2024-101', title: 'Industrial Equipment Supply', deadline: '2024-03-20', items: 12, status: 'Open' },
    { id: 'RFQ-2024-102', title: 'IT Hardware Components', deadline: '2024-03-22', items: 8, status: 'Submitted' },
    { id: 'RFQ-2024-103', title: 'Safety Equipment', deadline: '2024-03-25', items: 15, status: 'Open' },
  ]

  // Invoices
  const invoices = [
    { id: 'INV-2024-001', poNumber: 'PO-2024-001', date: '2024-03-15', amount: 45000, status: 'Pending', dueDate: '2024-04-15' },
    { id: 'INV-2024-002', poNumber: 'PO-2024-002', date: '2024-03-12', amount: 28000, status: 'Paid', dueDate: '2024-04-12' },
    { id: 'INV-2024-003', poNumber: 'PO-2024-003', date: '2024-03-10', amount: 62000, status: 'Overdue', dueDate: '2024-03-10' },
  ]

  // Performance Data
  const performanceData = [
    { month: 'Jan', delivered: 15, onTime: 14, quality: 98 },
    { month: 'Feb', delivered: 18, onTime: 17, quality: 97 },
    { month: 'Mar', delivered: 12, onTime: 12, quality: 99 },
  ]

  const renderDashboard = () => (
    <div className="space-y-3">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-3 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold mb-2">Welcome back, {supplierInfo.name}</h2>
            <p className="opacity-90">Your supplier dashboard for all business operations</p>
            <div className="flex items-center gap-2 mt-4">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{supplierInfo.rating} Rating</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                <span>Member Since {supplierInfo.memberSince}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
              <Bell className="h-5 w-5" />
              <span>Notifications</span>
            </button>
            <button className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="bg-white rounded-lg shadow-sm p-3 border">
          <div className="flex items-center justify-between mb-2">
            <div className="p-3 bg-blue-100 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-blue-600" />
            </div>
            <span className="text-sm text-gray-500">This Month</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{metrics.activePos}</h3>
          <p className="text-sm text-gray-600 mt-1">Active Purchase Orders</p>
          <div className="flex items-center gap-2 mt-3">
            <ArrowUp className="h-4 w-4 text-green-500" />
            <span className="text-sm text-green-600">20% from last month</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-3 border">
          <div className="flex items-center justify-between mb-2">
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <span className="text-sm text-gray-500">YTD</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">${(metrics.totalRevenue / 1000).toFixed(0)}K</h3>
          <p className="text-sm text-gray-600 mt-1">Total Revenue</p>
          <div className="flex items-center gap-2 mt-3">
            <ArrowUp className="h-4 w-4 text-green-500" />
            <span className="text-sm text-green-600">15% growth</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-3 border">
          <div className="flex items-center justify-between mb-2">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Truck className="h-6 w-6 text-purple-600" />
            </div>
            <span className="text-sm text-gray-500">Performance</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{metrics.onTimeDelivery}%</h3>
          <p className="text-sm text-gray-600 mt-1">On-Time Delivery Rate</p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
            <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${metrics.onTimeDelivery}%` }} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-3 border">
          <div className="flex items-center justify-between mb-2">
            <div className="p-3 bg-amber-100 rounded-lg">
              <Award className="h-6 w-6 text-amber-600" />
            </div>
            <span className="text-sm text-gray-500">Quality</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{metrics.qualityScore}%</h3>
          <p className="text-sm text-gray-600 mt-1">Quality Score</p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
            <div className="bg-amber-600 h-2 rounded-full" style={{ width: `${metrics.qualityScore}%` }} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-3 border">
          <div className="flex items-center justify-between mb-2">
            <div className="p-3 bg-red-100 rounded-lg">
              <FileText className="h-6 w-6 text-red-600" />
            </div>
            <span className="text-sm text-gray-500">Pending</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{metrics.pendingInvoices}</h3>
          <p className="text-sm text-gray-600 mt-1">Pending Invoices</p>
          <button className="text-sm text-blue-600 hover:text-blue-700 mt-3">View all →</button>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-3 border">
          <div className="flex items-center justify-between mb-2">
            <div className="p-3 bg-teal-100 rounded-lg">
              <MessageSquare className="h-6 w-6 text-teal-600" />
            </div>
            <span className="text-sm text-gray-500">Communication</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{metrics.responseRate}%</h3>
          <p className="text-sm text-gray-600 mt-1">Response Rate</p>
          <div className="flex items-center gap-2 mt-3">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm text-green-600">Excellent</span>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Recent Purchase Orders
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-2">
              {purchaseOrders.slice(0, 3).map((po) => (
                <div key={po.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{po.id}</div>
                    <div className="text-sm text-gray-500 mt-1">{po.items} items • ${po.value.toLocaleString()}</div>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${po.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                      po.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                      {po.status}
                    </span>
                    <div className="text-xs text-gray-500 mt-1">Due: {po.delivery}</div>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium">
              View All Orders →
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Performance Trend
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-2">
              {performanceData.map((data) => (
                <div key={data.month} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{data.month}</div>
                    <div className="text-sm text-gray-500">{data.delivered} orders delivered</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {((data.onTime / data.delivered) * 100).toFixed(0)}%
                      </div>
                      <div className="text-xs text-gray-500">On-time</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">{data.quality}%</div>
                      <div className="text-xs text-gray-500">Quality</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium">
              View Full Report →
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const renderPurchaseOrders = () => (
    <div className="space-y-3">
      <div className="bg-white rounded-lg shadow-sm border p-3">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold">Purchase Orders</h3>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders..."
                className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button className="inline-flex items-center gap-1.5 px-3 py-2 border rounded-lg hover:bg-gray-50">
              <Filter className="h-4 w-4 text-gray-600" />
              <span className="text-gray-700">Filter</span>
            </button>
            <button className="inline-flex items-center gap-1.5 px-3 py-2 border rounded-lg hover:bg-gray-50">
              <Download className="h-4 w-4 text-gray-600" />
              <span className="text-gray-700">Download</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium text-gray-700">PO Number</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Items</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Value</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Delivery Date</th>
                <th className="text-center py-3 px-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {purchaseOrders.map((po) => (
                <tr key={po.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-900">{po.id}</div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{po.date}</td>
                  <td className="py-3 px-4 text-gray-600">{po.items}</td>
                  <td className="py-3 px-4 text-right font-medium">${po.value.toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${po.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                      po.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                      {po.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{po.delivery}</td>
                  <td className="py-3 px-4">
                    <div className="flex justify-center gap-2">
                      <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                        <Eye className="h-4 w-4 text-gray-600" />
                        <span className="text-gray-700">View</span>
                      </button>
                      <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                        <Download className="h-4 w-4 text-gray-600" />
                        <span className="text-gray-700">Download</span>
                      </button>
                      {po.status === 'In Progress' && (
                        <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-blue-300 rounded-lg hover:bg-blue-50 text-sm">
                          <Truck className="h-4 w-4 text-blue-600" />
                          <span className="text-blue-600">Track</span>
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
    </div>
  )

  const renderRFQs = () => (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Request for Quotations</h3>
        <button
          onClick={() => setShowQuoteModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New Quote
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {rfqs.map((rfq) => (
          <div key={rfq.id} className="bg-white rounded-lg shadow-sm border p-3">
            <div className="flex justify-between items-start mb-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${rfq.status === 'Open' ? 'bg-green-100 text-green-700' :
                'bg-blue-100 text-blue-700'
                }`}>
                {rfq.status}
              </span>
              <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                <Eye className="h-4 w-4 text-gray-600" />
                <span className="text-gray-700">View</span>
              </button>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">{rfq.id}</h4>
            <p className="text-sm text-gray-600 mb-2">{rfq.title}</p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Items:</span>
                <span className="font-medium">{rfq.items}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Deadline:</span>
                <span className="font-medium text-red-600">{rfq.deadline}</span>
              </div>
            </div>
            {rfq.status === 'Open' && (
              <button className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Submit Quote
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )

  const renderInvoices = () => (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Invoices</h3>
        <button
          onClick={() => setShowInvoiceModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Invoice
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Invoice #</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">PO Number</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Due Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{invoice.id}</td>
                    <td className="py-3 px-4 text-gray-600">{invoice.poNumber}</td>
                    <td className="py-3 px-4 text-gray-600">{invoice.date}</td>
                    <td className="py-3 px-4 text-right font-medium">${invoice.amount.toLocaleString()}</td>
                    <td className="py-3 px-4 text-gray-600">{invoice.dueDate}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${invoice.status === 'Paid' ? 'bg-green-100 text-green-700' :
                        invoice.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-center gap-2">
                        <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                          <Eye className="h-4 w-4 text-gray-600" />
                          <span className="text-gray-700">View</span>
                        </button>
                        <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                          <Download className="h-4 w-4 text-gray-600" />
                          <span className="text-gray-700">Download</span>
                        </button>
                        {invoice.status === 'Pending' && (
                          <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-blue-300 rounded-lg hover:bg-blue-50 text-sm">
                            <Send className="h-4 w-4 text-blue-600" />
                            <span className="text-blue-600">Send</span>
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
      </div>
    </div>
  )

  const renderProfile = () => (
    <div className="space-y-3">
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Company Profile</h3>
            <button
              onClick={() => setShowProfileEdit(!showProfileEdit)}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit Profile
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
              <input
                type="text"
                value={supplierInfo.name}
                disabled={!showProfileEdit}
                className="w-full px-3 py-2 border rounded-lg bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Supplier ID</label>
              <input
                type="text"
                value={supplierInfo.id}
                disabled
                className="w-full px-3 py-2 border rounded-lg bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <input
                type="text"
                value={supplierInfo.category}
                disabled={!showProfileEdit}
                className="w-full px-3 py-2 border rounded-lg bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <input
                type="text"
                value={supplierInfo.status}
                disabled
                className="w-full px-3 py-2 border rounded-lg bg-gray-50"
              />
            </div>
          </div>

          <div className="mt-6">
            <h4 className="font-medium text-gray-900 mb-3">Contact Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">supplier@techsupply.com</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">+1 234 567 8900</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">New York, USA</span>
              </div>
              <div className="flex items-center gap-3">
                <Globe className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">www.techsupply.com</span>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="font-medium text-gray-900 mb-3">Certifications</h4>
            <div className="flex flex-wrap gap-2">
              {supplierInfo.certifications.map((cert) => (
                <span key={cert} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                  <Shield className="h-3 w-3 inline mr-1" />
                  {cert}
                </span>
              ))}
            </div>
          </div>

          {showProfileEdit && (
            <div className="mt-6 flex gap-3">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Save Changes
              </button>
              <button
                onClick={() => setShowProfileEdit(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Documents</h3>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-gray-600" />
                <div>
                  <div className="font-medium text-gray-900">Business License</div>
                  <div className="text-sm text-gray-500">Expires: Dec 31, 2024</div>
                </div>
              </div>
              <button className="p-2 hover:bg-white rounded-lg">
                <Download className="h-4 w-4 text-gray-600" />
              </button>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-gray-600" />
                <div>
                  <div className="font-medium text-gray-900">Insurance Certificate</div>
                  <div className="text-sm text-gray-500">Expires: Jun 30, 2024</div>
                </div>
              </div>
              <button className="p-2 hover:bg-white rounded-lg">
                <Download className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          </div>
          <button className="w-full mt-4 px-4 py-2 border border-dashed border-gray-300 rounded-lg hover:border-gray-400 flex items-center justify-center gap-2">
            <Upload className="h-4 w-4" />
            Upload Document
          </button>
        </div>
      </div>
    </div>
  )

  const renderSupport = () => (
    <div className="space-y-3">
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Help & Support</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="text-center">
              <div className="p-4 bg-blue-100 rounded-lg inline-block mb-3">
                <MessageSquare className="h-8 w-8 text-blue-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Live Chat</h4>
              <p className="text-sm text-gray-600 mb-3">Chat with our support team</p>
              <button className="text-blue-600 hover:text-blue-700 font-medium">Start Chat →</button>
            </div>
            <div className="text-center">
              <div className="p-4 bg-green-100 rounded-lg inline-block mb-3">
                <Phone className="h-8 w-8 text-green-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Phone Support</h4>
              <p className="text-sm text-gray-600 mb-3">Mon-Fri, 9 AM - 6 PM</p>
              <button className="text-blue-600 hover:text-blue-700 font-medium">+1 234 567 8900</button>
            </div>
            <div className="text-center">
              <div className="p-4 bg-purple-100 rounded-lg inline-block mb-3">
                <Mail className="h-8 w-8 text-purple-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Email Support</h4>
              <p className="text-sm text-gray-600 mb-3">24/7 email assistance</p>
              <button className="text-blue-600 hover:text-blue-700 font-medium">support@company.com</button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Frequently Asked Questions</h3>
        </div>
        <div className="p-6 space-y-2">
          <div className="border-b pb-4">
            <h4 className="font-medium text-gray-900 mb-2">How do I submit a quotation?</h4>
            <p className="text-sm text-gray-600">Navigate to the RFQ section and click on any open RFQ to view details and submit your quote.</p>
          </div>
          <div className="border-b pb-4">
            <h4 className="font-medium text-gray-900 mb-2">When will I receive payment for invoices?</h4>
            <p className="text-sm text-gray-600">Payments are processed according to the agreed terms, typically within 30 days of invoice approval.</p>
          </div>
          <div className="border-b pb-4">
            <h4 className="font-medium text-gray-900 mb-2">How can I update my company information?</h4>
            <p className="text-sm text-gray-600">Go to the Profile section and click Edit Profile to update your company details.</p>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="w-full px-3">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <Building2 className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Supplier Portal</h1>
                <p className="text-sm text-gray-500">Supplier ID: {supplierInfo.id}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg relative">
                <Bell className="h-5 w-5 text-gray-600" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                  3
                </span>
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <HelpCircle className="h-5 w-5 text-gray-600" />
              </button>
              <div className="flex items-center gap-3 pl-4 border-l">
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">John Doe</div>
                  <div className="text-xs text-gray-500">Account Manager</div>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <User className="h-5 w-5 text-gray-600" />
                </button>
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-lg text-red-600">
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="w-full px-3">
          <nav className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'orders', label: 'Purchase Orders', icon: ShoppingCart },
              { id: 'rfqs', label: 'RFQs', icon: FileText },
              { id: 'invoices', label: 'Invoices', icon: CreditCard },
              { id: 'profile', label: 'Profile', icon: Building2 },
              { id: 'support', label: 'Support', icon: HelpCircle },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Real-Time Monitoring Dashboard */}
      {showRealTimeMonitoring && (
        <div className="w-full px-3 py-2">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl shadow-lg p-3 border border-indigo-200 mb-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-indigo-600" />
                Real-Time Performance Dashboard
              </h3>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  Auto-refresh
                </label>
                <button
                  onClick={() => setShowRealTimeMonitoring(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2">
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Orders This Week</span>
                  <ShoppingCart className="h-5 w-5 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">8</div>
                <div className="text-xs text-green-600 mt-1">↑ 3 vs last week</div>
              </div>

              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">On-Time Delivery</span>
                  <Truck className="h-5 w-5 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">98.5%</div>
                <div className="text-xs text-green-600 mt-1">+1.2% improvement</div>
              </div>

              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Response Time</span>
                  <Clock className="h-5 w-5 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">2.3h</div>
                <div className="text-xs text-green-600 mt-1">↓ 30min faster</div>
              </div>

              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Quality Score</span>
                  <Award className="h-5 w-5 text-amber-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">4.9/5</div>
                <div className="text-xs text-blue-600 mt-1">Excellent rating</div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-3 shadow-sm">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Recent Activity</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span className="text-gray-600">PO-2024-001 delivered on time</span>
                  <span className="text-gray-400 text-xs ml-auto">1 hour ago</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <FileText className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  <span className="text-gray-600">RFQ-2024-102 quote submitted</span>
                  <span className="text-gray-400 text-xs ml-auto">3 hours ago</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <DollarSign className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span className="text-gray-600">Invoice INV-2024-002 paid</span>
                  <span className="text-gray-400 text-xs ml-auto">1 day ago</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Star className="h-4 w-4 text-amber-600 flex-shrink-0" />
                  <span className="text-gray-600">Performance rating updated to 4.9</span>
                  <span className="text-gray-400 text-xs ml-auto">2 days ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI-Powered Insights */}
      {showAIInsights && (
        <div className="w-full px-3 pb-6">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl shadow-lg p-3 border border-purple-200 mb-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Zap className="h-5 w-5 text-purple-600" />
                AI-Powered Business Insights
              </h3>
              <button
                onClick={() => setShowAIInsights(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-semibold text-gray-900">Growth Opportunity</span>
                </div>
                <div className="text-2xl font-bold text-green-600 mb-1">+25%</div>
                <p className="text-xs text-gray-600">Projected revenue increase based on current order trends and customer feedback</p>
              </div>

              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-5 w-5 text-amber-600" />
                  <span className="text-sm font-semibold text-gray-900">Tier Upgrade</span>
                </div>
                <div className="text-2xl font-bold text-amber-600 mb-1">Gold</div>
                <p className="text-xs text-gray-600">On track to achieve Gold tier status within 2 months with current performance metrics</p>
              </div>

              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-semibold text-gray-900">Optimization Potential</span>
                </div>
                <div className="text-2xl font-bold text-green-600 mb-1">$18K</div>
                <p className="text-xs text-gray-600">Potential monthly revenue increase through pricing optimization and expanded offerings</p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-3 shadow-sm">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Smart Recommendations</h4>
              <div className="space-y-2">
                <div className="flex items-start gap-3 p-2 bg-blue-50 rounded">
                  <Award className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <span className="font-medium text-gray-900">Excellence Recognition:</span>
                    <span className="text-gray-600"> Your 98.5% on-time delivery rate exceeds industry standard - highlight in quotes for competitive advantage</span>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-2 bg-green-50 rounded">
                  <TrendingUp className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <span className="font-medium text-gray-900">Expansion Opportunity:</span>
                    <span className="text-gray-600"> 3 active RFQs match your capabilities - submit quotes to increase win rate by 40%</span>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-2 bg-amber-50 rounded">
                  <MessageSquare className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <span className="font-medium text-gray-900">Response Time Improvement:</span>
                    <span className="text-gray-600"> Reduce quote response time by 12 hours to improve conversion rate from 65% to 80%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="w-full px-3 py-2">
        {isLoading && (
          <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
            Loading purchase orders…
          </div>
        )}
        {loadError && !isLoading && (
          <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4" />
            {loadError}
          </div>
        )}
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'orders' && renderPurchaseOrders()}
        {activeTab === 'rfqs' && renderRFQs()}
        {activeTab === 'invoices' && renderInvoices()}
        {activeTab === 'profile' && renderProfile()}
        {activeTab === 'support' && renderSupport()}
      </div>

      {/* Quote Modal */}
      {showQuoteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">Submit Quotation</h3>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-2">Quote submission form would go here</p>
              <div className="flex gap-3">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Submit Quote
                </button>
                <button
                  onClick={() => setShowQuoteModal(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {showInvoiceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">Create Invoice</h3>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-2">Invoice creation form would go here</p>
              <div className="flex gap-3">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Create Invoice
                </button>
                <button
                  onClick={() => setShowInvoiceModal(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}