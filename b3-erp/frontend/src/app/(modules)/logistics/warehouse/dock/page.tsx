'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogisticsService } from '@/services/logistics.service';
import { ArrowLeft, Search, Truck, Package, Clock, CheckCircle, AlertTriangle, TrendingUp, Filter, Edit, X, Loader2, Plus } from 'lucide-react';

interface DockDoor {
  id: string;
  dockNo: string;
  type: 'inbound' | 'outbound' | 'both';
  status: 'available' | 'occupied' | 'loading' | 'unloading' | 'maintenance' | 'reserved';
  vehicleNo: string;
  carrierName: string;
  appointmentNo: string;
  scheduledTime: string;
  actualArrival: string;
  expectedDeparture: string;
  orderNo: string;
  itemsCount: number;
  palletCount: number;
  currentProgress: number;
  workerAssigned: string;
  priority: 'high' | 'medium' | 'low';
  waitTime: number;
  notes: string;
}

export default function DockManagementPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const [dockDoors, setDockDoors] = useState<DockDoor[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Edit modal state — dock assignments are now writable via PUT /logistics/dock-doors/:id.
  const [editing, setEditing] = useState<DockDoor | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Create modal state — new dock doors via POST /logistics/dock-doors.
  const emptyDraft = {
    doorNo: '',
    doorName: '',
    type: 'inbound' as DockDoor['type'],
    status: 'available' as DockDoor['status'],
    carrier: '',
    assignedTo: '',
    location: '',
    notes: '',
  };
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState(emptyDraft);
  const [createSaving, setCreateSaving] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const mapRow = (r: any, i: number): DockDoor => ({
    id: String(r.id ?? i),
    dockNo: r.dockNo ?? r.doorNo ?? '',
    type: (r.type ?? 'inbound') as DockDoor['type'],
    status: (r.status ?? 'available') as DockDoor['status'],
    vehicleNo: r.vehicleNo ?? r.currentVehicle ?? '',
    carrierName: r.carrierName ?? r.carrier ?? '',
    appointmentNo: r.appointmentNo ?? '',
    scheduledTime: r.scheduledTime ?? '',
    actualArrival: r.actualArrival ?? '',
    expectedDeparture: r.expectedDeparture ?? '',
    orderNo: r.orderNo ?? '',
    itemsCount: Number(r.itemsCount ?? 0),
    palletCount: Number(r.palletCount ?? 0),
    currentProgress: Number(r.currentProgress ?? 0),
    workerAssigned: r.workerAssigned ?? r.assignedTo ?? '',
    priority: (r.priority ?? 'medium') as DockDoor['priority'],
    waitTime: Number(r.waitTime ?? 0),
    notes: r.notes ?? '',
  });

  const loadDocks = async () => {
    try {
      setLoadError(null);
      const res = await LogisticsService.getDockDoors();
      const list = Array.isArray(res) ? res : ((res as any)?.data ?? (res as any)?.items ?? []);
      setDockDoors((list as any[]).map(mapRow));
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'Failed to load dock doors');
    }
  };

  useEffect(() => {
    void loadDocks();
  }, []);

  const handleSaveEdit = async () => {
    if (!editing || saving) return;
    setSaving(true);
    setSaveError(null);
    try {
      await LogisticsService.updateDockDoor(editing.id, {
        status: editing.status,
        type: editing.type,
        currentVehicle: editing.vehicleNo,
        carrier: editing.carrierName,
        assignedTo: editing.workerAssigned,
        waitTime: editing.waitTime,
        notes: editing.notes,
      });
      setEditing(null);
      await loadDocks();
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Failed to update dock door');
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async () => {
    if (createSaving) return;
    if (!draft.doorNo.trim()) {
      setCreateError('Dock door number is required');
      return;
    }
    setCreateSaving(true);
    setCreateError(null);
    try {
      await LogisticsService.createDockDoor({
        doorNo: draft.doorNo.trim(),
        doorName: draft.doorName.trim() || undefined,
        type: draft.type,
        status: draft.status,
        carrier: draft.carrier.trim() || undefined,
        assignedTo: draft.assignedTo.trim() || undefined,
        location: draft.location.trim() || undefined,
        notes: draft.notes.trim() || undefined,
      });
      setCreating(false);
      setDraft(emptyDraft);
      await loadDocks();
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : 'Failed to create dock door');
    } finally {
      setCreateSaving(false);
    }
  };

  const dockStats = {
    total: dockDoors.length,
    available: dockDoors.filter(d => d.status === 'available').length,
    occupied: dockDoors.filter(d => d.status === 'occupied').length,
    loading: dockDoors.filter(d => d.status === 'loading').length,
    unloading: dockDoors.filter(d => d.status === 'unloading').length,
    reserved: dockDoors.filter(d => d.status === 'reserved').length,
    maintenance: dockDoors.filter(d => d.status === 'maintenance').length,
    avgWaitTime: Math.round(dockDoors.reduce((sum, d) => sum + d.waitTime, 0) / dockDoors.length),
    utilization: Math.round(((dockDoors.filter(d => d.status !== 'available' && d.status !== 'maintenance').length) / dockDoors.length) * 100)
  };

  const filteredDocks = dockDoors.filter(dock => {
    const matchesSearch =
      dock.dockNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dock.vehicleNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dock.carrierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dock.appointmentNo.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || dock.status === statusFilter;
    const matchesType = typeFilter === 'all' || dock.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-700 border-green-200';
      case 'occupied': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'loading': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'unloading': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'reserved': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'maintenance': return 'bg-red-100 text-red-700 border-red-200';
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
          <h1 className="text-2xl font-bold text-gray-900">Dock Door Management</h1>
          <p className="text-sm text-gray-500 mt-1">Real-time dock door operations and scheduling</p>
        </div>
        <button
          type="button"
          onClick={() => { setCreateError(null); setDraft(emptyDraft); setCreating(true); }}
          className="ml-auto inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Dock Door
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-3">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-3 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Truck className="w-7 h-7 opacity-80" />
            <span className="text-2xl font-bold">{dockStats.total}</span>
          </div>
          <p className="text-xs font-medium opacity-90">Total Docks</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-3 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-7 h-7 opacity-80" />
            <span className="text-2xl font-bold">{dockStats.available}</span>
          </div>
          <p className="text-xs font-medium opacity-90">Available</p>
        </div>

        <div className="bg-gradient-to-br from-blue-400 to-blue-500 text-white rounded-xl p-3 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-7 h-7 opacity-80" />
            <span className="text-2xl font-bold">{dockStats.loading}</span>
          </div>
          <p className="text-xs font-medium opacity-90">Loading</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-3 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Package className="w-7 h-7 opacity-80" />
            <span className="text-2xl font-bold">{dockStats.unloading}</span>
          </div>
          <p className="text-xs font-medium opacity-90">Unloading</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-xl p-3 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-7 h-7 opacity-80" />
            <span className="text-2xl font-bold">{dockStats.occupied}</span>
          </div>
          <p className="text-xs font-medium opacity-90">Occupied</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl p-3 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-7 h-7 opacity-80" />
            <span className="text-2xl font-bold">{dockStats.reserved}</span>
          </div>
          <p className="text-xs font-medium opacity-90">Reserved</p>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl p-3 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-7 h-7 opacity-80" />
            <span className="text-2xl font-bold">{dockStats.maintenance}</span>
          </div>
          <p className="text-xs font-medium opacity-90">Maintenance</p>
        </div>

        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-xl p-3 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-7 h-7 opacity-80" />
            <span className="text-2xl font-bold">{dockStats.utilization}%</span>
          </div>
          <p className="text-xs font-medium opacity-90">Utilization</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-3 mb-3">
        <div className="flex flex-col gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by dock no, vehicle no, carrier, or appointment..."
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
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
              <option value="loading">Loading</option>
              <option value="unloading">Unloading</option>
              <option value="reserved">Reserved</option>
              <option value="maintenance">Maintenance</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="inbound">Inbound</option>
              <option value="outbound">Outbound</option>
              <option value="both">Both</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Filter className="w-4 h-4" />
            <span>Showing {filteredDocks.length} of {dockStats.total} dock doors " Avg wait time: {dockStats.avgWaitTime} mins</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        {filteredDocks.map((dock) => (
          <div key={dock.id} className="bg-white rounded-xl border-2 border-gray-200 p-3 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-gray-900">{dock.dockNo}</h3>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(dock.status)}`}>
                    {dock.status}
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700">
                    {dock.type}
                  </span>
                </div>
                {dock.priority && dock.status !== 'available' && (
                  <p className={`text-sm font-medium ${getPriorityColor(dock.priority)}`}>
                    {dock.priority.toUpperCase()} PRIORITY
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => { setSaveError(null); setEditing(dock); }}
                title="Edit dock assignment"
                className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors"
              >
                <Edit className="w-4 h-4 text-gray-600" />
                <span className="text-gray-700">Edit</span>
              </button>
            </div>

            {dock.status === 'available' ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
                <CheckCircle className="w-12 h-12 text-green-600 mb-3" />
                <p className="text-lg font-semibold text-green-900">Dock Available</p>
                <p className="text-sm text-green-700 mt-1">{dock.notes || 'Ready for next shipment'}</p>
              </div>
            ) : dock.status === 'maintenance' ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
                <AlertTriangle className="w-12 h-12 text-red-600 mb-3" />
                <p className="text-lg font-semibold text-red-900">Under Maintenance</p>
                <p className="text-sm text-red-700 mt-1">{dock.notes}</p>
                <p className="text-xs text-red-600 mt-2">Assigned to: {dock.workerAssigned}</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3 mb-2">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-xs text-blue-600 font-medium mb-1">Vehicle & Carrier</p>
                    <p className="text-sm font-bold text-blue-900">{dock.vehicleNo}</p>
                    <p className="text-xs text-blue-700 mt-0.5">{dock.carrierName}</p>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-3">
                    <p className="text-xs text-purple-600 font-medium mb-1">Appointment</p>
                    <p className="text-sm font-bold text-purple-900">{dock.appointmentNo}</p>
                    <p className="text-xs text-purple-700 mt-0.5">{dock.orderNo}</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 mb-2">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-gray-500">Scheduled</p>
                      <p className="font-medium text-gray-900">{dock.scheduledTime || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Actual Arrival</p>
                      <p className="font-medium text-gray-900">{dock.actualArrival || 'Pending'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Expected Departure</p>
                      <p className="font-medium text-gray-900">{dock.expectedDeparture || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Wait Time</p>
                      <p className={`font-medium ${dock.waitTime > 10 ? 'text-red-600' : 'text-green-600'}`}>
                        {dock.waitTime} mins
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-2">
                  <div className="bg-green-50 rounded-lg p-2 text-center">
                    <p className="text-xs text-green-600 font-medium">Items</p>
                    <p className="text-lg font-bold text-green-900">{dock.itemsCount}</p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-2 text-center">
                    <p className="text-xs text-orange-600 font-medium">Pallets</p>
                    <p className="text-lg font-bold text-orange-900">{dock.palletCount}</p>
                  </div>
                  <div className="bg-indigo-50 rounded-lg p-2 text-center">
                    <p className="text-xs text-indigo-600 font-medium">Progress</p>
                    <p className="text-lg font-bold text-indigo-900">{dock.currentProgress}%</p>
                  </div>
                </div>

                {(dock.status === 'loading' || dock.status === 'unloading') && (
                  <div className="mb-2">
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                      <span>{dock.status === 'loading' ? 'Loading' : 'Unloading'} Progress</span>
                      <span>{dock.currentProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${getProgressColor(dock.currentProgress)}`}
                        style={{ width: `${dock.currentProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-2">
                  <p className="text-xs text-yellow-600 font-medium mb-1">Team Assignment</p>
                  <p className="text-sm text-yellow-900 font-semibold">{dock.workerAssigned}</p>
                </div>

                {dock.notes && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs text-blue-600 font-medium mb-1">Notes</p>
                    <p className="text-sm text-blue-900">{dock.notes}</p>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      {filteredDocks.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Truck className="w-16 h-16 text-gray-400 mb-2" />
          <p className="text-gray-500 text-lg mb-2">No dock doors found</p>
          <p className="text-sm text-gray-400">Try adjusting your search or filter criteria</p>
        </div>
      )}

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-3">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Dock Status Guide:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-blue-700">
          <div><span className="font-medium">Available:</span> Dock ready for next shipment</div>
          <div><span className="font-medium">Reserved:</span> Appointment scheduled, vehicle not arrived</div>
          <div><span className="font-medium">Occupied:</span> Vehicle docked, operation not started</div>
          <div><span className="font-medium">Loading:</span> Actively loading goods onto vehicle</div>
          <div><span className="font-medium">Unloading:</span> Actively unloading goods from vehicle</div>
          <div><span className="font-medium">Maintenance:</span> Dock under repair or maintenance</div>
        </div>
      </div>

      {creating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
              <h2 className="text-lg font-bold text-gray-900">New Dock Door</h2>
              <button onClick={() => setCreating(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              {createError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
                  {createError}
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Dock Door No *</label>
                <input
                  type="text"
                  value={draft.doorNo}
                  onChange={(e) => setDraft({ ...draft, doorNo: e.target.value })}
                  placeholder="e.g. DOCK-05"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
                <input
                  type="text"
                  value={draft.doorName}
                  onChange={(e) => setDraft({ ...draft, doorName: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                <select
                  value={draft.type}
                  onChange={(e) => setDraft({ ...draft, type: e.target.value as DockDoor['type'] })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="inbound">Inbound</option>
                  <option value="outbound">Outbound</option>
                  <option value="both">Both</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                <select
                  value={draft.status}
                  onChange={(e) => setDraft({ ...draft, status: e.target.value as DockDoor['status'] })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="loading">Loading</option>
                  <option value="unloading">Unloading</option>
                  <option value="reserved">Reserved</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Location</label>
                <input
                  type="text"
                  value={draft.location}
                  onChange={(e) => setDraft({ ...draft, location: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Carrier</label>
                <input
                  type="text"
                  value={draft.carrier}
                  onChange={(e) => setDraft({ ...draft, carrier: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Assigned To</label>
                <input
                  type="text"
                  value={draft.assignedTo}
                  onChange={(e) => setDraft({ ...draft, assignedTo: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
                <textarea
                  value={draft.notes}
                  onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
                  rows={2}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-gray-200 px-4 py-3">
              <button
                onClick={() => setCreating(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={createSaving}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
              >
                {createSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                Create Dock Door
              </button>
            </div>
          </div>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
              <h2 className="text-lg font-bold text-gray-900">Edit Dock {editing.dockNo}</h2>
              <button onClick={() => setEditing(null)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              {saveError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
                  {saveError}
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                <select
                  value={editing.status}
                  onChange={(e) => setEditing({ ...editing, status: e.target.value as DockDoor['status'] })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="loading">Loading</option>
                  <option value="unloading">Unloading</option>
                  <option value="reserved">Reserved</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                <select
                  value={editing.type}
                  onChange={(e) => setEditing({ ...editing, type: e.target.value as DockDoor['type'] })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="inbound">Inbound</option>
                  <option value="outbound">Outbound</option>
                  <option value="both">Both</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Vehicle No</label>
                <input
                  type="text"
                  value={editing.vehicleNo}
                  onChange={(e) => setEditing({ ...editing, vehicleNo: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Carrier</label>
                <input
                  type="text"
                  value={editing.carrierName}
                  onChange={(e) => setEditing({ ...editing, carrierName: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Assigned To</label>
                <input
                  type="text"
                  value={editing.workerAssigned}
                  onChange={(e) => setEditing({ ...editing, workerAssigned: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Wait Time (mins)</label>
                <input
                  type="number"
                  value={editing.waitTime}
                  onChange={(e) => setEditing({ ...editing, waitTime: Number(e.target.value) })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
                <textarea
                  value={editing.notes}
                  onChange={(e) => setEditing({ ...editing, notes: e.target.value })}
                  rows={2}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-gray-200 px-4 py-3">
              <button
                onClick={() => setEditing(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
