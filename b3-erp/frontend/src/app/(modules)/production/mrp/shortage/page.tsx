'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Download, AlertTriangle, Calendar, Package, DollarSign, TrendingUp, Clock } from 'lucide-react';
import { ResolveShortageModal, CreateEmergencyPOModal, ViewImpactAnalysisModal } from '@/components/production/ShortageModals';
import { ProductionOrphanService } from '@/services/production/production-orphan.service';

interface MaterialShortage {
  id: string;
  materialCode: string;
  materialName: string;
  category: string;
  uom: string;
  requiredQuantity: number;
  availableQuantity: number;
  shortageQuantity: number;
  shortagePercentage: number;
  criticalityLevel: 'critical' | 'high' | 'medium' | 'low';
  requiredDate: string;
  daysUntilRequired: number;
  affectedWorkOrders: string[];
  affectedWOCount: number;
  estimatedImpactValue: number;
  suggestedAction: string;
  currentLeadTime: number;
  preferredSupplier: string;
  alternativeSuppliers: string[];
  lastPurchasePrice: number;
  status: 'pending-resolution' | 'order-placed' | 'expediting' | 'resolved';
}

export default function MRPShortagePage() {
  const router = useRouter();
  const [filterCriticality, setFilterCriticality] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Modal states
  const [isResolveOpen, setIsResolveOpen] = useState(false);
  const [isEmergencyPOOpen, setIsEmergencyPOOpen] = useState(false);
  const [isImpactOpen, setIsImpactOpen] = useState(false);
  const [selectedShortage, setSelectedShortage] = useState<MaterialShortage | null>(null);

  // Material shortages loaded from the NestJS backend (production/shortage-records).
  const [shortages, setShortages] = useState<MaterialShortage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadShortages = React.useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
        // Backend returns raw ORM shape (shortageNumber/itemCode/itemName/
        // severity/status/shortageQuantity/affectedOrders...); map to page model.
        const raw = (await ProductionOrphanService.getShortageRecords()) as any[];
        const sevMap: Record<string, MaterialShortage['criticalityLevel']> = {
          Critical: 'critical', critical: 'critical',
          High: 'high', high: 'high',
          Medium: 'medium', medium: 'medium',
          Low: 'low', low: 'low',
        };
        const statusMap: Record<string, MaterialShortage['status']> = {
          Open: 'pending-resolution', Pending: 'pending-resolution',
          OrderPlaced: 'order-placed', 'order-placed': 'order-placed',
          Expediting: 'expediting', expediting: 'expediting',
          Resolved: 'resolved', resolved: 'resolved',
        };
        const mapped: MaterialShortage[] = (Array.isArray(raw) ? raw : []).map((s: any, i: number) => {
          const required = Number(s?.requiredQuantity ?? 0);
          const available = Number(s?.availableQuantity ?? 0);
          const shortage = Number(s?.shortageQuantity ?? Math.max(required - available, 0));
          const affected: string[] = Array.isArray(s?.affectedOrders)
            ? s.affectedOrders.map((o: any) => o?.orderNumber ?? o?.workOrderNumber ?? String(o)).filter(Boolean)
            : [];
          return {
            id: String(s?.id ?? i),
            materialCode: s?.itemCode ?? '',
            materialName: s?.itemName ?? '',
            category: s?.category ?? 'Material',
            uom: s?.uom ?? '',
            requiredQuantity: required,
            availableQuantity: available,
            shortageQuantity: shortage,
            shortagePercentage: required > 0 ? Math.round((shortage / required) * 1000) / 10 : 0,
            criticalityLevel: sevMap[s?.severity] ?? 'medium',
            requiredDate: s?.shortageDate ?? s?.requiredDate ?? '',
            daysUntilRequired: 0,
            affectedWorkOrders: affected,
            affectedWOCount: affected.length,
            estimatedImpactValue: Number(s?.estimatedImpactCost ?? 0),
            suggestedAction: s?.resolutionNotes ?? '',
            currentLeadTime: Number(s?.leadTimeDays ?? 0),
            preferredSupplier: s?.preferredSupplier ?? '',
            alternativeSuppliers: Array.isArray(s?.alternativeSuppliers) ? s.alternativeSuppliers : [],
            lastPurchasePrice: Number(s?.lastPurchasePrice ?? 0),
            status: statusMap[s?.status] ?? 'pending-resolution',
          };
        });
        setShortages(mapped);
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : 'Failed to load material shortages');
        setShortages([]);
      } finally {
        setIsLoading(false);
      }
  }, []);

  useEffect(() => {
    loadShortages();
  }, [loadShortages]);

  const filteredShortages = shortages.filter(shortage => {
    const criticalityMatch = filterCriticality === 'all' || shortage.criticalityLevel === filterCriticality;
    const statusMatch = filterStatus === 'all' || shortage.status === filterStatus;
    return criticalityMatch && statusMatch;
  });

  const totalShortages = shortages.length;
  const criticalShortages = shortages.filter(s => s.criticalityLevel === 'critical').length;
  const totalImpactValue = shortages.reduce((sum, s) => sum + s.estimatedImpactValue, 0);
  const affectedWorkOrders = new Set(shortages.flatMap(s => s.affectedWorkOrders)).size;

  const getCriticalityColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-700 bg-red-100 border-red-200';
      case 'high': return 'text-orange-700 bg-orange-100 border-orange-200';
      case 'medium': return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      case 'low': return 'text-green-700 bg-green-100 border-green-200';
      default: return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending-resolution': return 'text-red-700 bg-red-100';
      case 'order-placed': return 'text-blue-700 bg-blue-100';
      case 'expediting': return 'text-orange-700 bg-orange-100';
      case 'resolved': return 'text-green-700 bg-green-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  // Handler functions
  const handleResolve = (shortage: MaterialShortage) => {
    setSelectedShortage(shortage);
    setIsResolveOpen(true);
  };

  const handleEmergencyPO = (shortage: MaterialShortage) => {
    setSelectedShortage(shortage);
    setIsEmergencyPOOpen(true);
  };

  const handleViewImpact = (shortage: MaterialShortage) => {
    setSelectedShortage(shortage);
    setIsImpactOpen(true);
  };

  const handleResolveSubmit = async (resolution: any) => {
    const shortage = selectedShortage;
    if (!shortage) {
      setIsResolveOpen(false);
      return;
    }
    try {
      await ProductionOrphanService.resolveShortageRecord(shortage.id, resolution ?? {});
      await loadShortages();
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to save resolution plan');
    } finally {
      setIsResolveOpen(false);
      setSelectedShortage(null);
    }
  };

  const handleEmergencyPOSubmit = async (po: any) => {
    const shortage = selectedShortage;
    if (!shortage) {
      setIsEmergencyPOOpen(false);
      return;
    }
    try {
      // Emergency PO for a critical shortage escalates the shortage record.
      await ProductionOrphanService.escalateShortageRecord(shortage.id, po ?? {});
      await loadShortages();
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to create emergency purchase order');
    } finally {
      setIsEmergencyPOOpen(false);
      setSelectedShortage(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-3 py-2">
      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading material shortages…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4" />
          {loadError}
        </div>
      )}
      {!isLoading && !loadError && shortages.length === 0 && (
        <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          No material shortages found.
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
            <h1 className="text-2xl font-bold text-gray-900">Material Shortages</h1>
            <p className="text-sm text-gray-500 mt-1">MRP - Critical material shortage analysis</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const criticalShortage = shortages.find(s => s.criticalityLevel === 'critical');
              if (criticalShortage) handleResolve(criticalShortage);
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Resolve Critical</span>
          </button>
          <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-3 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Total Shortages</p>
              <p className="text-2xl font-bold text-red-900 mt-1">{totalShortages}</p>
            </div>
            <div className="p-3 bg-red-200 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-700" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-3 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Critical Items</p>
              <p className="text-2xl font-bold text-orange-900 mt-1">{criticalShortages}</p>
            </div>
            <div className="p-3 bg-orange-200 rounded-lg">
              <Package className="w-6 h-6 text-orange-700" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-3 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Impact Value</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">₹{(totalImpactValue / 100000).toFixed(1)}L</p>
            </div>
            <div className="p-3 bg-purple-200 rounded-lg">
              <DollarSign className="w-6 h-6 text-purple-700" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Affected Work Orders</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{affectedWorkOrders}</p>
            </div>
            <div className="p-3 bg-blue-200 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-700" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-3 mb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-gray-400" />
          <select
            value={filterCriticality}
            onChange={(e) => setFilterCriticality(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Criticality Levels</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending-resolution">Pending Resolution</option>
            <option value="order-placed">Order Placed</option>
            <option value="expediting">Expediting</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Shortages List */}
      <div className="space-y-2">
        {filteredShortages.map((shortage) => (
          <div key={shortage.id} className={`bg-white rounded-xl border-2 p-3 ${getCriticalityColor(shortage.criticalityLevel)}`}>
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-2">
              {/* Left Section - Material Info */}
              <div className="flex-1">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-white rounded-lg">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-gray-900">{shortage.materialCode}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCriticalityColor(shortage.criticalityLevel)}`}>
                        {shortage.criticalityLevel}
                      </span>
                    </div>
                    <p className="text-gray-700 font-medium mb-2">{shortage.materialName}</p>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 text-sm">
                      <div>
                        <p className="text-gray-500">Required</p>
                        <p className="font-semibold text-gray-900">{shortage.requiredQuantity.toLocaleString()} {shortage.uom}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Available</p>
                        <p className="font-semibold text-gray-900">{shortage.availableQuantity.toLocaleString()} {shortage.uom}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Shortage</p>
                        <p className="font-semibold text-red-600">{shortage.shortageQuantity.toLocaleString()} {shortage.uom}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Shortage %</p>
                        <p className="font-semibold text-red-600">{shortage.shortagePercentage.toFixed(1)}%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Section - Timeline & Impact */}
              <div className="lg:w-80 space-y-3">
                <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Required in</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{shortage.daysUntilRequired} days</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Required Date</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{shortage.requiredDate}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Affected WOs</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{shortage.affectedWOCount}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Impact Value</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">₹{shortage.estimatedImpactValue.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Bottom Section - Action & Status */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-3">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">Suggested Action</p>
                  <p className="text-sm font-medium text-gray-900">{shortage.suggestedAction}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Preferred Supplier: {shortage.preferredSupplier} | Lead Time: {shortage.currentLeadTime} days
                  </p>
                </div>
                <div>
                  <span className={`inline-flex px-4 py-2 rounded-lg text-sm font-medium ${getStatusColor(shortage.status)}`}>
                    {shortage.status}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleResolve(shortage)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2"
                >
                  <AlertTriangle className="w-4 h-4" />
                  Resolve
                </button>
                {shortage.criticalityLevel === 'critical' && (
                  <button
                    onClick={() => handleEmergencyPO(shortage)}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium flex items-center gap-2"
                  >
                    <Package className="w-4 h-4" />
                    Emergency PO
                  </button>
                )}
                <button
                  onClick={() => handleViewImpact(shortage)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium flex items-center gap-2"
                >
                  <TrendingUp className="w-4 h-4" />
                  View Impact
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modals */}
      <ResolveShortageModal
        isOpen={isResolveOpen}
        onClose={() => setIsResolveOpen(false)}
        onResolve={handleResolveSubmit}
        shortage={selectedShortage}
      />

      <CreateEmergencyPOModal
        isOpen={isEmergencyPOOpen}
        onClose={() => setIsEmergencyPOOpen(false)}
        onCreate={handleEmergencyPOSubmit}
        shortage={selectedShortage}
      />

      <ViewImpactAnalysisModal
        isOpen={isImpactOpen}
        onClose={() => setIsImpactOpen(false)}
        shortage={selectedShortage}
      />
    </div>
  );
}
