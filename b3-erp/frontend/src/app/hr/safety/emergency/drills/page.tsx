'use client';

import React, { useState, useEffect } from 'react';
import {
  Bell,
  Search,
  Plus,
  Calendar,
  Clock,
  Users,
  Timer,
  CheckCircle2,
  AlertTriangle,
  TrendingDown,
  ArrowUpRight,
  MoreVertical,
  ChevronRight,
  Info,
  MapPin,
  AlertCircle,
  X
} from 'lucide-react';
import { HrSafetyService, SafetyDrill } from '@/services/hr-safety.service';

interface DrillHistoryItem {
  id: string;
  type: string;
  date: string;
  startTime: string;
  duration: string;
  participants: number;
  rating: string;
  status: string;
}

export default function EvacuationDrillsPage() {
  const [filter, setFilter] = useState('All');
  const [drillHistory, setDrillHistory] = useState<DrillHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    type: '',
    date: '',
    startTime: '',
    duration: '',
    participants: '',
    rating: 'Satisfactory',
    status: 'Scheduled',
  });

  const load = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const rows = await HrSafetyService.getDrills('drill');
      const mapped: DrillHistoryItem[] = rows.map((row: SafetyDrill) => {
        const meta = (row.meta || {}) as any;
        return {
          id: String(row.code ?? row.id ?? ''),
          type: row.drillType ?? row.name ?? '',
          date: row.conductedDate ?? row.scheduledDate ?? '',
          startTime: meta.startTime ?? '',
          duration: row.duration ?? '',
          participants: row.participants ?? 0,
          rating: row.effectiveness ?? '',
          status: row.status ?? '',
        };
      });
      setDrillHistory(mapped);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load drill history');
      setDrillHistory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const drillsThisYear = drillHistory.length;
  const totalParticipants = drillHistory.reduce((sum, d) => sum + (d.participants || 0), 0);
  const participationRate = drillsThisYear
    ? Math.round((totalParticipants / (drillsThisYear * 100)) * 1000) / 10
    : 0;
  const goodRatings = drillHistory.filter(
    (d) => d.rating === 'Exceeds Expectations' || d.rating === 'Satisfactory',
  ).length;
  const successRate = drillsThisYear
    ? Math.round((goodRatings / drillsThisYear) * 100)
    : 0;

  const handleCreate = async () => {
    if (!form.type) return;
    setSaving(true);
    try {
      await HrSafetyService.createDrill({
        recordType: 'drill',
        drillType: form.type,
        name: form.type,
        scheduledDate: form.date,
        conductedDate: form.status === 'Completed' ? form.date : undefined,
        duration: form.duration,
        participants: Number(form.participants) || 0,
        effectiveness: form.rating,
        status: form.status,
        meta: { startTime: form.startTime },
      });
      setShowModal(false);
      setForm({ type: '', date: '', startTime: '', duration: '', participants: '', rating: 'Satisfactory', status: 'Scheduled' });
      await load();
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to schedule drill');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-3">
      {loading && (
        <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading drill history…
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
            <Bell className="h-8 w-8 text-orange-600" />
            Evacuation Drills & Exercises
          </h1>
          <p className="text-gray-500 mt-1">Manage scheduled safety exercises, track performance metrics, and log regulatory compliance</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Schedule Drill
        </button>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Participants</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalParticipants}</p>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <Timer className="w-5 h-5 text-blue-500" />
            </div>
          </div>
          <p className="text-[10px] text-green-600 mt-4 flex items-center gap-1 font-bold italic">
            <TrendingDown className="w-3 h-3" /> Across {drillsThisYear} logged drills
          </p>
        </div>

        <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Participation Rate</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{participationRate}%</p>
            </div>
            <div className="p-2 bg-green-50 rounded-lg">
              <Users className="w-5 h-5 text-green-500" />
            </div>
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full mt-4 overflow-hidden">
            <div className="bg-green-500 h-full" style={{ width: `${participationRate}%` }}></div>
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Drills (YTD)</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{drillsThisYear}</p>
            </div>
            <div className="p-2 bg-orange-50 rounded-lg">
              <Calendar className="w-5 h-5 text-orange-500" />
            </div>
          </div>
          <p className="text-[10px] text-gray-400 mt-4 uppercase tracking-tighter">Next scheduled: <span className="text-orange-600 font-bold">April 15</span></p>
        </div>

        <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Success Rate</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">{successRate}%</p>
            </div>
            <div className="p-2 bg-purple-50 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-purple-500" />
            </div>
          </div>
          <p className="text-[10px] text-gray-400 mt-4 font-medium italic">OSHA Category A Compliant</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Drill History Table */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden text-sm">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFilter('All')}
                  className={`text-xs font-bold pb-2 border-b-2 transition-colors ${filter === 'All' ? 'border-orange-600 text-gray-900' : 'border-transparent text-gray-400'}`}
                >
                  Recent Activity
                </button>
                <button
                  onClick={() => setFilter('Upcoming')}
                  className={`text-xs font-bold pb-2 border-b-2 transition-colors ${filter === 'Upcoming' ? 'border-orange-600 text-gray-900' : 'border-transparent text-gray-400'}`}
                >
                  Upcoming Schedule
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-[10px] uppercase font-bold text-gray-500 border-b border-gray-100">
                  <tr>
                    <th className="px-3 py-2">Drill Type & ID</th>
                    <th className="px-3 py-2">Date & Time</th>
                    <th className="px-3 py-2 text-center">Duration</th>
                    <th className="px-3 py-2">Performance Rating</th>
                    <th className="px-3 py-2 text-right">Reference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 font-medium">
                  {drillHistory.map((drill) => (
                    <tr key={drill.id} className="hover:bg-gray-50 transition-colors group cursor-pointer">
                      <td className="px-3 py-2">
                        <div className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors uppercase">{drill.type}</div>
                        <div className="text-[10px] text-gray-400 mt-0.5 tracking-tighter">{drill.id} · {drill.participants} Enrolled</div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="text-gray-900">{drill.date}</div>
                        <div className="text-[10px] text-gray-400">{drill.startTime}</div>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className="text-xs text-gray-600 flex items-center justify-center gap-1.5 font-black italic">
                          <Timer className="w-3.5 h-3.5 text-blue-400" /> {drill.duration}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${drill.rating === 'Exceeds Expectations' ? 'bg-green-50 text-green-700' :
                            drill.rating === 'Satisfactory' ? 'bg-blue-50 text-blue-700' : 'bg-orange-50 text-orange-700'
                          }`}>
                          {drill.rating}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <button className="p-1 hover:bg-gray-100 rounded-lg transition-colors"><MoreVertical className="w-4 h-4 text-gray-400" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-gray-100 flex justify-center">
              <button className="text-xs font-bold text-orange-600 hover:underline">View Comprehensive Historical Archive</button>
            </div>
          </div>
        </div>

        {/* Sidebar: Next Up & Observations */}
        <div className="space-y-3">
          <div className="bg-gray-900 p-3 rounded-xl text-white shadow-xl">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Next Drill Session</span>
            </div>
            <h3 className="text-lg font-bold mb-1">Administrative Block A</h3>
            <p className="text-xs text-gray-400 flex items-center gap-2 mb-3 italic">
              <MapPin className="w-3.5 h-3.5 text-orange-600" /> Primary Assembly Point: East Lawn
            </p>

            <div className="space-y-2 mb-3">
              <div className="flex items-center justify-between text-xs py-2 border-b border-gray-800">
                <span className="text-gray-400">Scheduled Date</span>
                <span className="font-bold">April 15, 2024</span>
              </div>
              <div className="flex items-center justify-between text-xs py-2 border-b border-gray-800">
                <span className="text-gray-400">Response Team</span>
                <span className="font-bold">Team Omega</span>
              </div>
            </div>

            <button className="w-full py-2 bg-orange-600 text-white rounded-lg text-xs font-bold hover:bg-orange-700 transition-colors shadow-md flex items-center justify-center gap-2">
              View Readiness Checklist <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-2 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-400" />
              Key Observations
            </h3>
            <div className="space-y-2">
              {[
                { text: 'Assembly Point B signage needs replacement.', priority: 'Medium' },
                { text: 'Stairwell 4 lighting flickering during evacuation.', priority: 'High' }
              ].map((obs, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded-lg flex items-start gap-3">
                  <div className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${obs.priority === 'High' ? 'bg-red-500' : 'bg-orange-500'}`} />
                  <div>
                    <p className="text-[11px] text-gray-600 leading-relaxed font-medium italic">{obs.text}</p>
                    <span className="text-[9px] font-black text-gray-400 uppercase mt-1 inline-block">{obs.priority} Priority</span>
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-4 w-full py-2 text-xs font-bold text-gray-500 hover:text-orange-600 transition-colors flex items-center justify-center gap-1">
              View All Observations <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 p-4">
              <h3 className="font-bold text-gray-900">Schedule Drill</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 p-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Drill Type</label>
                <input value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:ring-orange-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Date</label>
                  <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:ring-orange-500" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Start Time</label>
                  <input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:ring-orange-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Duration</label>
                  <input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })}
                    placeholder="e.g. 3m 42s"
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:ring-orange-500" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Participants</label>
                  <input type="number" value={form.participants} onChange={(e) => setForm({ ...form, participants: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:ring-orange-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Rating</label>
                  <select value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:ring-orange-500">
                    <option>Exceeds Expectations</option>
                    <option>Satisfactory</option>
                    <option>Needs Improvement</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:ring-orange-500">
                    <option>Scheduled</option>
                    <option>Completed</option>
                    <option>Cancelled</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-gray-100 p-4">
              <button onClick={() => setShowModal(false)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={handleCreate} disabled={saving || !form.type}
                className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-bold text-white hover:bg-orange-700 disabled:bg-gray-300">
                {saving ? 'Saving…' : 'Schedule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
