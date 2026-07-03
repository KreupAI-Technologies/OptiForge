'use client'

import { useEffect, useState } from 'react'
import { cpqIntegrationEndpointService } from '@/services/cpq/cpq-orphans.service'
import {
  Database,
  CheckCircle,
  XCircle,
  RefreshCw,
  Settings,
  Eye,
  AlertCircle,
  Activity,
  ShoppingCart,
  Package,
  DollarSign,
  FileText,
  ArrowRight,
  Play,
  Pause,
  TrendingUp
} from 'lucide-react'

export default function CPQIntegrationERPPage() {
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success'>('idle')
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'inventory' | 'pricing' | 'logs'>('overview')

  // Integration Status
  const integrationStatus = {
    connected: true,
    erpSystem: 'SAP ERP',
    lastSync: '2025-10-20 14:35:00',
    syncMode: 'Bi-directional',
    ordersToday: 45,
    inventoryItems: 2847,
    priceUpdates: 128,
    glPostings: 67
  }

  // Order Sync Status
  const [orderSync, setOrderSync] = useState<any[]>([
    {
      id: 1,
      quoteNumber: 'QT-25-00267',
      orderNumber: 'SO-2025-1842',
      customer: 'Premium Interiors Ltd',
      value: 485000,
      status: 'synced',
      syncedAt: '2025-10-20 14:30:00',
      erpStatus: 'Confirmed'
    },
    {
      id: 2,
      quoteNumber: 'QT-25-00266',
      orderNumber: 'SO-2025-1841',
      customer: 'Design Studio Pro',
      value: 325000,
      status: 'synced',
      syncedAt: '2025-10-20 14:25:00',
      erpStatus: 'In Production'
    },
    {
      id: 3,
      quoteNumber: 'QT-25-00265',
      orderNumber: 'Pending',
      customer: 'Elite Spaces',
      value: 682000,
      status: 'pending',
      syncedAt: null,
      erpStatus: 'Not Created'
    },
    {
      id: 4,
      quoteNumber: 'QT-25-00264',
      orderNumber: 'SO-2025-1840',
      customer: 'Modern Living Co',
      value: 225000,
      status: 'failed',
      syncedAt: '2025-10-20 14:20:00',
      erpStatus: 'Error'
    },
    {
      id: 5,
      quoteNumber: 'QT-25-00263',
      orderNumber: 'SO-2025-1839',
      customer: 'Corporate Furnishings',
      value: 892000,
      status: 'synced',
      syncedAt: '2025-10-20 14:15:00',
      erpStatus: 'Ready to Ship'
    }
  ])

  useEffect(() => {
    let active = true
    cpqIntegrationEndpointService
      .findAll({ system: 'erp' })
      .then((rows) => {
        if (!active) return
        if (!Array.isArray(rows) || rows.length === 0) return
        const mapped = rows.map((r, idx) => {
          const m = (r.metadata ?? {}) as any
          return {
            id: idx + 1,
            quoteNumber: m.quoteNumber ?? '',
            orderNumber: m.orderNumber ?? r.name ?? '',
            customer: m.customer ?? '',
            value: Number(m.value) || 0,
            status: r.status ?? 'synced',
            syncedAt: r.lastSync ?? null,
            erpStatus: m.erpStatus ?? ''
          }
        })
        setOrderSync(mapped)
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [])

  // Inventory Sync
  const inventoryItems = [
    { sku: 'MK-MOD-001', name: 'Modular Kitchen Base Unit', cpqQty: 145, erpQty: 145, status: 'synced', lastCheck: '5 min ago' },
    { sku: 'WR-SLD-002', name: 'Sliding Wardrobe System', cpqQty: 89, erpQty: 89, status: 'synced', lastCheck: '5 min ago' },
    { sku: 'LR-TV-003', name: 'TV Unit Premium', cpqQty: 62, erpQty: 60, status: 'mismatch', lastCheck: '5 min ago' },
    { sku: 'OF-DSK-004', name: 'Executive Desk', cpqQty: 34, erpQty: 34, status: 'synced', lastCheck: '5 min ago' },
    { sku: 'BT-VAN-005', name: 'Bathroom Vanity Unit', cpqQty: 78, erpQty: 78, status: 'synced', lastCheck: '5 min ago' }
  ]

  // Pricing Updates
  const pricingUpdates = [
    { productCode: 'MK-MOD-001', productName: 'Modular Kitchen Base Unit', oldPrice: 45000, newPrice: 47000, change: 4.4, updatedAt: '2025-10-20 09:00:00', status: 'applied' },
    { productCode: 'WR-SLD-002', productName: 'Sliding Wardrobe System', oldPrice: 68000, newPrice: 65000, change: -4.4, updatedAt: '2025-10-20 09:00:00', status: 'applied' },
    { productCode: 'LR-TV-003', productName: 'TV Unit Premium', oldPrice: 32000, newPrice: 33500, change: 4.7, updatedAt: '2025-10-20 09:00:00', status: 'applied' },
    { productCode: 'OF-DSK-004', productName: 'Executive Desk', oldPrice: 55000, newPrice: 58000, change: 5.5, updatedAt: '2025-10-20 09:00:00', status: 'pending' },
    { productCode: 'BT-VAN-005', productName: 'Bathroom Vanity Unit', oldPrice: 28000, newPrice: 27000, change: -3.6, updatedAt: '2025-10-20 09:00:00', status: 'applied' }
  ]

  // GL Postings
  const glPostings = [
    { id: 1, orderNumber: 'SO-2025-1842', type: 'Revenue', account: '4000 - Sales Revenue', amount: 485000, status: 'posted', postedAt: '2025-10-20 14:30:00' },
    { id: 2, orderNumber: 'SO-2025-1842', type: 'Tax', account: '2100 - GST Payable', amount: 87300, status: 'posted', postedAt: '2025-10-20 14:30:00' },
    { id: 3, orderNumber: 'SO-2025-1841', type: 'Revenue', account: '4000 - Sales Revenue', amount: 325000, status: 'posted', postedAt: '2025-10-20 14:25:00' },
    { id: 4, orderNumber: 'SO-2025-1841', type: 'Tax', account: '2100 - GST Payable', amount: 58500, status: 'posted', postedAt: '2025-10-20 14:25:00' },
    { id: 5, orderNumber: 'SO-2025-1840', type: 'Revenue', account: '4000 - Sales Revenue', amount: 225000, status: 'failed', postedAt: '2025-10-20 14:20:00' }
  ]

  // Sync Logs
  const syncLogs = [
    { id: 1, timestamp: '2025-10-20 14:35:12', operation: 'Order Sync', entity: 'SO-2025-1842', status: 'success', message: 'Order created and confirmed in ERP' },
    { id: 2, timestamp: '2025-10-20 14:30:45', operation: 'Inventory Check', entity: 'Bulk Check (2847 items)', status: 'success', message: 'All inventory quantities synced' },
    { id: 3, timestamp: '2025-10-20 14:25:22', operation: 'GL Posting', entity: 'SO-2025-1841', status: 'success', message: 'Revenue and tax posted to GL' },
    { id: 4, timestamp: '2025-10-20 14:20:18', operation: 'Order Sync', entity: 'SO-2025-1840', status: 'error', message: 'Customer credit limit exceeded' },
    { id: 5, timestamp: '2025-10-20 09:00:00', operation: 'Price Update', entity: 'Batch Update (128 items)', status: 'success', message: 'Price master synced from ERP' }
  ]

  const handleManualSync = () => {
    setSyncStatus('syncing')
    setTimeout(() => {
      setSyncStatus('success')
      setTimeout(() => setSyncStatus('idle'), 2000)
    }, 2000)
  }

  return (
    <div className="w-full h-full px-4 py-2">
      {/* Header */}
      <div className="mb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">ERP Integration</h2>
          <p className="text-sm text-gray-600 mt-1">Seamless integration with ERP for orders, inventory, pricing, and GL</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleManualSync}
            disabled={syncStatus === 'syncing'}
            className={`px-4 py-2 text-white rounded-lg flex items-center gap-2 ${
              syncStatus === 'syncing'
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {syncStatus === 'syncing' ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Sync Now
              </>
            )}
          </button>
          <button className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configure
          </button>
        </div>
      </div>

      {/* Connection Status */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-3 mb-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-green-600">Connection</p>
              {integrationStatus.connected ? (
                <CheckCircle className="h-6 w-6 text-green-600" />
              ) : (
                <XCircle className="h-6 w-6 text-red-600" />
              )}
            </div>
            <p className="text-2xl font-bold text-green-900">Active</p>
            <p className="text-xs text-green-700 mt-1">ERP: {integrationStatus.erpSystem}</p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-blue-600">Orders Today</p>
              <ShoppingCart className="h-6 w-6 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-blue-900">{integrationStatus.ordersToday}</p>
            <p className="text-xs text-blue-700 mt-1">Synced to ERP</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-purple-600">Inventory Items</p>
              <Package className="h-6 w-6 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-purple-900">{integrationStatus.inventoryItems}</p>
            <p className="text-xs text-purple-700 mt-1">Real-time sync</p>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-orange-600">GL Postings</p>
              <FileText className="h-6 w-6 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-orange-900">{integrationStatus.glPostings}</p>
            <p className="text-xs text-orange-700 mt-1">Today</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-3 border-b border-gray-200">
        <div className="flex gap-3">
          {['overview', 'orders', 'inventory', 'pricing', 'logs'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Integration Points */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-3">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Database className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Integration Points</h3>
                <p className="text-sm text-gray-600">Active data flows</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-3">
                  <ShoppingCart className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">Order Sync</p>
                    <p className="text-xs text-gray-600">Quote → Sales Order</p>
                  </div>
                </div>
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-3">
                  <Package className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">Inventory Check</p>
                    <p className="text-xs text-gray-600">Real-time availability</p>
                  </div>
                </div>
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">Price Master</p>
                    <p className="text-xs text-gray-600">ERP → CPQ sync</p>
                  </div>
                </div>
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">GL Posting</p>
                    <p className="text-xs text-gray-600">Revenue recognition</p>
                  </div>
                </div>
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-3">
                  <Database className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">Master Data</p>
                    <p className="text-xs text-gray-600">Products, customers, vendors</p>
                  </div>
                </div>
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-3">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
                <p className="text-sm text-gray-600">Last 5 sync operations</p>
              </div>
            </div>

            <div className="space-y-3">
              {syncLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  {log.status === 'success' ? (
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">{log.operation}</p>
                    <p className="text-xs text-gray-600">{log.entity}</p>
                    <p className="text-xs text-gray-500 mt-1">{log.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-3">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Order Synchronization</h3>
              <p className="text-sm text-gray-600">Quote to sales order sync status</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Quote #</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Order #</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Customer</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Value</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Sync Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">ERP Status</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orderSync.map((order) => (
                  <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <span className="font-mono text-sm text-blue-600">{order.quoteNumber}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-sm text-purple-600">{order.orderNumber}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-gray-900">{order.customer}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-bold text-gray-900">₹{(order.value / 1000).toFixed(0)}K</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        order.status === 'synced' ? 'bg-green-100 text-green-700' :
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-gray-900">{order.erpStatus}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        aria-label="View"
                       
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Inventory Tab */}
      {activeTab === 'inventory' && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-3">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Package className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Inventory Sync Status</h3>
              <p className="text-sm text-gray-600">Real-time inventory availability check</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">SKU</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Product Name</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">CPQ Qty</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">ERP Qty</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Last Check</th>
                </tr>
              </thead>
              <tbody>
                {inventoryItems.map((item, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <span className="font-mono text-sm text-blue-600">{item.sku}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-gray-900">{item.name}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-bold text-gray-900">{item.cpqQty}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-bold text-gray-900">{item.erpQty}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {item.status === 'synced' ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-yellow-600" />
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs text-gray-500">{item.lastCheck}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pricing Tab */}
      {activeTab === 'pricing' && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-3">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Pricing Updates</h3>
              <p className="text-sm text-gray-600">Latest price master sync from ERP</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Product Code</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Product Name</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Old Price</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">New Price</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Change</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {pricingUpdates.map((price, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <span className="font-mono text-sm text-blue-600">{price.productCode}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-gray-900">{price.productName}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-gray-600">₹{price.oldPrice.toLocaleString()}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-bold text-gray-900">₹{price.newPrice.toLocaleString()}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <TrendingUp className={`h-4 w-4 ${price.change > 0 ? 'text-green-600 rotate-0' : 'text-red-600 rotate-180'}`} />
                        <span className={`font-bold ${price.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {Math.abs(price.change)}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        price.status === 'applied' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {price.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Logs Tab */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-3">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Activity className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Sync Logs</h3>
              <p className="text-sm text-gray-600">Complete synchronization history</p>
            </div>
          </div>

          <div className="space-y-3">
            {syncLogs.map((log) => (
              <div key={log.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {log.status === 'success' ? (
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <p className="font-medium text-gray-900">{log.operation}</p>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded font-medium">
                          {log.entity}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{log.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{log.timestamp}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
