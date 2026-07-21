'use client';

import { useState, useEffect } from 'react';
import { TrainingDevelopmentService } from '@/services/training-development.service';
import { Clock, Mail, AlertCircle, ArrowUpCircle } from 'lucide-react';

interface WaitlistEntry {
  id: string;
  name: string;
  program: string;
  dateAdded: string;
  priority: 'High' | 'Normal' | 'Low';
  position: number;
}

export default function WaitingListPage() {
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const load = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const rows = await TrainingDevelopmentService.getWaitlist('');
      const mapped: WaitlistEntry[] = (Array.isArray(rows) ? rows : []).map((r: any) => ({
        id: String(r.id ?? ''),
        name: r.employeeName ?? '',
        program: r.programId ?? r.scheduleId ?? '',
        dateAdded: (r.createdAt ?? '').toString().split('T')[0] ?? '',
        priority: 'Normal',
        position: Number(r.position ?? 0),
      }));
      setWaitlist(mapped);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load data');
      setWaitlist([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePromote = async (id: string, name: string) => {
    if (!confirm(`Promote ${name} to enrolled status?`)) return;
    setActionId(id);
    setActionError(null);
    setActionSuccess(null);
    try {
      await TrainingDevelopmentService.updateWaitlistEntry(id, { status: 'enrolled' });
      setActionSuccess(`${name} has been promoted to the main list.`);
      await load();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : `Failed to promote ${name}.`);
    } finally {
      setActionId(null);
    }
  };

  const handleNotify = async (id: string, name: string) => {
    setActionId(id);
    setActionError(null);
    setActionSuccess(null);
    try {
      await TrainingDevelopmentService.notifyWaitlist(id);
      setActionSuccess(`${name} has been notified.`);
      await load();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : `Failed to notify ${name}.`);
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="p-6 space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Clock className="h-8 w-8 text-purple-600" />
            Waiting List
          </h1>
          <p className="text-gray-500 mt-1">Manage employees waiting for training spots.</p>
        </div>
      </div>

      {loadError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />{loadError}
        </div>
      )}
      {actionError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{actionError}</div>
      )}
      {actionSuccess && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{actionSuccess}</div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 text-left text-sm text-gray-500 bg-gray-50/50">
                <th className="py-4 pl-6 font-medium">Position</th>
                <th className="py-4 font-medium">Employee</th>
                <th className="py-4 font-medium">Program</th>
                <th className="py-4 font-medium">Date Added</th>
                <th className="py-4 font-medium">Priority</th>
                <th className="py-4 font-medium text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {waitlist.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">No employees on the waiting list.</td>
                </tr>
              ) : (
                waitlist.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 pl-6">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-sm font-semibold text-gray-600">
                        {entry.position}
                      </span>
                    </td>
                    <td className="py-4 font-medium text-gray-900">{entry.name}</td>
                    <td className="py-4 text-gray-600">{entry.program}</td>
                    <td className="py-4 text-gray-500 text-sm">{entry.dateAdded}</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${entry.priority === 'High' ? 'bg-red-100 text-red-700' :
                          entry.priority === 'Normal' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                        }`}>
                        {entry.priority}
                      </span>
                    </td>
                    <td className="py-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleNotify(entry.id, entry.name)}
                          disabled={actionId === entry.id}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                          title="Notify Employee"
                        >
                          <Mail className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handlePromote(entry.id, entry.name)}
                          disabled={actionId === entry.id}
                          className="flex items-center gap-1 px-3 py-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                        >
                          <ArrowUpCircle className="h-3 w-3" />
                          {actionId === entry.id ? 'Promoting…' : 'Promote'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
