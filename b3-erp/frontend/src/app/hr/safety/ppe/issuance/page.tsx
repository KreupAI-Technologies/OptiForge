'use client';

import React, { useState, useEffect } from 'react';
import {
  Shield,
  Search,
  UserPlus,
  ClipboardCheck,
  ChevronRight,
  HardHat,
  Footprints,
  Eye,
  Hand,
  Shirt,
  Plus,
  ArrowRight,
  Info,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { HrSafetyService, SafetyPpe } from '@/services/hr-safety.service';

interface PpeCatalogItem {
  id: string;
  name: string;
  icon: any;
  category: string;
  stock: number;
}

const employeeList = [
  { id: 'EMP-012', name: 'Alex Johnson', department: 'Maintenance', lastIssue: '2023-11-15' },
  { id: 'EMP-045', name: 'Maria Garcia', department: 'Production', lastIssue: '2024-01-20' },
  { id: 'EMP-089', name: 'Sam Taylor', department: 'Logistics', lastIssue: '2023-09-10' },
];

export default function PPEIssuancePage() {
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isIssued, setIsIssued] = useState(false);
  const [ppeCatalog, setPpeCatalog] = useState<PpeCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const rows = await HrSafetyService.getPpe('issuance');
        const mapped: PpeCatalogItem[] = rows.map((row: SafetyPpe) => ({
          id: String(row.itemCode ?? row.id ?? ''),
          name: row.itemName ?? '',
          icon: Shield,
          category: row.category ?? '',
          stock: row.inStock ?? row.quantity ?? 0,
        }));
        if (!cancelled) setPpeCatalog(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load PPE catalog');
          setPpeCatalog([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleItem = (id: string) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleIssue = () => {
    setIsIssued(true);
    setTimeout(() => {
      setIsIssued(false);
      setSelectedEmployee(null);
      setSelectedItems([]);
    }, 3000);
  };

  return (
    <div className="p-6 space-y-3">
      {loading && (
        <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading PPE catalog…
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
            <Shield className="h-8 w-8 text-orange-600" />
            PPE Issuance
          </h1>
          <p className="text-gray-500 mt-1">Issue personal protective equipment to employees and log receipt</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Step 1: Employee Selection */}
        <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm space-y-3">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm italic">1</div>
            <h3 className="font-bold text-gray-900 uppercase tracking-wider text-sm">Select Employee</h3>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search employee name or ID..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          <div className="space-y-2">
            {employeeList.map((emp) => (
              <div
                key={emp.id}
                onClick={() => setSelectedEmployee(emp)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${selectedEmployee?.id === emp.id
                  ? 'bg-orange-50 border-orange-200 shadow-sm ring-1 ring-orange-200'
                  : 'bg-white border-gray-100 hover:border-orange-100'
                  }`}
              >
                <div>
                  <p className={`font-bold text-sm ${selectedEmployee?.id === emp.id ? 'text-orange-900' : 'text-gray-900'}`}>{emp.name}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-tighter">{emp.id} · {emp.department}</p>
                </div>
                {selectedEmployee?.id === emp.id && <CheckCircle2 className="w-5 h-5 text-orange-600" />}
              </div>
            ))}
          </div>
        </div>

        {/* Step 2: Item Selection */}
        <div className="lg:col-span-2 space-y-3">
          <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm italic">2</div>
                <h3 className="font-bold text-gray-900 uppercase tracking-wider text-sm">Select Equipment to Issue</h3>
              </div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{selectedItems.length} items selected</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {ppeCatalog.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleItem(item.id)}
                  className={`p-4 rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${selectedItems.includes(item.id)
                    ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-100'
                    : 'bg-white border-gray-100 hover:border-blue-100'
                    }`}
                >
                  <div className={`p-3 rounded-lg ${selectedItems.includes(item.id) ? 'bg-white text-blue-600 shadow-sm' : 'bg-gray-50 text-gray-400'}`}>
                    <item.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <p className={`font-bold text-sm ${selectedItems.includes(item.id) ? 'text-blue-900' : 'text-gray-900'}`}>{item.name}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[10px] text-gray-400 uppercase italic font-medium">{item.category}</span>
                      <span className={`text-[10px] font-bold ${item.stock < 30 ? 'text-red-500' : 'text-green-600'}`}>In Stock: {item.stock}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Step 3: Confirmation */}
            <div className="pt-6 border-t border-gray-100">
              <div className="bg-gray-50 p-3 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <p className="text-[11px] text-gray-500 leading-relaxed max-w-md">
                    By issuing these items, the employee will be required to acknowledge receipt via their personal dashboard or mobile terminal. Lifespan tracking will begin immediately.
                  </p>
                </div>
                <button
                  disabled={!selectedEmployee || selectedItems.length === 0 || isIssued}
                  onClick={handleIssue}
                  className="flex-shrink-0 inline-flex items-center px-6 py-2.5 bg-orange-600 text-white rounded-lg text-sm font-bold hover:bg-orange-700 shadow-md transition-all disabled:bg-gray-300 disabled:cursor-not-allowed uppercase tracking-wider gap-2"
                >
                  {isIssued ? (
                    <>Processing <CheckCircle2 className="w-4 h-4" /></>
                  ) : (
                    <>Confirm Issuance <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Quick Recap / Recently Issued */}
          <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-2 text-sm flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-gray-400" />
              Recent Issuance Activity
            </h3>
            <div className="space-y-3">
              {[
                { name: 'John Doe', items: 'Hard Hat, Gloves', time: '14 mins ago' },
                { name: 'Maria Garcia', items: 'Safety Boots', time: '2 hours ago' },
                { name: 'Robert Smith', items: 'Eye Protection', time: 'Yesterday' }
              ].map((log, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-2 border-b border-gray-50 last:border-0 italic">
                  <span className="text-gray-600"><span className="font-bold text-gray-800 not-italic uppercase">{log.name}</span> issued {log.items}</span>
                  <span className="text-gray-400 font-medium">{log.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
