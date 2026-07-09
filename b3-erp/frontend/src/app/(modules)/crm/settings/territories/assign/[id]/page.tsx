'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, UserPlus, AlertCircle } from 'lucide-react';
import { crmService } from '@/services/crm.service';

interface AssignForm {
  name: string;
  assignedUserId: string;
  assignedTeamId: string;
}

export default function TerritoryAssignPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [form, setForm] = useState<AssignForm>({
    name: '',
    assignedUserId: '',
    assignedTeamId: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const t = (await crmService.territories.getById(params.id)) as any;
        if (cancelled) return;
        if (!t || !t.id) {
          setNotFound(true);
          return;
        }
        setForm({
          name: t.name ?? '',
          assignedUserId: t.assignedUserId ?? '',
          assignedTeamId: t.assignedTeamId ?? '',
        });
      } catch (err) {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : 'Failed to load territory');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError(null);
    try {
      await crmService.territories.update(params.id, {
        assignedUserId: form.assignedUserId || undefined,
        assignedTeamId: form.assignedTeamId || undefined,
      });
      router.push('/crm/settings/territories');
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to assign territory');
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full h-full px-3 py-2 space-y-3">
      <div className="flex items-center">
        <button
          onClick={() => router.push('/crm/settings/territories')}
          className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Territories</span>
        </button>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading territory…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}
      {notFound && !isLoading && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          Territory not found.
        </div>
      )}

      {!isLoading && !loadError && !notFound && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 space-y-4 max-w-2xl">
          <h1 className="text-xl font-bold text-gray-900">Assign Territory</h1>
          <p className="text-sm text-gray-600">
            Assign an owner and/or team to <span className="font-medium text-gray-900">{form.name}</span>.
          </p>

          {saveError && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4" />
              {saveError}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Assigned Owner (User ID)</label>
            <input
              type="text"
              placeholder="Enter user ID"
              value={form.assignedUserId}
              onChange={(e) => setForm({ ...form, assignedUserId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Assigned Team (Team ID)</label>
            <input
              type="text"
              placeholder="Enter team ID"
              value={form.assignedTeamId}
              onChange={(e) => setForm({ ...form, assignedTeamId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => router.push('/crm/settings/territories')}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
            >
              <UserPlus className="w-4 h-4" />
              {isSaving ? 'Assigning…' : 'Assign Territory'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
