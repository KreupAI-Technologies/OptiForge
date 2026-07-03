'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Search, Edit2, Trash2, GitBranch, Clock, DollarSign, Layers, ChevronRight, Settings, AlertTriangle } from 'lucide-react';
import { ProductionOrphanService } from '@/services/production/production-orphan.service';

interface RoutingOperation {
  sequence: number;
  workCenter: string;
  operation: string;
  setupTime: number;
  cycleTime: number;
  laborCost: number;
}

interface Routing {
  id: string;
  code: string;
  name: string;
  productCode: string;
  productName: string;
  version: string;
  department: string;
  totalOperations: number;
  totalSetupTime: number;
  totalCycleTime: number;
  totalCost: number;
  status: 'active' | 'inactive' | 'draft' | 'archived';
  effectiveFrom: string;
  effectiveTo: string;
  operations: RoutingOperation[];
}

export default function RoutingSettingsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [expandedRouting, setExpandedRouting] = useState<string | null>(null);

  // Routing templates loaded from the NestJS backend (production routing-templates).
  const [routings, setRoutings] = useState<Routing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        // Backend returns raw ORM shape (id/code/name/productCode/productName/version/
        // department/totalOperations/totalSetupTime/totalCycleTime/totalCost/status/
        // effectiveFrom/effectiveTo/operations[]).
        const raw = (await ProductionOrphanService.getRoutingTemplates()) as any[];
        const mapped: Routing[] = (Array.isArray(raw) ? raw : []).map((d: any, i: number) => ({
          id: String(d?.id ?? i),
          code: d?.code ?? '',
          name: d?.name ?? '',
          productCode: d?.productCode ?? '',
          productName: d?.productName ?? '',
          version: d?.version ?? '',
          department: d?.department ?? '',
          totalOperations: Number(d?.totalOperations ?? 0),
          totalSetupTime: Number(d?.totalSetupTime ?? 0),
          totalCycleTime: Number(d?.totalCycleTime ?? 0),
          totalCost: Number(d?.totalCost ?? 0),
          status: (d?.status ?? 'active') as Routing['status'],
          effectiveFrom: d?.effectiveFrom ?? '',
          effectiveTo: d?.effectiveTo ?? '',
          operations: Array.isArray(d?.operations)
            ? d.operations.map((op: any) => ({
                sequence: Number(op?.sequence ?? 0),
                workCenter: op?.workCenter ?? '',
                operation: op?.operation ?? '',
                setupTime: Number(op?.setupTime ?? 0),
                cycleTime: Number(op?.cycleTime ?? 0),
                laborCost: Number(op?.laborCost ?? 0),
              }))
            : [],
        }));
        if (!cancelled) setRoutings(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load routing templates');
          setRoutings([]);
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

  const filteredRoutings = routings.filter(routing => {
    const matchesSearch = routing.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         routing.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         routing.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         routing.productCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || routing.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'inactive': return 'bg-gray-100 text-gray-700';
      case 'draft': return 'bg-blue-100 text-blue-700';
      case 'archived': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedRouting(expandedRouting === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gray-50 px-3 py-2">
      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading routing templates…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4" />
          {loadError}
        </div>
      )}
      {!isLoading && !loadError && routings.length === 0 && (
        <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          No routing templates found.
        </div>
      )}
      {/* Inline Header */}
      <div className="mb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Production Routings</h1>
            <p className="text-sm text-gray-500 mt-1">Manage manufacturing routings and process flows</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" />
            <span>Add Routing</span>
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Routings</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">{routings.length}</p>
            </div>
            <div className="p-3 bg-blue-200 rounded-lg">
              <GitBranch className="w-6 h-6 text-blue-700" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Active Routings</p>
              <p className="text-3xl font-bold text-green-900 mt-1">
                {routings.filter(r => r.status === 'active').length}
              </p>
            </div>
            <div className="p-3 bg-green-200 rounded-lg">
              <Settings className="w-6 h-6 text-green-700" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-3 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Total Operations</p>
              <p className="text-3xl font-bold text-purple-900 mt-1">
                {routings.filter(r => r.status === 'active').reduce((sum, r) => sum + r.totalOperations, 0)}
              </p>
            </div>
            <div className="p-3 bg-purple-200 rounded-lg">
              <Layers className="w-6 h-6 text-purple-700" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-3 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Avg Cycle Time</p>
              <p className="text-3xl font-bold text-orange-900 mt-1">
                {Math.round(routings.filter(r => r.status === 'active').reduce((sum, r) => sum + r.totalCycleTime, 0) /
                  routings.filter(r => r.status === 'active').length)}m
              </p>
            </div>
            <div className="p-3 bg-orange-200 rounded-lg">
              <Clock className="w-6 h-6 text-orange-700" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-3 mb-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by routing name, code, or product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Routings List */}
      <div className="space-y-2">
        {filteredRoutings.map((routing) => (
          <div key={routing.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Routing Header */}
            <div
              className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => toggleExpand(routing.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{routing.name}</h3>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(routing.status)}`}>
                      {routing.status}
                    </span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{routing.version}</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-4">
                    <div>
                      <p className="text-xs text-gray-500">Routing Code</p>
                      <p className="text-sm font-mono font-bold text-gray-900">{routing.code}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Product</p>
                      <p className="text-sm font-semibold text-gray-900">{routing.productCode}</p>
                      <p className="text-xs text-gray-600">{routing.productName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Operations</p>
                      <p className="text-sm font-bold text-blue-600">{routing.totalOperations}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Total Time</p>
                      <p className="text-sm font-bold text-purple-600">{routing.totalCycleTime}m</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Total Cost</p>
                      <p className="text-sm font-bold text-green-600">${routing.totalCost}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={(e) => { e.stopPropagation(); }}
                    className="p-2 hover:bg-gray-100 rounded transition-colors"
                  >
                    <Edit2 className="w-4 h-4 text-blue-600" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); }}
                    className="p-2 hover:bg-gray-100 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                  <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${expandedRouting === routing.id ? 'rotate-90' : ''}`} />
                </div>
              </div>
            </div>

            {/* Expanded Operations */}
            {expandedRouting === routing.id && (
              <div className="border-t border-gray-200 bg-gray-50 p-3">
                <h4 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  Operations Sequence
                </h4>
                <div className="space-y-2">
                  {routing.operations.map((op, idx) => (
                    <div key={idx} className="bg-white p-3 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 font-bold rounded-full text-sm">
                            {op.sequence}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">{op.operation}</p>
                            <p className="text-xs text-gray-500">{op.workCenter}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-xs text-gray-500">Setup Time</p>
                            <p className="text-sm font-semibold text-gray-900">{op.setupTime}m</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">Cycle Time</p>
                            <p className="text-sm font-semibold text-purple-600">{op.cycleTime}m</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">Labor Cost</p>
                            <p className="text-sm font-semibold text-green-600">${op.laborCost}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <p className="text-xs text-blue-600 font-medium">Total Setup Time</p>
                      <p className="text-lg font-bold text-blue-900">{routing.totalSetupTime}m</p>
                    </div>
                    <div>
                      <p className="text-xs text-purple-600 font-medium">Total Cycle Time</p>
                      <p className="text-lg font-bold text-purple-900">{routing.totalCycleTime}m</p>
                    </div>
                    <div>
                      <p className="text-xs text-green-600 font-medium">Total Labor Cost</p>
                      <p className="text-lg font-bold text-green-900">${routing.totalCost}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredRoutings.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12">
          <div className="text-center">
            <p className="text-gray-500">No routings found matching your criteria</p>
          </div>
        </div>
      )}
    </div>
  );
}
