'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Download, RefreshCw, Filter, Calendar, Package, AlertTriangle, CheckCircle } from 'lucide-react';
import { ProductionOrphanService } from '@/services/production/production-orphan.service';

interface MaterialRequirement {
  id: string;
  materialCode: string;
  materialName: string;
  category: string;
  uom: string;
  grossRequirement: number;
  scheduledReceipts: number;
  onHandInventory: number;
  netRequirement: number;
  plannedOrderQuantity: number;
  requiredDate: string;
  leadTimeDays: number;
  safetyStock: number;
  status: 'sufficient' | 'shortage' | 'critical' | 'planned';
  relatedWorkOrders: string[];
}

export default function MRPRequirementsPage() {
  const router = useRouter();
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Material requirements loaded from the NestJS backend (production/material-requirements).
  const [requirements, setRequirements] = useState<MaterialRequirement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        // Backend returns raw ORM shape (itemCode/itemName/grossRequirement/
        // netRequirement/scheduledReceipts/onHandQuantity/safetyStock...).
        const raw = (await ProductionOrphanService.getMaterialRequirements()) as any[];
        const statusMap: Record<string, MaterialRequirement['status']> = {
          Sufficient: 'sufficient', sufficient: 'sufficient',
          Shortage: 'shortage', shortage: 'shortage',
          Critical: 'critical', critical: 'critical',
          Planned: 'planned', planned: 'planned',
        };
        const mapped: MaterialRequirement[] = (Array.isArray(raw) ? raw : []).map((r: any, i: number) => {
          const net = Number(r?.netRequirement ?? 0);
          const wos: string[] = Array.isArray(r?.pegging)
            ? r.pegging.map((p: any) => p?.workOrderNumber ?? p?.sourceDocumentNumber ?? String(p)).filter(Boolean)
            : (r?.sourceDocumentNumber ? [r.sourceDocumentNumber] : []);
          return {
            id: String(r?.id ?? i),
            materialCode: r?.itemCode ?? '',
            materialName: r?.itemName ?? '',
            category: r?.requirementType ?? r?.category ?? 'Material',
            uom: r?.uom ?? '',
            grossRequirement: Number(r?.grossRequirement ?? 0),
            scheduledReceipts: Number(r?.scheduledReceipts ?? 0),
            onHandInventory: Number(r?.onHandQuantity ?? 0),
            netRequirement: net,
            plannedOrderQuantity: Number(r?.plannedOrderReceipt ?? r?.lotSizeQuantity ?? 0),
            requiredDate: r?.requiredDate ?? '',
            leadTimeDays: Number(r?.leadTimeDays ?? 0),
            safetyStock: Number(r?.safetyStock ?? 0),
            status: statusMap[r?.status] ?? (net > 0 ? 'shortage' : 'sufficient'),
            relatedWorkOrders: wos,
          };
        });
        if (!cancelled) setRequirements(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load material requirements');
          setRequirements([]);
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

  const filteredRequirements = requirements.filter(req => {
    const categoryMatch = filterCategory === 'all' || req.category === filterCategory;
    const statusMatch = filterStatus === 'all' || req.status === filterStatus;
    return categoryMatch && statusMatch;
  });

  const totalGrossRequirement = requirements.reduce((sum, req) => sum + req.grossRequirement, 0);
  const totalNetRequirement = requirements.reduce((sum, req) => sum + req.netRequirement, 0);
  const criticalItems = requirements.filter(req => req.status === 'critical').length;
  const shortageItems = requirements.filter(req => req.status === 'shortage').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sufficient': return 'text-green-700 bg-green-100';
      case 'planned': return 'text-blue-700 bg-blue-100';
      case 'shortage': return 'text-yellow-700 bg-yellow-100';
      case 'critical': return 'text-red-700 bg-red-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sufficient': return <CheckCircle className="w-4 h-4" />;
      case 'critical': return <AlertTriangle className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-3 py-2">
      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading material requirements…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4" />
          {loadError}
        </div>
      )}
      {!isLoading && !loadError && requirements.length === 0 && (
        <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          No material requirements found.
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
            <h1 className="text-2xl font-bold text-gray-900">Material Requirements</h1>
            <p className="text-sm text-gray-500 mt-1">MRP - Net requirements calculation and planning</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            <span>Run MRP</span>
          </button>
          <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Materials</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{requirements.length}</p>
            </div>
            <div className="p-3 bg-blue-200 rounded-lg">
              <Package className="w-6 h-6 text-blue-700" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-3 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Net Requirement</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">{totalNetRequirement.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-purple-200 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-700" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-3 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Critical Items</p>
              <p className="text-2xl font-bold text-red-900 mt-1">{criticalItems}</p>
            </div>
            <div className="p-3 bg-red-200 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-700" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-3 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">Shortage Items</p>
              <p className="text-2xl font-bold text-yellow-900 mt-1">{shortageItems}</p>
            </div>
            <div className="p-3 bg-yellow-200 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-yellow-700" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-3 mb-3">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            <option value="Raw Material">Raw Material</option>
            <option value="Component">Component</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="sufficient">Sufficient</option>
            <option value="planned">Planned</option>
            <option value="shortage">Shortage</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      {/* Requirements Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Gross Req.</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Scheduled</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">On Hand</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Net Req.</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Planned Order</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Required Date</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Lead Time</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRequirements.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{req.materialCode}</div>
                      <div className="text-sm text-gray-500">{req.materialName}</div>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className="text-sm text-gray-700">{req.category}</span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-right">
                    <span className="text-sm font-medium text-gray-900">{req.grossRequirement.toLocaleString()}</span>
                    <span className="text-xs text-gray-500 ml-1">{req.uom}</span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-right">
                    <span className="text-sm text-gray-700">{req.scheduledReceipts.toLocaleString()}</span>
                    <span className="text-xs text-gray-500 ml-1">{req.uom}</span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-right">
                    <span className="text-sm text-gray-700">{req.onHandInventory.toLocaleString()}</span>
                    <span className="text-xs text-gray-500 ml-1">{req.uom}</span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-right">
                    <span className={`text-sm font-medium ${req.netRequirement > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                      {req.netRequirement.toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-500 ml-1">{req.uom}</span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-right">
                    <span className="text-sm font-medium text-blue-600">{req.plannedOrderQuantity.toLocaleString()}</span>
                    <span className="text-xs text-gray-500 ml-1">{req.uom}</span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex items-center gap-1 text-sm text-gray-700">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {req.requiredDate}
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-center">
                    <span className="text-sm text-gray-700">{req.leadTimeDays} days</span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-center">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(req.status)}`}>
                      {getStatusIcon(req.status)}
                      {req.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
