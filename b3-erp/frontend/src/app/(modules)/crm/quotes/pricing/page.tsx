'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Edit, Trash2, ToggleLeft, ToggleRight, Percent, DollarSign, Users, Package, Calendar, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui';
import { crmService } from '@/services/crm.service';

interface PricingRule {
  id: string;
  name: string;
  description: string;
  ruleType: 'volume' | 'customer' | 'product' | 'seasonal' | 'bundle' | 'time-limited';
  discountType: 'percentage' | 'fixed' | 'tiered';
  discountValue: number;
  conditions: string[];
  priority: number;
  isActive: boolean;
  applicableProducts: string[];
  applicableCustomers: string[];
  validFrom: string;
  validUntil?: string;
  usageCount: number;
  totalSavings: number;
  createdDate: string;
}

const mockRules: PricingRule[] = [
  {
    id: '1',
    name: 'Enterprise Volume Discount',
    description: 'Automatic discount for orders over 100 licenses',
    ruleType: 'volume',
    discountType: 'tiered',
    discountValue: 15,
    conditions: ['Order quantity > 100', 'Product category: Software'],
    priority: 1,
    isActive: true,
    applicableProducts: ['All Software Products'],
    applicableCustomers: ['All Customers'],
    validFrom: '2024-01-01',
    usageCount: 45,
    totalSavings: 156000,
    createdDate: '2024-01-01',
  },
  {
    id: '2',
    name: 'Premium Customer Pricing',
    description: 'Special pricing for VIP and enterprise customers',
    ruleType: 'customer',
    discountType: 'percentage',
    discountValue: 20,
    conditions: ['Customer tier: VIP or Enterprise', 'Annual revenue > $100K'],
    priority: 2,
    isActive: true,
    applicableProducts: ['All Products'],
    applicableCustomers: ['VIP Segment', 'Enterprise Segment'],
    validFrom: '2024-01-01',
    usageCount: 78,
    totalSavings: 284000,
    createdDate: '2023-11-15',
  },
  {
    id: '3',
    name: 'Q4 Holiday Promotion',
    description: 'Limited time holiday discount across all products',
    ruleType: 'seasonal',
    discountType: 'percentage',
    discountValue: 25,
    conditions: ['Date range: Nov 15 - Dec 31', 'All products included'],
    priority: 3,
    isActive: false,
    applicableProducts: ['All Products'],
    applicableCustomers: ['All Customers'],
    validFrom: '2024-11-15',
    validUntil: '2024-12-31',
    usageCount: 0,
    totalSavings: 0,
    createdDate: '2024-10-01',
  },
  {
    id: '4',
    name: 'Software + Training Bundle',
    description: 'Discount when purchasing software with training package',
    ruleType: 'bundle',
    discountType: 'percentage',
    discountValue: 10,
    conditions: ['Includes: Software License', 'Includes: Training Package'],
    priority: 4,
    isActive: true,
    applicableProducts: ['Enterprise Software', 'Training Package'],
    applicableCustomers: ['All Customers'],
    validFrom: '2024-03-01',
    usageCount: 32,
    totalSavings: 42000,
    createdDate: '2024-02-15',
  },
  {
    id: '5',
    name: 'New Customer Welcome',
    description: 'First-time customer discount',
    ruleType: 'customer',
    discountType: 'fixed',
    discountValue: 500,
    conditions: ['Customer type: New', 'First order only'],
    priority: 5,
    isActive: true,
    applicableProducts: ['All Products'],
    applicableCustomers: ['New Customers'],
    validFrom: '2024-01-01',
    usageCount: 64,
    totalSavings: 32000,
    createdDate: '2024-01-10',
  },
  {
    id: '6',
    name: 'End of Month Flash Sale',
    description: 'Last 3 days of month pricing boost',
    ruleType: 'time-limited',
    discountType: 'percentage',
    discountValue: 12,
    conditions: ['Days 28-31 of month', 'Recurring monthly'],
    priority: 6,
    isActive: true,
    applicableProducts: ['Selected Products'],
    applicableCustomers: ['All Customers'],
    validFrom: '2024-01-01',
    usageCount: 28,
    totalSavings: 38000,
    createdDate: '2024-01-05',
  },
  {
    id: '7',
    name: 'Implementation Services Bulk',
    description: 'Volume discount for multiple implementation hours',
    ruleType: 'volume',
    discountType: 'tiered',
    discountValue: 18,
    conditions: ['Service hours > 50', 'Product: Implementation Services'],
    priority: 7,
    isActive: true,
    applicableProducts: ['Implementation Services'],
    applicableCustomers: ['All Customers'],
    validFrom: '2024-02-01',
    usageCount: 18,
    totalSavings: 48600,
    createdDate: '2024-01-20',
  },
  {
    id: '8',
    name: 'Early Renewal Incentive',
    description: 'Discount for renewing 60+ days before expiration',
    ruleType: 'time-limited',
    discountType: 'percentage',
    discountValue: 8,
    conditions: ['Renewal: 60+ days early', 'Existing customers only'],
    priority: 8,
    isActive: true,
    applicableProducts: ['All Subscription Products'],
    applicableCustomers: ['Existing Customers'],
    validFrom: '2024-01-01',
    usageCount: 42,
    totalSavings: 67200,
    createdDate: '2023-12-10',
  },
];

export default function PricingRulesPage() {
  const router = useRouter();
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = (await crmService.pricingRules.getAll()) as any[];
        const mapped: PricingRule[] = (Array.isArray(raw) ? raw : []).map((r: any) => ({
          id: String(r.id ?? ''),
          name: r.name ?? r.ruleName ?? '',
          description: r.description ?? '',
          ruleType: r.ruleType ?? 'volume',
          discountType: r.discountType ?? 'percentage',
          discountValue: Number(r.discountValue ?? 0),
          conditions: Array.isArray(r.conditions) ? r.conditions : [],
          priority: Number(r.priority ?? 0),
          isActive: r.isActive ?? true,
          applicableProducts: Array.isArray(r.applicableProducts) ? r.applicableProducts : [],
          applicableCustomers: Array.isArray(r.applicableCustomers) ? r.applicableCustomers : [],
          validFrom: r.validFrom ?? '',
          validUntil: r.validUntil ?? undefined,
          usageCount: Number(r.usageCount ?? 0),
          totalSavings: Number(r.totalSavings ?? 0),
          createdDate: r.createdDate ?? r.createdAt ?? '',
        }));
        if (!cancelled) setRules(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load pricing rules');
          setRules([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'volume' | 'customer' | 'product' | 'seasonal' | 'bundle' | 'time-limited'>('all');
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState<PricingRule | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleCreateRule = () => {
    router.push('/crm/quotes/pricing/create');
  };

  const handleToggleRule = (rule: PricingRule) => {
    setRules(rules.map(r =>
      r.id === rule.id ? { ...r, isActive: !r.isActive } : r
    ));
  };

  const handleEditRule = (rule: PricingRule) => {
    router.push(`/crm/quotes/pricing/edit/${rule.id}`);
  };

  const handleDeleteRule = (rule: PricingRule) => {
    setRuleToDelete(rule);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (ruleToDelete) {
      setRules(rules.filter(r => r.id !== ruleToDelete.id));
      setRuleToDelete(null);
      setShowDeleteDialog(false);
    }
  };

  const filteredRules = rules.filter(rule => {
    const matchesSearch = rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rule.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rule.conditions.some(c => c.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'all' || rule.ruleType === filterType;
    const matchesActive = !showActiveOnly || rule.isActive;
    return matchesSearch && matchesType && matchesActive;
  });

  const stats = {
    totalRules: rules.length,
    activeRules: rules.filter(r => r.isActive).length,
    totalSavings: rules.reduce((sum, r) => sum + r.totalSavings, 0),
    totalUsage: rules.reduce((sum, r) => sum + r.usageCount, 0),
  };

  const getRuleTypeColor = (type: string) => {
    switch (type) {
      case 'volume': return 'bg-blue-100 text-blue-700';
      case 'customer': return 'bg-purple-100 text-purple-700';
      case 'product': return 'bg-green-100 text-green-700';
      case 'seasonal': return 'bg-orange-100 text-orange-700';
      case 'bundle': return 'bg-pink-100 text-pink-700';
      case 'time-limited': return 'bg-teal-100 text-teal-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getRuleTypeIcon = (type: string) => {
    switch (type) {
      case 'volume': return <TrendingUp className="w-4 h-4" />;
      case 'customer': return <Users className="w-4 h-4" />;
      case 'product': return <Package className="w-4 h-4" />;
      case 'seasonal': return <Calendar className="w-4 h-4" />;
      case 'bundle': return <Package className="w-4 h-4" />;
      case 'time-limited': return <Calendar className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="w-full h-full px-3 py-2 ">
      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading pricing rules…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}
      <div className="mb-8">
        <div className="flex justify-end mb-3">
          <button
            onClick={handleCreateRule}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Create Rule
          </button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-3 text-white">
            <AlertCircle className="w-8 h-8 opacity-80 mb-2" />
            <div className="text-3xl font-bold mb-1">{stats.totalRules}</div>
            <div className="text-blue-100">Total Rules</div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-3 text-white">
            <CheckCircle className="w-8 h-8 opacity-80 mb-2" />
            <div className="text-3xl font-bold mb-1">{stats.activeRules}</div>
            <div className="text-green-100">Active Rules</div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-3 text-white">
            <DollarSign className="w-8 h-8 opacity-80 mb-2" />
            <div className="text-3xl font-bold mb-1">${(stats.totalSavings / 1000).toFixed(0)}K</div>
            <div className="text-purple-100">Total Savings</div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-3 text-white">
            <TrendingUp className="w-8 h-8 opacity-80 mb-2" />
            <div className="text-3xl font-bold mb-1">{stats.totalUsage}</div>
            <div className="text-orange-100">Times Applied</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-3 mb-3">
          <div className="flex gap-2 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search pricing rules..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="volume">Volume</option>
              <option value="customer">Customer</option>
              <option value="product">Product</option>
              <option value="seasonal">Seasonal</option>
              <option value="bundle">Bundle</option>
              <option value="time-limited">Time Limited</option>
            </select>

            <button
              onClick={() => setShowActiveOnly(!showActiveOnly)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                showActiveOnly ? 'bg-green-50 border-green-300 text-green-700' : 'border-gray-300 text-gray-700'
              }`}
            >
              <CheckCircle className={`w-4 h-4 ${showActiveOnly ? 'fill-green-500' : ''}`} />
              Active Only
            </button>
          </div>
        </div>
      </div>

      {/* Rules List */}
      <div className="space-y-2">
        {filteredRules.map((rule) => (
          <div key={rule.id} className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{rule.name}</h3>
                  <span className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getRuleTypeColor(rule.ruleType)}`}>
                    {getRuleTypeIcon(rule.ruleType)}
                    {rule.ruleType}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    rule.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {rule.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                    Priority: {rule.priority}
                  </span>
                </div>
                <p className="text-gray-600 text-sm">{rule.description}</p>
              </div>

              <div className="flex items-center gap-2">
                {rule.isActive ? (
                  <button
                    onClick={() => handleToggleRule(rule)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg text-sm"
                  >
                    <ToggleRight className="w-6 h-6" />
                    <span>Disable</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleToggleRule(rule)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg text-sm"
                  >
                    <ToggleLeft className="w-6 h-6" />
                    <span>Enable</span>
                  </button>
                )}
                <button
                  onClick={() => handleEditRule(rule)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDeleteRule(rule)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-2">
              {/* Discount Details */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3">
                <div className="flex items-center gap-2 text-purple-700 mb-1">
                  {rule.discountType === 'percentage' ? (
                    <Percent className="w-4 h-4" />
                  ) : (
                    <DollarSign className="w-4 h-4" />
                  )}
                  <span className="text-xs font-medium">Discount</span>
                </div>
                <div className="text-2xl font-bold text-purple-900">
                  {rule.discountType === 'percentage' ? `${rule.discountValue}%` : `$${rule.discountValue}`}
                </div>
                <div className="text-xs text-purple-700 mt-1 capitalize">{rule.discountType}</div>
              </div>

              {/* Usage Stats */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3">
                <div className="flex items-center gap-2 text-blue-700 mb-1">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-xs font-medium">Usage</span>
                </div>
                <div className="text-2xl font-bold text-blue-900">{rule.usageCount}</div>
                <div className="text-xs text-blue-700 mt-1">Times Applied</div>
              </div>

              {/* Total Savings */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3">
                <div className="flex items-center gap-2 text-green-700 mb-1">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-xs font-medium">Savings</span>
                </div>
                <div className="text-2xl font-bold text-green-900">
                  ${(rule.totalSavings / 1000).toFixed(0)}K
                </div>
                <div className="text-xs text-green-700 mt-1">Customer Savings</div>
              </div>

              {/* Validity Period */}
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3">
                <div className="flex items-center gap-2 text-orange-700 mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs font-medium">Valid From</span>
                </div>
                <div className="text-lg font-bold text-orange-900">
                  {new Date(rule.validFrom).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
                <div className="text-xs text-orange-700 mt-1">
                  {rule.validUntil ? `Until ${new Date(rule.validUntil).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : 'No End Date'}
                </div>
              </div>
            </div>

            {/* Conditions */}
            <div className="mb-2">
              <div className="text-xs font-medium text-gray-700 mb-2">Conditions:</div>
              <div className="flex flex-wrap gap-2">
                {rule.conditions.map((condition, index) => (
                  <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                    {condition}
                  </span>
                ))}
              </div>
            </div>

            {/* Applicability */}
            <div className="grid grid-cols-2 gap-2 pt-4 border-t border-gray-100">
              <div>
                <div className="text-xs font-medium text-gray-700 mb-2 flex items-center gap-1">
                  <Package className="w-3 h-3" />
                  Applicable Products:
                </div>
                <div className="flex flex-wrap gap-1">
                  {rule.applicableProducts.map((product, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                      {product}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-xs font-medium text-gray-700 mb-2 flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  Applicable Customers:
                </div>
                <div className="flex flex-wrap gap-1">
                  {rule.applicableCustomers.map((customer, index) => (
                    <span key={index} className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs">
                      {customer}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
              Created: {new Date(rule.createdDate).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>

      {filteredRules.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <AlertCircle className="w-16 h-16 text-gray-400 mb-2" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No pricing rules found</h3>
          <p className="text-gray-600">Try adjusting your search or filters</p>
        </div>
      )}

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={confirmDelete}
        title="Delete Pricing Rule"
        message={`Are you sure you want to delete "${ruleToDelete?.name}"? This action cannot be undone.`}
        variant="danger"
        confirmLabel="Delete"
      />
    </div>
  );
}
