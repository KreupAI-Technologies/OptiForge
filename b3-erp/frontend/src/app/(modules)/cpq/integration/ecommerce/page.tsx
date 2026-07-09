'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { cpqIntegrationEndpointService } from '@/services/cpq/cpq-orphans.service';
import {
  ShoppingCart,
  Globe,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Settings,
  TrendingUp,
  Users,
  Package,
  DollarSign,
  Link,
  Zap,
  Clock,
  Activity,
  Search,
  Filter,
  ExternalLink,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

interface EcommercePlatform {
  id: number;
  name: string;
  type: 'Shopify' | 'WooCommerce' | 'Magento' | 'Custom';
  status: 'connected' | 'disconnected' | 'error';
  url: string;
  lastSync: string;
  ordersImported: number;
}

interface WebQuote {
  id: number;
  quoteId: string;
  customerName: string;
  email: string;
  platform: string;
  productCount: number;
  totalValue: number;
  status: 'pending' | 'converted' | 'expired';
  submittedDate: string;
}

interface ProductSync {
  id: number;
  productCode: string;
  productName: string;
  cpqPrice: number;
  webPrice: number;
  syncStatus: 'synced' | 'pending' | 'mismatch';
  lastUpdated: string;
}

interface SyncLog {
  id: number;
  timestamp: string;
  action: string;
  platform: string;
  status: 'success' | 'failed';
  records: number;
  message: string;
}

export default function CPQIntegrationEcommercePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');

  // Ecommerce Platforms State
  const [platforms, setPlatforms] = useState<EcommercePlatform[]>([]);

  useEffect(() => {
    let active = true;
    cpqIntegrationEndpointService
      .findAll({ system: 'ecommerce' })
      .then((rows) => {
        if (!active) return;
        const mapped: EcommercePlatform[] = (Array.isArray(rows) ? rows : []).map((r, idx) => ({
          id: idx + 1,
          name: r.name ?? '',
          type: (r.type ?? 'Custom') as EcommercePlatform['type'],
          status: (r.status ?? 'connected') as EcommercePlatform['status'],
          url: (r.metadata as any)?.url ?? '',
          lastSync: r.lastSync ?? '',
          ordersImported: Number(r.recordCount) || 0
        }));
        setPlatforms(mapped);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  // Web Quotes State
  const [webQuotes, setWebQuotes] = useState<WebQuote[]>([
    {
      id: 1,
      quoteId: 'WQ-2025-00234',
      customerName: 'Industrial Solutions Inc.',
      email: 'procurement@industrial.com',
      platform: 'B2B Portal',
      productCount: 5,
      totalValue: 285000,
      status: 'pending',
      submittedDate: '2025-01-20 15:20'
    },
    {
      id: 2,
      quoteId: 'WQ-2025-00233',
      customerName: 'Manufacturing Co.',
      email: 'buyer@mfgco.com',
      platform: 'Shopify',
      productCount: 3,
      totalValue: 145000,
      status: 'converted',
      submittedDate: '2025-01-20 14:45'
    },
    {
      id: 3,
      quoteId: 'WQ-2025-00232',
      customerName: 'Tech Industries Ltd.',
      email: 'orders@techindustries.com',
      platform: 'B2B Portal',
      productCount: 8,
      totalValue: 420000,
      status: 'pending',
      submittedDate: '2025-01-20 13:30'
    },
    {
      id: 4,
      quoteId: 'WQ-2025-00231',
      customerName: 'Precision Parts Inc.',
      email: 'quotes@precisionparts.com',
      platform: 'WooCommerce',
      productCount: 2,
      totalValue: 85000,
      status: 'expired',
      submittedDate: '2025-01-15 10:20'
    }
  ]);

  // Product Sync State
  const [productSync, setProductSync] = useState<ProductSync[]>([
    {
      id: 1,
      productCode: 'HP-1000',
      productName: 'Hydraulic Press 100T',
      cpqPrice: 450000,
      webPrice: 450000,
      syncStatus: 'synced',
      lastUpdated: '2025-01-20 15:30'
    },
    {
      id: 2,
      productCode: 'CS-500',
      productName: 'Conveyor System 5m',
      cpqPrice: 125000,
      webPrice: 125000,
      syncStatus: 'synced',
      lastUpdated: '2025-01-20 15:30'
    },
    {
      id: 3,
      productCode: 'RA-200',
      productName: 'Robotic Arm 6-Axis',
      cpqPrice: 850000,
      webPrice: 820000,
      syncStatus: 'mismatch',
      lastUpdated: '2025-01-20 12:00'
    },
    {
      id: 4,
      productCode: 'GB-300',
      productName: 'Gearbox Assembly',
      cpqPrice: 65000,
      webPrice: 65000,
      syncStatus: 'synced',
      lastUpdated: '2025-01-20 15:30'
    },
    {
      id: 5,
      productCode: 'MH-150',
      productName: 'Motor Housing',
      cpqPrice: 32000,
      webPrice: 0,
      syncStatus: 'pending',
      lastUpdated: '2025-01-20 10:15'
    }
  ]);

  // Sync Logs State
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([
    {
      id: 1,
      timestamp: '2025-01-20 15:30',
      action: 'Product Price Sync',
      platform: 'Shopify',
      status: 'success',
      records: 125,
      message: 'All products synchronized successfully'
    },
    {
      id: 2,
      timestamp: '2025-01-20 15:25',
      action: 'Quote Import',
      platform: 'B2B Portal',
      status: 'success',
      records: 3,
      message: '3 new quote requests imported'
    },
    {
      id: 3,
      timestamp: '2025-01-20 14:45',
      action: 'Inventory Update',
      platform: 'WooCommerce',
      status: 'success',
      records: 87,
      message: 'Stock levels updated'
    },
    {
      id: 4,
      timestamp: '2025-01-20 12:30',
      action: 'Product Price Sync',
      platform: 'B2B Portal',
      status: 'failed',
      records: 0,
      message: 'API connection timeout'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
      case 'synced':
      case 'success':
      case 'converted':
        return 'text-green-600 bg-green-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'mismatch':
        return 'text-orange-600 bg-orange-50';
      case 'disconnected':
      case 'expired':
        return 'text-gray-600 bg-gray-50';
      case 'error':
      case 'failed':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
      case 'synced':
      case 'success':
      case 'converted':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
      case 'mismatch':
        return <Clock className="w-4 h-4" />;
      case 'disconnected':
      case 'expired':
        return <AlertCircle className="w-4 h-4" />;
      case 'error':
      case 'failed':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const renderOverview = () => (
    <div className="space-y-3">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <Globe className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-blue-900">3</span>
          </div>
          <div className="text-sm font-medium text-blue-700">Connected Platforms</div>
          <div className="text-xs text-blue-600 mt-1">All Active</div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <ShoppingCart className="w-8 h-8 text-green-600" />
            <span className="text-2xl font-bold text-green-900">2,982</span>
          </div>
          <div className="text-sm font-medium text-green-700">Web Quotes</div>
          <div className="text-xs text-green-600 mt-1 flex items-center space-x-1">
            <ArrowUpRight className="w-3 h-3" />
            <span>+12% this month</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-purple-600" />
            <span className="text-2xl font-bold text-purple-900">68%</span>
          </div>
          <div className="text-sm font-medium text-purple-700">Conversion Rate</div>
          <div className="text-xs text-purple-600 mt-1">Web to Quote</div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 text-orange-600" />
            <span className="text-2xl font-bold text-orange-900">₹8.5Cr</span>
          </div>
          <div className="text-sm font-medium text-orange-700">Web Revenue</div>
          <div className="text-xs text-orange-600 mt-1">This Quarter</div>
        </div>
      </div>

      {/* Connected Platforms */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-3 py-2 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Connected E-commerce Platforms</h3>
        </div>
        <div className="p-6">
          <div className="space-y-2">
            {platforms.map((platform) => (
              <div key={platform.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Globe className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{platform.name}</div>
                    <div className="text-sm text-gray-600">{platform.type} • {platform.url}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Orders Imported</div>
                    <div className="font-semibold text-gray-900">{platform.ordersImported.toLocaleString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Last Sync</div>
                    <div className="font-semibold text-gray-900">{platform.lastSync}</div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${getStatusColor(platform.status)}`}>
                    {getStatusIcon(platform.status)}
                    <span className="capitalize">{platform.status}</span>
                  </div>
                  <button
                    className="p-2 hover:bg-gray-100 rounded-lg"
                    aria-label="Settings"
                   
                  >
                    <Settings className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Sync Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-3 py-2 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Sync Activity</h3>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            {syncLogs.slice(0, 5).map((log) => (
              <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${getStatusColor(log.status)}`}>
                    {getStatusIcon(log.status)}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{log.action}</div>
                    <div className="text-sm text-gray-600">{log.platform} • {log.message}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">{log.timestamp}</div>
                  <div className="text-xs text-gray-500">{log.records} records</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderWebQuotes = () => (
    <div className="space-y-3">
      {/* Search and Filters */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search web quotes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={selectedPlatform}
          onChange={(e) => setSelectedPlatform(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Platforms</option>
          <option value="Shopify">Shopify</option>
          <option value="B2B Portal">B2B Portal</option>
          <option value="WooCommerce">WooCommerce</option>
        </select>
      </div>

      {/* Web Quotes Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quote ID</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Platform</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {webQuotes.map((quote) => (
              <tr key={quote.id} className="hover:bg-gray-50">
                <td className="px-3 py-2 whitespace-nowrap">
                  <button
                    onClick={() =>
                      router.push(`/cpq/quotes/view/${encodeURIComponent(quote.quoteId)}`)
                    }
                    className="text-sm font-medium text-blue-600 hover:underline"
                    title="View quote detail"
                  >
                    {quote.quoteId}
                  </button>
                </td>
                <td className="px-3 py-2">
                  <div className="text-sm font-medium text-gray-900">{quote.customerName}</div>
                  <div className="text-xs text-gray-500">{quote.email}</div>
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">{quote.platform}</td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{quote.productCount} items</td>
                <td className="px-3 py-2 whitespace-nowrap text-sm font-semibold text-gray-900">
                  ₹{quote.totalValue.toLocaleString()}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">{quote.submittedDate}</td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 w-fit ${getStatusColor(quote.status)}`}>
                    {getStatusIcon(quote.status)}
                    <span className="capitalize">{quote.status}</span>
                  </span>
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm">
                  <button className="text-blue-600 hover:text-blue-800 font-medium">Convert to Quote</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderPricingSync = () => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Product Price Synchronization</h3>
          <p className="text-sm text-gray-600 mt-1">Monitor and sync pricing between CPQ and e-commerce platforms</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
          <RefreshCw className="w-4 h-4" />
          <span>Sync All Prices</span>
        </button>
      </div>

      {/* Product Sync Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Code</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CPQ Price</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Web Price</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Difference</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {productSync.map((product) => {
              const difference = product.webPrice - product.cpqPrice;
              const percentDiff = product.cpqPrice > 0 ? ((difference / product.cpqPrice) * 100).toFixed(1) : 0;
              
              return (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{product.productCode}</td>
                  <td className="px-3 py-2 text-sm text-gray-900">{product.productName}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-semibold text-gray-900">
                    ₹{product.cpqPrice.toLocaleString()}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-semibold text-gray-900">
                    {product.webPrice > 0 ? `₹${product.webPrice.toLocaleString()}` : '-'}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm">
                    {difference !== 0 && product.webPrice > 0 ? (
                      <span className={difference > 0 ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
                        {difference > 0 ? '+' : ''}₹{difference.toLocaleString()} ({percentDiff}%)
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 w-fit ${getStatusColor(product.syncStatus)}`}>
                      {getStatusIcon(product.syncStatus)}
                      <span className="capitalize">{product.syncStatus}</span>
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">{product.lastUpdated}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm">
                    <button className="text-blue-600 hover:text-blue-800 font-medium">Sync Now</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-3">
      <div className="bg-white rounded-lg shadow">
        <div className="px-3 py-2 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">E-commerce Integration Settings</h3>
        </div>
        <div className="p-6 space-y-3">
          {/* Sync Settings */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Synchronization Settings</h4>
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                <span className="text-sm text-gray-700">Auto-sync prices to web platforms</span>
              </label>
              <label className="flex items-center space-x-3">
                <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                <span className="text-sm text-gray-700">Import web quote requests automatically</span>
              </label>
              <label className="flex items-center space-x-3">
                <input type="checkbox" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                <span className="text-sm text-gray-700">Sync inventory levels in real-time</span>
              </label>
              <label className="flex items-center space-x-3">
                <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                <span className="text-sm text-gray-700">Enable online product configurator</span>
              </label>
            </div>
          </div>

          {/* Pricing Rules */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Web Pricing Rules</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Web Markup (%)</label>
                <input
                  type="number"
                  defaultValue="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Order Value</label>
                <input
                  type="number"
                  defaultValue="50000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Platform API Keys */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Platform API Configuration</h4>
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Shopify API Key</label>
                <input
                  type="password"
                  defaultValue="••••••••••••••••"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">WooCommerce Consumer Key</label>
                <input
                  type="password"
                  defaultValue="••••••••••••••••"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">B2B Portal Webhook URL</label>
                <input
                  type="text"
                  defaultValue="https://api.b3manufacturing.com/webhooks/quotes"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span>Save Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'quotes', label: 'Web Quotes', icon: ShoppingCart },
    { id: 'pricing', label: 'Price Sync', icon: DollarSign },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <ShoppingCart className="w-8 h-8 text-blue-600" />
            <span>E-commerce Integration</span>
          </h1>
          <p className="text-gray-600 mt-1">Manage web store integration and online quote requests</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
          <RefreshCw className="w-4 h-4" />
          <span>Sync All</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <div className="flex space-x-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-2 text-sm font-medium whitespace-nowrap flex items-center space-x-2 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'quotes' && renderWebQuotes()}
          {activeTab === 'pricing' && renderPricingSync()}
          {activeTab === 'settings' && renderSettings()}
        </div>
      </div>
    </div>
  );
}
