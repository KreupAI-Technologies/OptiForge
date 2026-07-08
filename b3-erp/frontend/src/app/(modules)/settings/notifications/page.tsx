'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell, ChevronLeft, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { ItAdminService } from '@/services/it-admin.service';

type Channel = 'email' | 'inApp' | 'sms';

interface CategoryPref {
  id: string;
  name: string;
  description: string;
  email: boolean;
  inApp: boolean;
  sms: boolean;
}

const DEFAULT_CATEGORIES: CategoryPref[] = [
  { id: 'orders', name: 'Orders & Sales', description: 'New orders, quotes, and status changes', email: true, inApp: true, sms: false },
  { id: 'inventory', name: 'Inventory', description: 'Low stock and reorder alerts', email: true, inApp: true, sms: false },
  { id: 'production', name: 'Production', description: 'Work order and schedule updates', email: false, inApp: true, sms: false },
  { id: 'approvals', name: 'Approvals', description: 'Pending approvals awaiting your action', email: true, inApp: true, sms: true },
  { id: 'security', name: 'Security', description: 'Sign-in alerts and account changes', email: true, inApp: true, sms: true },
  { id: 'system', name: 'System', description: 'Maintenance windows and outages', email: false, inApp: true, sms: false },
];

const CONFIG_KEY = 'preferences.notifications';

export default function NotificationSettingsPage() {
  const [categories, setCategories] = useState<CategoryPref[]>(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await ItAdminService.getConfigValue(CONFIG_KEY);
        if (cancelled) return;
        if (res?.value && Array.isArray(res.value)) {
          setCategories(res.value as CategoryPref[]);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load notification preferences');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const toggle = (id: string, channel: Channel) => {
    setSaved(false);
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [channel]: !c[channel] } : c)),
    );
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSaved(false);
      await ItAdminService.setConfigValue(CONFIG_KEY, categories);
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3">
      <div className="w-full max-w-4xl">
        <Link href="/settings" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-2">
          <ChevronLeft className="w-4 h-4" /> Back to Settings
        </Link>
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-green-100 rounded-lg">
            <Bell className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notification Preferences</h1>
            <p className="text-gray-600">Choose how you receive alerts for each category</p>
          </div>
        </div>

        {error && (
          <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center gap-2 text-gray-500 p-6">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Loading preferences…</span>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Category</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Email</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">In-App</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">SMS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{cat.name}</p>
                      <p className="text-sm text-gray-500">{cat.description}</p>
                    </td>
                    {(['email', 'inApp', 'sms'] as Channel[]).map((ch) => (
                      <td key={ch} className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={cat[ch]}
                          onChange={() => toggle(cat.id, ch)}
                          className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500 cursor-pointer"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Preferences
          </button>
          {saved && (
            <span className="inline-flex items-center gap-1 text-sm text-green-700">
              <CheckCircle className="w-4 h-4" /> Preferences saved
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
