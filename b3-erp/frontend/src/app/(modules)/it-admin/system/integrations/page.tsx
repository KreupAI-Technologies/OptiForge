'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Save, CheckCircle, XCircle, Settings, Globe, Database, Cloud, Package, CreditCard, Truck, MessageSquare, RefreshCw, AlertTriangle, Link } from 'lucide-react';
import { AdminManagementService } from '@/services/admin-management.service';

interface Integration {
  id: string;
  name: string;
  category: 'erp' | 'payment' | 'shipping' | 'communication' | 'storage' | 'analytics';
  description: string;
  status: 'active' | 'inactive' | 'error' | 'configured';
  icon: string;
  config: {
    apiKey?: string;
    apiSecret?: string;
    webhookUrl?: string;
    authToken?: string;
    baseUrl?: string;
    [key: string]: any;
  };
  lastSync?: string;
  syncFrequency?: string;
  features: string[];
}

export default function IntegrationsPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);

  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await AdminManagementService.getIntegrations();
        if (!mounted) return;
        setIntegrations(
          (Array.isArray(data) ? data : []).map((i: any) => ({
            id: String(i.id),
            name: i.name ?? '',
            category: (i.category as Integration['category']) ?? 'erp',
            description: i.description ?? '',
            status: (i.status as Integration['status']) ?? 'inactive',
            icon: i.icon ?? 'globe',
            config: (i.config as Integration['config']) ?? {},
            lastSync: i.lastSync,
            syncFrequency: i.syncFrequency,
            features: Array.isArray(i.features) ? i.features : [],
          })),
        );
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : 'Failed to load integrations');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const categories = [
    { id: 'all', name: 'All Integrations', icon: Package, count: integrations.length },
    { id: 'erp', name: 'ERP Systems', icon: Database, count: integrations.filter(i => i.category === 'erp').length },
    { id: 'payment', name: 'Payment Gateways', icon: CreditCard, count: integrations.filter(i => i.category === 'payment').length },
    { id: 'shipping', name: 'Shipping & Logistics', icon: Truck, count: integrations.filter(i => i.category === 'shipping').length },
    { id: 'communication', name: 'Communication', icon: MessageSquare, count: integrations.filter(i => i.category === 'communication').length },
    { id: 'storage', name: 'Cloud Storage', icon: Cloud, count: integrations.filter(i => i.category === 'storage').length },
    { id: 'analytics', name: 'Analytics', icon: Globe, count: integrations.filter(i => i.category === 'analytics').length }
  ];

  const getIcon = (iconName: string) => {
    const iconMap: { [key: string]: any } = {
      'database': Database,
      'credit-card': CreditCard,
      'truck': Truck,
      'message-square': MessageSquare,
      'cloud': Cloud,
      'globe': Globe
    };
    const IconComponent = iconMap[iconName] || Package;
    return IconComponent;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-700 border-green-300',
      inactive: 'bg-gray-100 text-gray-700 border-gray-300',
      error: 'bg-red-100 text-red-700 border-red-300',
      configured: 'bg-blue-100 text-blue-700 border-blue-300'
    };
    return colors[status as keyof typeof colors] || colors.inactive;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4" />;
      case 'inactive':
        return <XCircle className="w-4 h-4" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4" />;
      case 'configured':
        return <Settings className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const filteredIntegrations = selectedCategory === 'all'
    ? integrations
    : integrations.filter(i => i.category === selectedCategory);

  const stats = {
    total: integrations.length,
    active: integrations.filter(i => i.status === 'active').length,
    configured: integrations.filter(i => i.status === 'configured').length,
    errors: integrations.filter(i => i.status === 'error').length
  };

  const handleSync = (integrationId: string) => {
    console.log('Syncing integration:', integrationId);
    // Implement sync logic
  };

  const handleToggleStatus = (integrationId: string) => {
    setIntegrations(prev =>
      prev.map(integration =>
        integration.id === integrationId
          ? {
            ...integration,
            status: integration.status === 'active' ? 'inactive' : 'active'
          }
          : integration
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 px-3 py-2 w-full max-w-full">
      <div className="mb-3 flex items-center gap-2">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">System Integrations</h1>
          <p className="text-sm text-gray-500 mt-1">Manage third-party integrations and API connections</p>
        </div>
        <button className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Integration
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Integrations</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <Settings className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Configured</p>
              <p className="text-2xl font-bold text-blue-600">{stats.configured}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-50 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Errors</p>
              <p className="text-2xl font-bold text-red-600">{stats.errors}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
        {/* Categories */}
        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Categories</h2>
          <div className="space-y-2">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-all ${selectedCategory === category.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                    }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <IconComponent className={`w-4 h-4 ${selectedCategory === category.id ? 'text-blue-600' : 'text-gray-600'}`} />
                    <p className="font-medium text-gray-900 text-sm">{category.name}</p>
                  </div>
                  <p className="text-xs text-gray-600">{category.count} integrations</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Integrations List */}
        <div className="lg:col-span-3 space-y-2">
          {filteredIntegrations.map((integration) => {
            const IconComponent = getIcon(integration.icon);
            return (
              <div key={integration.id} className="bg-white rounded-xl border border-gray-200 p-3">
                <div className="flex items-start gap-2">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <IconComponent className="w-8 h-8 text-gray-700" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-gray-900">{integration.name}</h3>
                          <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(integration.status)}`}>
                            {getStatusIcon(integration.status)}
                            {integration.status.charAt(0).toUpperCase() + integration.status.slice(1)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{integration.description}</p>
                      </div>

                      <div className="flex gap-2">
                        {integration.status === 'active' && (
                          <button
                            onClick={() => handleSync(integration.id)}
                            className="p-2 hover:bg-gray-100 rounded-lg"

                          >
                            <RefreshCw className="w-5 h-5 text-gray-600" />
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedIntegration(integration.id)}
                          className="p-2 hover:bg-gray-100 rounded-lg"

                        >
                          <Settings className="w-5 h-5 text-gray-600" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(integration.id)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium ${integration.status === 'active'
                              ? 'bg-red-50 text-red-700 hover:bg-red-100'
                              : 'bg-green-50 text-green-700 hover:bg-green-100'
                            }`}
                        >
                          {integration.status === 'active' ? 'Disable' : 'Enable'}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4">
                      <div>
                        <p className="text-xs font-semibold text-gray-600 mb-2">Features:</p>
                        <div className="flex flex-wrap gap-1">
                          {integration.features.map((feature, index) => (
                            <span key={index} className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs">
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>

                      {integration.lastSync && (
                        <div>
                          <p className="text-xs font-semibold text-gray-600 mb-1">Last Sync:</p>
                          <p className="text-sm text-gray-900">{integration.lastSync}</p>
                          <p className="text-xs text-gray-500">Frequency: {integration.syncFrequency}</p>
                        </div>
                      )}
                    </div>

                    {integration.status === 'error' && (
                      <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-red-900">Connection Error</p>
                          <p className="text-xs text-red-700">Authentication failed. Please check your API credentials.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {filteredIntegrations.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <Package className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-gray-600 font-medium">No integrations found</p>
              <p className="text-sm text-gray-500">Try selecting a different category</p>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-3">
              <Link className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-blue-900 mb-1">Integration Best Practices</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Store API credentials securely using environment variables</li>
                  <li>• Test integrations in staging before enabling in production</li>
                  <li>• Monitor sync status and set up alerts for failures</li>
                  <li>• Regularly review and rotate API keys for security</li>
                  <li>• Document integration workflows and data mappings</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
