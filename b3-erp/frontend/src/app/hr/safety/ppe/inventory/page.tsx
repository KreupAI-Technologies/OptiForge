'use client';

import React, { useState, useEffect } from 'react';
import {
  Boxes,
  Search,
  Filter,
  Plus,
  ArrowUpDown,
  AlertOctagon,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Inbox,
  Truck,
  Building2,
  MoreHorizontal,
  AlertCircle,
  X
} from 'lucide-react';
import { HrSafetyService, SafetyPpe } from '@/services/hr-safety.service';

interface StockLevel {
  id: string;
  name: string;
  category: string;
  onHand: number;
  min: number;
  leadTime: string;
  status: string;
}

export default function PPEInventoryPage() {
  const [filter, setFilter] = useState('All');
  const [stockLevels, setStockLevels] = useState<StockLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    category: '',
    onHand: '',
    min: '',
    leadTime: '',
    status: 'Healthy',
  });

  const load = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const rows = await HrSafetyService.getPpe('stock');
      const mapped: StockLevel[] = rows.map((row: SafetyPpe) => {
        const meta = (row.meta || {}) as any;
        return {
          id: String(row.itemCode ?? row.id ?? ''),
          name: row.itemName ?? '',
          category: row.category ?? '',
          onHand: row.inStock ?? row.quantity ?? 0,
          min: row.reorderLevel ?? 0,
          leadTime: meta.leadTime ?? '',
          status: row.status ?? '',
        };
      });
      setStockLevels(mapped);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load PPE inventory');
      setStockLevels([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const totalSkus = stockLevels.length;
  const lowStockItems = stockLevels.filter((l) => l.onHand <= l.min).length;
  const pendingOrders = stockLevels.filter((l) => l.status === 'Ordered').length;

  const handleCreate = async () => {
    if (!form.name) return;
    setSaving(true);
    try {
      await HrSafetyService.createPpe({
        recordType: 'stock',
        itemName: form.name,
        category: form.category,
        inStock: Number(form.onHand) || 0,
        quantity: Number(form.onHand) || 0,
        reorderLevel: Number(form.min) || 0,
        status: form.status,
        meta: { leadTime: form.leadTime },
      });
      setShowModal(false);
      setForm({ name: '', category: '', onHand: '', min: '', leadTime: '', status: 'Healthy' });
      await load();
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to add stock');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-3">
      {loading && (
        <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading PPE inventory…
        </div>
      )}
      {loadError && !loading && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Boxes className="h-8 w-8 text-orange-600" />
            PPE Inventory
          </h1>
          <p className="text-gray-500 mt-1">Manage safety equipment stock levels, reorder points, and procurement</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Stock
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Active SKUs</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{totalSkus}</p>
          <div className="mt-4 flex items-center gap-2">
            <span className="text-[10px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded font-bold">+2 Added</span>
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl border-red-100 border-2 shadow-sm relative overflow-hidden">
          <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Reorder Alerts</p>
          <p className="text-2xl font-bold text-red-600 mt-2">{lowStockItems}</p>
          <p className="text-[10px] text-red-500 mt-4 font-bold uppercase tracking-tighter">Immediate action required</p>
          <AlertOctagon className="absolute -bottom-2 -right-2 w-16 h-16 text-red-500 opacity-10" />
        </div>

        <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Units On Hand</p>
          <div className="flex items-end gap-2 mt-2">
            <p className="text-2xl font-bold text-gray-900">{stockLevels.reduce((sum, l) => sum + l.onHand, 0)}</p>
            <TrendingUp className="w-4 h-4 text-green-500 mb-1" />
          </div>
          <p className="text-[10px] text-gray-400 mt-4 leading-tight italic">Across all active SKUs</p>
        </div>

        <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Incoming Shipments</p>
          <p className="text-2xl font-bold text-blue-600 mt-2">{pendingOrders}</p>
          <div className="mt-4 flex items-center gap-2">
            <div className="flex -space-x-2">
              <div className="w-6 h-6 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-blue-600 underline cursor-pointer">V1</div>
              <div className="w-6 h-6 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-blue-600 underline cursor-pointer">V2</div>
            </div>
            <span className="text-[9px] text-gray-400 font-bold uppercase">Estimated Tomorrow</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
        {/* Main Inventory Table */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden text-sm">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-gray-900 uppercase tracking-widest text-xs">Stock Level Monitor</h2>
                <div className="h-4 w-px bg-gray-200"></div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Category:</span>
                  <select className="bg-transparent border-none text-[10px] font-bold text-gray-900 focus:ring-0 p-0 cursor-pointer">
                    <option>All Protection Categories</option>
                    <option>Head</option>
                    <option>Eye</option>
                  </select>
                </div>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input type="text" placeholder="Filter by SKU or Name..." className="pl-9 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs w-48" />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-[10px] uppercase font-bold text-gray-500 border-b border-gray-100">
                  <tr>
                    <th className="px-3 py-2">Item & SKU</th>
                    <th className="px-3 py-2 text-center">On Hand</th>
                    <th className="px-3 py-2 text-center">Min Level</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Lead Time</th>
                    <th className="px-3 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 font-medium">
                  {stockLevels.map((lvl) => (
                    <tr key={lvl.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-3 py-2">
                        <div>
                          <p className="text-gray-900 font-bold group-hover:text-orange-600 transition-colors uppercase">{lvl.name}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5 tracking-tighter">{lvl.id} · {lvl.category}</p>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className={`text-sm font-bold ${lvl.onHand <= lvl.min ? 'text-red-600' : 'text-gray-900'}`}>{lvl.onHand}</span>
                      </td>
                      <td className="px-3 py-2 text-center text-gray-400 text-xs">{lvl.min}</td>
                      <td className="px-3 py-2">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold ${lvl.status === 'Healthy' ? 'bg-green-50 text-green-700' :
                            lvl.status === 'Low Stock' ? 'bg-orange-50 text-orange-700' : 'bg-red-50 text-red-700'
                          }`}>
                          <div className={`w-1 h-1 rounded-full ${lvl.status === 'Healthy' ? 'bg-green-500' :
                              lvl.status === 'Low Stock' ? 'bg-orange-500' : 'bg-red-500'
                            }`} />
                          {lvl.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-gray-500 text-xs">
                        <div className="flex items-center gap-2">
                          <Truck className="w-3.5 h-3.5 opacity-40" /> {lvl.leadTime}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <button className="text-[11px] font-bold text-orange-600 flex items-center gap-1 ml-auto hover:gap-2 transition-all">
                          Order <ArrowRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar / Quick Actions */}
        <div className="space-y-3">
          <div className="bg-gray-900 p-3 rounded-xl text-white shadow-xl">
            <h3 className="font-bold text-sm mb-2 flex items-center gap-2">
              <Inbox className="w-4 h-4 text-orange-400" />
              Quick Replenishment
            </h3>
            <div className="space-y-2">
              <div className="p-3 bg-gray-800 rounded-lg border border-gray-700">
                <p className="text-[10px] font-bold text-gray-500 uppercase">Suggested Order</p>
                <p className="text-xs font-bold mt-1 uppercase text-gray-200">50x Safety Goggles</p>
                <p className="text-[9px] text-gray-400 mt-2">Vendor: Industrial Safety Hub</p>
                <button className="mt-3 w-full py-2 bg-orange-600 text-xs font-bold rounded-lg hover:bg-orange-700 transition-colors">Generate PO</button>
              </div>
            </div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-3 text-sm flex items-center gap-2">
              <Building2 className="w-4 h-4 text-gray-400" />
              Wharehouse Allocations
            </h3>
            <div className="space-y-2">
              {[
                { name: 'Main Depot', capacity: 85 },
                { name: 'On-Site Storage', capacity: 42 },
                { name: 'Transit', capacity: 12 },
              ].map((wh, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    <span>{wh.name}</span>
                    <span>{wh.capacity}%</span>
                  </div>
                  <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: `${wh.capacity}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-6 w-full py-2 border border-blue-200 text-blue-600 text-xs font-bold rounded-xl hover:bg-blue-50 transition-colors">Manage Locations</button>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 p-4">
              <h3 className="font-bold text-gray-900">Add New Stock</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 p-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Item Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:ring-orange-500" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Category</label>
                <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:ring-orange-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">On Hand</label>
                  <input type="number" value={form.onHand} onChange={(e) => setForm({ ...form, onHand: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:ring-orange-500" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Min Level</label>
                  <input type="number" value={form.min} onChange={(e) => setForm({ ...form, min: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:ring-orange-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Lead Time</label>
                  <input value={form.leadTime} onChange={(e) => setForm({ ...form, leadTime: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:ring-orange-500" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:ring-orange-500">
                    <option>Healthy</option>
                    <option>Low Stock</option>
                    <option>Ordered</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-gray-100 p-4">
              <button onClick={() => setShowModal(false)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={handleCreate} disabled={saving || !form.name}
                className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-bold text-white hover:bg-orange-700 disabled:bg-gray-300">
                {saving ? 'Saving…' : 'Add Stock'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
