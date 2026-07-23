'use client';

import { useState, useEffect } from 'react';
import { Award, Users, BookOpen, Calendar, TrendingUp, CheckCircle, Clock, Pencil } from 'lucide-react';
import { HrTalentService } from '@/services/hr-talent.service';

interface LeadershipProgram {
  id: string;
  programName: string;
  description: string;
  provider: string;
  level: 'emerging' | 'mid_level' | 'senior' | 'executive';
  duration: string;
  format: 'classroom' | 'online' | 'hybrid' | 'workshop' | 'coaching';
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  startDate: string;
  endDate: string;
  participants: {
    name: string;
    employeeCode: string;
    department: string;
    status: 'enrolled' | 'in_progress' | 'completed' | 'dropped';
    progress: number;
  }[];
  modules: string[];
  budget: number;
  location: string;
  capacity: number;
  coordinator: string;
}

export default function Page() {
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const [rows, setRows] = useState<LeadershipProgram[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [editRow, setEditRow] = useState<LeadershipProgram | null>(null);
  const [editForm, setEditForm] = useState<Partial<LeadershipProgram>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!editRow) return;
    setSaving(true);
    setSaveError(null);
    try {
      const { id, ...rest } = { ...editRow, ...editForm } as LeadershipProgram;
      await HrTalentService.updateSuccession(editRow.id, { data: rest });
      setRows(prev => prev.map(r => r.id === editRow.id ? { ...r, ...editForm } : r));
      setEditRow(null);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await HrTalentService.getSuccession<LeadershipProgram>('leadership');
        if (!cancelled) setRows(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) { setRows([]); setLoadError(err instanceof Error ? err.message : 'Failed to load data'); }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filteredPrograms = rows.filter(program => {
    const matchesLevel = selectedLevel === 'all' || program.level === selectedLevel;
    const matchesStatus = selectedStatus === 'all' || program.status === selectedStatus;
    return matchesLevel && matchesStatus;
  });

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'executive': return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'senior': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'mid_level': return 'bg-teal-100 text-teal-700 border-teal-300';
      case 'emerging': return 'bg-green-100 text-green-700 border-green-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-300';
      case 'ongoing': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'upcoming': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getParticipantStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-300';
      case 'in_progress': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'enrolled': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'dropped': return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const totalPrograms = rows.length;
  const ongoingPrograms = rows.filter(p => p.status === 'ongoing').length;
  const totalParticipants = rows.reduce((sum, p) => sum + p.participants.length, 0);
  const totalBudget = rows.reduce((sum, p) => sum + p.budget, 0);

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Award className="h-6 w-6 text-teal-600" />
          Leadership Programs
        </h1>
        <p className="text-sm text-gray-600 mt-1">Leadership development programs and training</p>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {loadError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow-sm border border-purple-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide">Total Programs</p>
              <p className="text-3xl font-bold text-purple-900 mt-1">{totalPrograms}</p>
            </div>
            <Award className="h-10 w-10 text-purple-600 opacity-60" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-sm border border-blue-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Ongoing</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">{ongoingPrograms}</p>
            </div>
            <TrendingUp className="h-10 w-10 text-blue-600 opacity-60" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg shadow-sm border border-teal-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-teal-600 uppercase tracking-wide">Participants</p>
              <p className="text-3xl font-bold text-teal-900 mt-1">{totalParticipants}</p>
            </div>
            <Users className="h-10 w-10 text-teal-600 opacity-60" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-sm border border-green-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-green-600 uppercase tracking-wide">Total Budget</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{formatCurrency(totalBudget)}</p>
            </div>
            <BookOpen className="h-10 w-10 text-green-600 opacity-60" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Level</label>
            <select value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
              <option value="all">All Levels</option>
              <option value="executive">Executive</option>
              <option value="senior">Senior</option>
              <option value="mid_level">Mid-Level</option>
              <option value="emerging">Emerging</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
              <option value="all">All Statuses</option>
              <option value="ongoing">Ongoing</option>
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {filteredPrograms.map((program) => (
          <div key={program.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-gray-900">{program.programName}</h3>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full border-2 ${getLevelColor(program.level)}`}>
                    {program.level.replace('_', '-').toUpperCase()}
                  </span>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full border-2 ${getStatusColor(program.status)}`}>
                    {program.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-gray-600 mb-3">{program.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-600 uppercase font-medium mb-1">Provider</p>
                <p className="text-sm font-bold text-gray-900">{program.provider}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-600 uppercase font-medium mb-1">Duration</p>
                <p className="text-sm font-bold text-gray-900">{program.duration}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-600 uppercase font-medium mb-1">Format</p>
                <p className="text-sm font-bold text-gray-900">{program.format}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-600 uppercase font-medium mb-1">Location</p>
                <p className="text-sm font-bold text-gray-900">{program.location}</p>
              </div>
            </div>

            <div className="mb-3">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="h-4 w-4 text-blue-600" />
                <h4 className="text-sm font-bold text-gray-900">Modules</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {program.modules.map((module, idx) => (
                  <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-200">
                    {module}
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-3">
              <div className="flex items-center gap-2 mb-3">
                <Users className="h-4 w-4 text-teal-600" />
                <h4 className="text-sm font-bold text-gray-900">Participants ({program.participants.length}/{program.capacity})</h4>
              </div>
              <div className="space-y-2">
                {program.participants.map((participant, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-gray-900">{participant.name}</p>
                          <span className={`px-2 py-0.5 text-xs font-semibold rounded border ${getParticipantStatusBadge(participant.status)}`}>
                            {participant.status.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{participant.employeeCode} • {participant.department}</p>
                      </div>
                      {participant.status === 'in_progress' && (
                        <div className="text-right">
                          <p className="text-xs text-gray-600">Progress</p>
                          <p className="text-sm font-bold text-teal-600">{participant.progress}%</p>
                        </div>
                      )}
                    </div>
                    {participant.status === 'in_progress' && (
                      <div className="bg-gray-200 rounded-full h-2">
                        <div className="bg-teal-500 rounded-full h-2 transition-all" style={{ width: `${participant.progress}%` }}></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1 text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(program.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} - {new Date(program.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
                <div>
                  <span className="text-gray-600">Budget:</span>
                  <span className="font-bold text-gray-900 ml-2">{formatCurrency(program.budget)}</span>
                </div>
                <div className="text-gray-600">
                  Coordinator: <span className="font-semibold text-gray-900">{program.coordinator.split(' ')[0]}</span>
                </div>
              </div>
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => { setEditRow(program); setEditForm({ programName: program.programName, status: program.status, level: program.level, provider: program.provider, duration: program.duration, location: program.location, coordinator: program.coordinator }); setSaveError(null); }}
                  className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm"
                >
                  <Pencil className="h-3 w-3" />
                  Edit Program
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-lg bg-white shadow-xl">
            <div className="border-b border-gray-200 px-5 py-3">
              <h2 className="text-lg font-bold text-gray-900">Edit Leadership Program</h2>
              <p className="text-sm text-gray-600">{editRow.programName}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 px-5 py-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Program Name</label>
                <input type="text" value={editForm.programName ?? ''} onChange={(e) => setEditForm(f => ({ ...f, programName: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select value={editForm.status ?? 'upcoming'} onChange={(e) => setEditForm(f => ({ ...f, status: e.target.value as LeadershipProgram['status'] }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
                  <option value="upcoming">Upcoming</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                <select value={editForm.level ?? 'mid_level'} onChange={(e) => setEditForm(f => ({ ...f, level: e.target.value as LeadershipProgram['level'] }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
                  <option value="executive">Executive</option>
                  <option value="senior">Senior</option>
                  <option value="mid_level">Mid-Level</option>
                  <option value="emerging">Emerging</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
                <input type="text" value={editForm.provider ?? ''} onChange={(e) => setEditForm(f => ({ ...f, provider: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                <input type="text" value={editForm.duration ?? ''} onChange={(e) => setEditForm(f => ({ ...f, duration: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input type="text" value={editForm.location ?? ''} onChange={(e) => setEditForm(f => ({ ...f, location: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Coordinator</label>
                <input type="text" value={editForm.coordinator ?? ''} onChange={(e) => setEditForm(f => ({ ...f, coordinator: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
            </div>
            {saveError && (
              <div className="mx-5 mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{saveError}</div>
            )}
            <div className="flex justify-end gap-2 border-t border-gray-200 px-5 py-3">
              <button onClick={() => setEditRow(null)} disabled={saving} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm disabled:opacity-50">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium text-sm disabled:opacity-50">{saving ? 'Saving…' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
