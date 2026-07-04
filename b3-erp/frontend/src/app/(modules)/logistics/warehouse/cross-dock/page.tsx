'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogisticsService } from '@/services/logistics.service';
import { ArrowLeft, Search, Package, Truck, ArrowRight, Clock, CheckCircle, AlertTriangle, TrendingUp, Filter } from 'lucide-react';

interface CrossDockOperation {
  id: string;
  operationNo: string;
  inboundVehicle: string;
  outboundVehicle: string;
  inboundCarrier: string;
  outboundCarrier: string;
  receiptTime: string;
  dispatchTime: string;
  itemCount: number;
  palletCount: number;
  totalWeight: number;
  status: 'receiving' | 'sorting' | 'staging' | 'loading' | 'completed' | 'delayed';
  priority: 'high' | 'medium' | 'low';
  inboundDock: string;
  outboundDock: string;
  dwellTime: number;
  targetDwellTime: number;
  progress: number;
  orderNos: string[];
  destination: string;
  notes: string;
}

export default function CrossDockPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const [crossDockOps, setCrossDockOps] = useState<CrossDockOperation[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await LogisticsService.getCrossDockOperations();
        const list = Array.isArray(res) ? res : ((res as any)?.data ?? (res as any)?.items ?? []);
        if (cancelled) return;
        setCrossDockOps((list as any[]).map((r, i) => ({
          id: String(r.id ?? i),
          operationNo: r.operationNo ?? '',
          inboundVehicle: r.inboundVehicle ?? r.inboundShipment ?? '',
          outboundVehicle: r.outboundVehicle ?? r.outboundShipment ?? '',
          inboundCarrier: r.inboundCarrier ?? r.carrier ?? '',
          outboundCarrier: r.outboundCarrier ?? r.carrier ?? '',
          receiptTime: r.receiptTime ?? r.scheduledTime ?? '',
          dispatchTime: r.dispatchTime ?? '',
          itemCount: Number(r.itemCount ?? 0),
          palletCount: Number(r.palletCount ?? 0),
          totalWeight: Number(r.totalWeight ?? 0),
          status: (r.status ?? 'receiving') as CrossDockOperation['status'],
          priority: (r.priority ?? 'medium') as CrossDockOperation['priority'],
          inboundDock: r.inboundDock ?? r.dockDoor ?? '',
          outboundDock: r.outboundDock ?? '',
          dwellTime: Number(r.dwellTime ?? 0),
          targetDwellTime: Number(r.targetDwellTime ?? 0),
          progress: Number(r.progress ?? 0),
          orderNos: Array.isArray(r.orderNos) ? r.orderNos : (r.orderNos ? [r.orderNos] : []),
          destination: r.destination ?? '',
          notes: r.notes ?? '',
        })));
      } catch (e) {
        if (!cancelled) setLoadError(e instanceof Error ? e.message : 'Failed to load cross-dock operations');
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const crossDockStats = {
    total: crossDockOps.length,
    receiving: crossDockOps.filter(op => op.status === 'receiving').length,
    sorting: crossDockOps.filter(op => op.status === 'sorting').length,
    staging: crossDockOps.filter(op => op.status === 'staging').length,
    loading: crossDockOps.filter(op => op.status === 'loading').length,
    completed: crossDockOps.filter(op => op.status === 'completed').length,
    delayed: crossDockOps.filter(op => op.status === 'delayed').length,
    avgDwellTime: Math.round(crossDockOps.filter(op => op.dwellTime > 0).reduce((sum, op) => sum + op.dwellTime, 0) / crossDockOps.filter(op => op.dwellTime > 0).length),
    totalItems: crossDockOps.reduce((sum, op) => sum + op.itemCount, 0)
  };

  const filteredOps = crossDockOps.filter(op => {
    const matchesSearch =
      op.operationNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      op.inboundVehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      op.outboundVehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      op.destination.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || op.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || op.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'receiving': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'sorting': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'staging': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'loading': return 'bg-green-100 text-green-700 border-green-200';
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'delayed': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return 'bg-green-600';
    if (progress >= 50) return 'bg-blue-600';
    if (progress >= 25) return 'bg-yellow-600';
    return 'bg-red-600';
  };

  const getDwellTimeColor = (dwellTime: number, targetTime: number) => {
    if (dwellTime === 0) return 'text-gray-600';
    const percentage = (dwellTime / targetTime) * 100;
    if (percentage > 100) return 'text-red-600';
    if (percentage > 80) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="min-h-screen bg-gray-50 px-3 py-2">
      {loadError && (
        <div className="mb-3 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
          {loadError}
        </div>
      )}
      <div className="mb-3 flex items-center gap-2">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cross-Dock Operations</h1>
          <p className="text-sm text-gray-500 mt-1">Real-time cross-docking operations and dwell time tracking</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-9 gap-3 mb-3">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-3 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Package className="w-7 h-7 opacity-80" />
            <span className="text-2xl font-bold">{crossDockStats.total}</span>
          </div>
          <p className="text-xs font-medium opacity-90">Total Ops</p>
        </div>

        <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white rounded-xl p-3 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Truck className="w-7 h-7 opacity-80" />
            <span className="text-2xl font-bold">{crossDockStats.receiving}</span>
          </div>
          <p className="text-xs font-medium opacity-90">Receiving</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-3 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <ArrowRight className="w-7 h-7 opacity-80" />
            <span className="text-2xl font-bold">{crossDockStats.sorting}</span>
          </div>
          <p className="text-xs font-medium opacity-90">Sorting</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-xl p-3 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-7 h-7 opacity-80" />
            <span className="text-2xl font-bold">{crossDockStats.staging}</span>
          </div>
          <p className="text-xs font-medium opacity-90">Staging</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-3 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-7 h-7 opacity-80" />
            <span className="text-2xl font-bold">{crossDockStats.loading}</span>
          </div>
          <p className="text-xs font-medium opacity-90">Loading</p>
        </div>

        <div className="bg-gradient-to-br from-green-400 to-green-500 text-white rounded-xl p-3 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-7 h-7 opacity-80" />
            <span className="text-2xl font-bold">{crossDockStats.completed}</span>
          </div>
          <p className="text-xs font-medium opacity-90">Completed</p>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl p-3 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-7 h-7 opacity-80" />
            <span className="text-2xl font-bold">{crossDockStats.delayed}</span>
          </div>
          <p className="text-xs font-medium opacity-90">Delayed</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl p-3 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-7 h-7 opacity-80" />
            <span className="text-xl font-bold">{crossDockStats.avgDwellTime}</span>
          </div>
          <p className="text-xs font-medium opacity-90">Avg Dwell (min)</p>
        </div>

        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-xl p-3 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Package className="w-7 h-7 opacity-80" />
            <span className="text-xl font-bold">{crossDockStats.totalItems}</span>
          </div>
          <p className="text-xs font-medium opacity-90">Total Items</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-3 mb-3">
        <div className="flex flex-col gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by operation no, vehicle, or destination..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="receiving">Receiving</option>
              <option value="sorting">Sorting</option>
              <option value="staging">Staging</option>
              <option value="loading">Loading</option>
              <option value="completed">Completed</option>
              <option value="delayed">Delayed</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Filter className="w-4 h-4" />
            <span>Showing {filteredOps.length} of {crossDockStats.total} operations</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {filteredOps.map((op) => (
          <div key={op.id} className="bg-white rounded-xl border border-gray-200 p-3 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-gray-900">{op.operationNo}</h3>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(op.status)}`}>
                    {op.status}
                  </span>
                  <span className={`text-sm font-medium ${getPriorityColor(op.priority)}`}>
                    {op.priority.toUpperCase()} PRIORITY
                  </span>
                </div>
                <p className="text-sm text-gray-600">Destination: <span className="font-semibold text-blue-600">{op.destination}</span></p>
              </div>

              {op.dwellTime > op.targetDwellTime && (
                <div className="bg-red-50 rounded-lg p-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 mb-2 bg-gray-50 rounded-lg p-3">
              <div className="flex-1 text-center">
                <p className="text-xs text-gray-500 mb-1">Inbound</p>
                <p className="text-sm font-bold text-blue-900">{op.inboundVehicle}</p>
                <p className="text-xs text-blue-700 mt-0.5">{op.inboundCarrier}</p>
                <p className="text-xs text-gray-600 mt-1">{op.inboundDock}</p>
              </div>

              <div className="flex flex-col items-center gap-1">
                <ArrowRight className="w-8 h-8 text-green-600" />
                <p className="text-xs font-medium text-gray-600">Cross-Dock</p>
              </div>

              <div className="flex-1 text-center">
                <p className="text-xs text-gray-500 mb-1">Outbound</p>
                <p className="text-sm font-bold text-green-900">{op.outboundVehicle}</p>
                <p className="text-xs text-green-700 mt-0.5">{op.outboundCarrier}</p>
                <p className="text-xs text-gray-600 mt-1">{op.outboundDock}</p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3 mb-2">
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <p className="text-xs text-blue-600 font-medium">Items</p>
                <p className="text-lg font-bold text-blue-900">{op.itemCount}</p>
              </div>

              <div className="bg-purple-50 rounded-lg p-3 text-center">
                <p className="text-xs text-purple-600 font-medium">Pallets</p>
                <p className="text-lg font-bold text-purple-900">{op.palletCount}</p>
              </div>

              <div className="bg-orange-50 rounded-lg p-3 text-center">
                <p className="text-xs text-orange-600 font-medium">Weight</p>
                <p className="text-lg font-bold text-orange-900">{op.totalWeight}kg</p>
              </div>

              <div className="bg-indigo-50 rounded-lg p-3 text-center">
                <p className="text-xs text-indigo-600 font-medium">Progress</p>
                <p className="text-lg font-bold text-indigo-900">{op.progress}%</p>
              </div>
            </div>

            {op.status !== 'completed' && (
              <div className="mb-2">
                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                  <span>Operation Progress</span>
                  <span>{op.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${getProgressColor(op.progress)}`}
                    style={{ width: `${op.progress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="bg-gray-50 rounded-lg p-3 mb-2">
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div>
                  <p className="text-gray-500">Receipt Time</p>
                  <p className="font-medium text-gray-900">{op.receiptTime.split(' ')[1]}</p>
                </div>
                <div>
                  <p className="text-gray-500">Dispatch Time</p>
                  <p className="font-medium text-gray-900">{op.dispatchTime.split(' ')[1]}</p>
                </div>
                <div>
                  <p className="text-gray-500">Dwell Time</p>
                  <p className={`font-medium ${getDwellTimeColor(op.dwellTime, op.targetDwellTime)}`}>
                    {op.dwellTime > 0 ? `${op.dwellTime} / ${op.targetDwellTime} min` : 'Not started'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-2">
              <p className="text-xs text-yellow-600 font-medium mb-1">Orders: {op.orderNos.join(', ')}</p>
              <p className="text-sm text-yellow-900">{op.notes}</p>
            </div>

            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm">
              View Operation Details
            </button>
          </div>
        ))}
      </div>

      {filteredOps.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Package className="w-16 h-16 text-gray-400 mb-2" />
          <p className="text-gray-500 text-lg mb-2">No cross-dock operations found</p>
          <p className="text-sm text-gray-400">Try adjusting your search or filter criteria</p>
        </div>
      )}

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-3">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Cross-Dock Process Guide:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-blue-700">
          <div><span className="font-medium">Receiving:</span> Unloading goods from inbound vehicle</div>
          <div><span className="font-medium">Sorting:</span> Organizing items for outbound destinations</div>
          <div><span className="font-medium">Staging:</span> Items staged in loading area for outbound</div>
          <div><span className="font-medium">Loading:</span> Loading goods onto outbound vehicle</div>
          <div><span className="font-medium">Dwell Time:</span> Time from receipt to dispatch (minimize for efficiency)</div>
          <div><span className="font-medium">Target:</span> Complete cross-dock within target dwell time</div>
        </div>
      </div>
    </div>
  );
}
