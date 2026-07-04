'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { crmService } from '@/services/crm.service';
import {
  Circle,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Pause,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  ArrowUp,
  ArrowDown,
  Settings,
  Copy,
  Users,
  BarChart3,
  TrendingUp,
  Eye,
  EyeOff
} from 'lucide-react';
import { ConfirmDialog } from '@/components/ui';

interface CustomStatus {
  id: string;
  name: string;
  category: 'opportunity' | 'lead' | 'customer' | 'contact' | 'ticket' | 'contract';
  color: string;
  icon: string;
  type: 'open' | 'in_progress' | 'won' | 'lost' | 'on_hold' | 'custom';
  isActive: boolean;
  isDefault: boolean;
  order: number;
  description: string;
  usageCount: number;
  conversion?: {
    rate: number;
    avgDays: number;
  };
  canDelete: boolean;
  allowedTransitions: string[];
  createdAt: string;
  createdBy: string;
}

export default function CustomStatusesPage() {
  const router = useRouter();
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [editingStatus, setEditingStatus] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [statusToDelete, setStatusToDelete] = useState<CustomStatus | null>(null);

  const [statuses, setStatuses] = useState<CustomStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = (await crmService.pipelineStageConfigs.getAll()) as any[];
        const list = Array.isArray(raw) ? raw : [];
        const mapped: CustomStatus[] = list.map((r, idx) => {
          const rawConversion = r?.conversion;
          const conversion =
            rawConversion && (rawConversion.rate !== undefined || rawConversion.avgDays !== undefined)
              ? {
                  rate: Number(rawConversion?.rate ?? 0),
                  avgDays: Number(rawConversion?.avgDays ?? 0),
                }
              : undefined;
          return {
            id: r?.id ?? `STS-${idx + 1}`,
            name: r?.name ?? '',
            category: (r?.category ?? 'lead') as CustomStatus['category'],
            color: r?.color ?? '#3B82F6',
            icon: r?.icon ?? 'circle',
            type: (r?.type ?? 'custom') as CustomStatus['type'],
            isActive: r?.isActive ?? true,
            isDefault: !!r?.isDefault,
            order: Number(r?.order ?? idx + 1),
            description: r?.description ?? '',
            usageCount: Number(r?.usageCount ?? 0),
            conversion,
            canDelete: r?.canDelete ?? true,
            allowedTransitions: Array.isArray(r?.allowedTransitions) ? r.allowedTransitions : [],
            createdAt: r?.createdAt ?? '',
            createdBy: r?.createdBy ?? '',
          };
        });
        if (!cancelled) setStatuses(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load statuses');
          setStatuses([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredStatuses = statuses.filter(status =>
    categoryFilter === 'all' || status.category === categoryFilter
  );

  const getCategoryStats = (category: string) => {
    const categoryStatuses = statuses.filter(s => s.category === category);
    return {
      total: categoryStatuses.length,
      active: categoryStatuses.filter(s => s.isActive).length,
      usage: categoryStatuses.reduce((sum, s) => sum + s.usageCount, 0)
    };
  };

  const stats = [
    {
      label: 'Total Statuses',
      value: statuses.length,
      subtitle: `${statuses.filter(s => s.isActive).length} active`,
      icon: Circle,
      color: 'from-blue-500 to-blue-600'
    },
    {
      label: 'Lead Statuses',
      value: getCategoryStats('lead').total,
      subtitle: `${getCategoryStats('lead').usage} uses`,
      icon: Users,
      color: 'from-purple-500 to-purple-600'
    },
    {
      label: 'Opportunity Statuses',
      value: getCategoryStats('opportunity').total,
      subtitle: `${getCategoryStats('opportunity').usage} uses`,
      icon: TrendingUp,
      color: 'from-green-500 to-green-600'
    },
    {
      label: 'Customer Statuses',
      value: getCategoryStats('customer').total,
      subtitle: `${getCategoryStats('customer').usage} uses`,
      icon: CheckCircle,
      color: 'from-orange-500 to-orange-600'
    }
  ];

  const getStatusIcon = (iconName: string) => {
    switch (iconName) {
      case 'check-circle': return CheckCircle;
      case 'x-circle': return XCircle;
      case 'clock': return Clock;
      case 'alert-circle': return AlertCircle;
      case 'pause': return Pause;
      default: return Circle;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'open': return 'bg-blue-100 text-blue-700';
      case 'in_progress': return 'bg-purple-100 text-purple-700';
      case 'won': return 'bg-green-100 text-green-700';
      case 'lost': return 'bg-red-100 text-red-700';
      case 'on_hold': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const moveStatus = (index: number, direction: 'up' | 'down') => {
    const category = filteredStatuses[index].category;
    const categoryStatuses = statuses.filter(s => s.category === category);
    const statusInCategory = categoryStatuses.findIndex(s => s.id === filteredStatuses[index].id);

    if ((direction === 'up' && statusInCategory === 0) ||
        (direction === 'down' && statusInCategory === categoryStatuses.length - 1)) {
      return;
    }

    const newStatuses = [...statuses];
    const currentStatusIndex = newStatuses.findIndex(s => s.id === filteredStatuses[index].id);
    const targetStatusId = direction === 'up'
      ? categoryStatuses[statusInCategory - 1].id
      : categoryStatuses[statusInCategory + 1].id;
    const targetStatusIndex = newStatuses.findIndex(s => s.id === targetStatusId);

    [newStatuses[currentStatusIndex], newStatuses[targetStatusIndex]] =
    [newStatuses[targetStatusIndex], newStatuses[currentStatusIndex]];

    // Update order numbers
    const updatedCategoryStatuses = newStatuses.filter(s => s.category === category);
    updatedCategoryStatuses.forEach((status, idx) => {
      const statusIndex = newStatuses.findIndex(s => s.id === status.id);
      newStatuses[statusIndex].order = idx + 1;
    });

    setStatuses(newStatuses);
  };

  const toggleStatusActive = (statusId: string) => {
    setStatuses(statuses.map(s =>
      s.id === statusId ? { ...s, isActive: !s.isActive } : s
    ));
  };

  const handleEditStatus = (status: CustomStatus) => {
    router.push(`/crm/settings/statuses/edit/${status.id}`);
  };

  const handleCopyStatus = (status: CustomStatus) => {
    const newStatus: CustomStatus = {
      ...status,
      id: `STS-${Date.now()}`,
      name: `${status.name} (Copy)`,
      isDefault: false,
      usageCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      createdBy: 'Current User',
      canDelete: true,
    };
    setStatuses([...statuses, newStatus]);
  };

  const handleSettingsStatus = (status: CustomStatus) => {
    router.push(`/crm/settings/statuses/configure/${status.id}`);
  };

  const handleDeleteClick = (status: CustomStatus) => {
    setStatusToDelete(status);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (statusToDelete) {
      setStatuses(statuses.filter(s => s.id !== statusToDelete.id));
      setShowDeleteDialog(false);
      setStatusToDelete(null);
    }
  };

  const handleCreateStatus = () => {
    // This would be called from the modal's Create button
    // For now, just close the modal - full implementation would gather form data
    setShowAddModal(false);
    router.push('/crm/settings/statuses');
  };

  return (
    <div className="w-full h-full px-3 py-2  space-y-3">
      {/* Header */}
      <div className="flex items-center justify-end">
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Status
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className={`bg-gradient-to-br ${stat.color} rounded-xl p-3 text-white`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm">{stat.label}</p>
                  <p className="text-3xl font-bold mt-1">{stat.value}</p>
                  <p className="text-white/70 text-xs mt-1">{stat.subtitle}</p>
                </div>
                <Icon className="w-12 h-12 text-white/30" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Category Filter */}
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700">Filter by Category:</span>
          <div className="flex gap-2">
            {['all', 'lead', 'opportunity', 'customer', 'contact', 'ticket', 'contract'].map((category) => (
              <button
                key={category}
                onClick={() => setCategoryFilter(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  categoryFilter === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading statuses…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}

      {/* Statuses List */}
      <div className="space-y-3">
        {filteredStatuses.map((status, index) => {
          const StatusIcon = getStatusIcon(status.icon);
          const isEditing = editingStatus === status.id;

          return (
            <div
              key={status.id}
              className={`bg-white rounded-lg border-2 ${
                status.isDefault ? 'border-blue-300 bg-blue-50/30' : 'border-gray-200'
              } p-5 transition-all ${!status.isActive ? 'opacity-60' : ''}`}
            >
              <div className="flex items-center gap-2">
                {/* Order Controls */}
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => moveStatus(index, 'up')}
                    disabled={index === 0 || filteredStatuses[index - 1].category !== status.category}
                    className="p-1 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ArrowUp className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => moveStatus(index, 'down')}
                    disabled={
                      index === filteredStatuses.length - 1 ||
                      filteredStatuses[index + 1]?.category !== status.category
                    }
                    className="p-1 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ArrowDown className="w-4 h-4 text-gray-600" />
                  </button>
                </div>

                {/* Status Icon & Color */}
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: status.color + '20' }}
                  >
                    <StatusIcon className="w-6 h-6" style={{ color: status.color }} />
                  </div>
                </div>

                {/* Status Details */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-semibold text-gray-900">{status.name}</h3>
                    {status.isDefault && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                        Default
                      </span>
                    )}
                    <span className={`px-2 py-0.5 text-xs font-medium rounded ${getTypeColor(status.type)}`}>
                      {status.type.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded capitalize">
                      {status.category}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{status.description}</p>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-6 gap-2">
                    <div>
                      <p className="text-xs text-gray-500">Usage</p>
                      <p className="text-sm font-semibold text-gray-900">{status.usageCount}</p>
                    </div>
                    {status.conversion && (
                      <>
                        <div>
                          <p className="text-xs text-gray-500">Conversion</p>
                          <div className="flex items-center gap-1">
                            <p className="text-sm font-semibold text-gray-900">{status.conversion.rate}%</p>
                            {status.conversion.rate >= 70 && <TrendingUp className="w-3 h-3 text-green-600" />}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Avg Days</p>
                          <p className="text-sm font-semibold text-gray-900">{status.conversion.avgDays}</p>
                        </div>
                      </>
                    )}
                    <div>
                      <p className="text-xs text-gray-500">Order</p>
                      <p className="text-sm font-semibold text-gray-900">#{status.order}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Transitions</p>
                      <p className="text-sm font-semibold text-gray-900">{status.allowedTransitions.length}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Created By</p>
                      <p className="text-sm font-semibold text-gray-900">{status.createdBy}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleStatusActive(status.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      status.isActive
                        ? 'hover:bg-gray-100 text-green-600'
                        : 'hover:bg-gray-100 text-gray-400'
                    }`}
                    title={status.isActive ? 'Active' : 'Inactive'}
                  >
                    {status.isActive ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => handleEditStatus(status)}
                    className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit Status"
                  >
                    <Edit className="w-5 h-5 text-blue-600" />
                  </button>
                  <button
                    onClick={() => handleCopyStatus(status)}
                    className="p-2 hover:bg-purple-50 rounded-lg transition-colors"
                    title="Copy Status"
                  >
                    <Copy className="w-5 h-5 text-purple-600" />
                  </button>
                  <button
                    onClick={() => handleSettingsStatus(status)}
                    className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
                    title="Configure Status"
                  >
                    <Settings className="w-5 h-5 text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(status)}
                    disabled={!status.canDelete}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    title={status.canDelete ? 'Delete Status' : 'Cannot delete system status'}
                  >
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </button>
                </div>
              </div>

              {/* Conversion Progress Bar */}
              {status.conversion && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-600">Conversion Rate</span>
                    <span className="text-xs font-semibold text-gray-900">{status.conversion.rate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        status.conversion.rate >= 70
                          ? 'bg-green-500'
                          : status.conversion.rate >= 50
                          ? 'bg-blue-500'
                          : status.conversion.rate >= 30
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${status.conversion.rate}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Status Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-3 max-w-2xl w-full mx-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-2xl font-bold text-gray-900">Add New Status</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Pending Review"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="opportunity">Opportunity</option>
                    <option value="lead">Lead</option>
                    <option value="customer">Customer</option>
                    <option value="contact">Contact</option>
                    <option value="ticket">Ticket</option>
                    <option value="contract">Contract</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="won">Won</option>
                    <option value="lost">Lost</option>
                    <option value="on_hold">On Hold</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                  <input
                    type="color"
                    defaultValue="#3B82F6"
                    className="w-full h-10 px-2 border border-gray-300 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  placeholder="Describe when this status should be used..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  <span className="text-sm text-gray-700">Set as default status</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  <span className="text-sm text-gray-700">Active</span>
                </label>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateStatus}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setStatusToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Status"
        message={
          statusToDelete
            ? `Are you sure you want to delete "${statusToDelete.name}" status? This action cannot be undone. ${
                statusToDelete.usageCount > 0
                  ? `This status is currently used by ${statusToDelete.usageCount} records, which will need to be reassigned.`
                  : ''
              }`
            : ''
        }
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
