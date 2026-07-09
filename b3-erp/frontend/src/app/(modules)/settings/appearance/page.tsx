'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Palette, ChevronLeft, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { ItAdminService } from '@/services/it-admin.service';

interface AppearancePrefs {
  theme: 'light' | 'dark' | 'system';
  density: 'comfortable' | 'compact';
  sidebarCollapsed: boolean;
}

const DEFAULT_PREFS: AppearancePrefs = {
  theme: 'light',
  density: 'comfortable',
  sidebarCollapsed: false,
};

const THEMES: { value: AppearancePrefs['theme']; label: string; description: string }[] = [
  { value: 'light', label: 'Light', description: 'Bright interface' },
  { value: 'dark', label: 'Dark', description: 'Dimmed interface' },
  { value: 'system', label: 'System', description: 'Match OS setting' },
];

const DENSITIES: { value: AppearancePrefs['density']; label: string; description: string }[] = [
  { value: 'comfortable', label: 'Comfortable', description: 'More spacing between rows' },
  { value: 'compact', label: 'Compact', description: 'Fit more content on screen' },
];

const CONFIG_KEY = 'preferences.appearance';

export default function AppearanceSettingsPage() {
  const [prefs, setPrefs] = useState<AppearancePrefs>(DEFAULT_PREFS);
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
        if (res?.value && typeof res.value === 'object') {
          setPrefs({ ...DEFAULT_PREFS, ...(res.value as Partial<AppearancePrefs>) });
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load appearance settings');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const update = <K extends keyof AppearancePrefs>(key: K, value: AppearancePrefs[K]) => {
    setSaved(false);
    setPrefs((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSaved(false);
      await ItAdminService.setConfigValue(CONFIG_KEY, prefs);
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3">
      <div className="w-full max-w-2xl">
        <Link href="/settings" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-2">
          <ChevronLeft className="w-4 h-4" /> Back to Settings
        </Link>
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-pink-100 rounded-lg">
            <Palette className="w-6 h-6 text-pink-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Appearance</h1>
            <p className="text-gray-600">Theme, density, and sidebar preferences</p>
          </div>
        </div>

        {error && (
          <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6 flex items-center gap-2 text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Loading settings…</span>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">Theme</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {THEMES.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => update('theme', t.value)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      prefs.theme === t.value ? 'border-pink-500 bg-pink-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <p className="font-semibold text-gray-900">{t.label}</p>
                    <p className="text-xs text-gray-600">{t.description}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">Display Density</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {DENSITIES.map((d) => (
                  <button
                    key={d.value}
                    onClick={() => update('density', d.value)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      prefs.density === d.value ? 'border-pink-500 bg-pink-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <p className="font-semibold text-gray-900">{d.label}</p>
                    <p className="text-xs text-gray-600">{d.description}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="font-semibold text-gray-900">Collapse sidebar by default</p>
                  <p className="text-xs text-gray-600">Start each session with a minimized sidebar</p>
                </div>
                <input
                  type="checkbox"
                  checked={prefs.sidebarCollapsed}
                  onChange={(e) => update('sidebarCollapsed', e.target.checked)}
                  className="w-5 h-5 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                />
              </label>
            </div>
          </div>
        )}

        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 flex items-center gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Settings
          </button>
          {saved && (
            <span className="inline-flex items-center gap-1 text-sm text-green-700">
              <CheckCircle className="w-4 h-4" /> Settings saved
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
