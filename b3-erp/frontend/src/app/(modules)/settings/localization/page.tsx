'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Globe, ChevronLeft, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { ItAdminService } from '@/services/it-admin.service';

interface LocalizationPrefs {
  language: string;
  timezone: string;
  dateFormat: string;
  currency: string;
}

const DEFAULT_PREFS: LocalizationPrefs = {
  language: 'en',
  timezone: 'Asia/Kolkata',
  dateFormat: 'DD/MM/YYYY',
  currency: 'INR',
};

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'Hindi' },
  { value: 'ta', label: 'Tamil' },
  { value: 'ar', label: 'Arabic' },
  { value: 'fr', label: 'French' },
];

const TIMEZONES = [
  'Asia/Kolkata',
  'Asia/Dubai',
  'UTC',
  'America/New_York',
  'Europe/London',
  'Asia/Singapore',
];

const DATE_FORMATS = ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD', 'DD-MMM-YYYY'];

const CURRENCIES = [
  { value: 'INR', label: 'INR — Indian Rupee (₹)' },
  { value: 'USD', label: 'USD — US Dollar ($)' },
  { value: 'EUR', label: 'EUR — Euro (€)' },
  { value: 'AED', label: 'AED — UAE Dirham (د.إ)' },
  { value: 'GBP', label: 'GBP — British Pound (£)' },
];

const CONFIG_KEY = 'preferences.localization';

export default function LocalizationSettingsPage() {
  const [prefs, setPrefs] = useState<LocalizationPrefs>(DEFAULT_PREFS);
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
          setPrefs({ ...DEFAULT_PREFS, ...(res.value as Partial<LocalizationPrefs>) });
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load localization settings');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const update = <K extends keyof LocalizationPrefs>(key: K, value: LocalizationPrefs[K]) => {
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

  const selectClass =
    'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent';

  return (
    <div className="min-h-screen bg-gray-50 p-3">
      <div className="w-full max-w-2xl">
        <Link href="/settings" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-2">
          <ChevronLeft className="w-4 h-4" /> Back to Settings
        </Link>
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Globe className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Localization</h1>
            <p className="text-gray-600">Language, timezone, and regional formats</p>
          </div>
        </div>

        {error && (
          <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        <div className="bg-white rounded-lg shadow border border-gray-200 p-6 space-y-4">
          {loading ? (
            <div className="flex items-center gap-2 text-gray-500 py-4">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Loading settings…</span>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                <select value={prefs.language} onChange={(e) => update('language', e.target.value)} className={selectClass}>
                  {LANGUAGES.map((l) => (
                    <option key={l.value} value={l.value}>{l.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                <select value={prefs.timezone} onChange={(e) => update('timezone', e.target.value)} className={selectClass}>
                  {TIMEZONES.map((tz) => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Format</label>
                <select value={prefs.dateFormat} onChange={(e) => update('dateFormat', e.target.value)} className={selectClass}>
                  {DATE_FORMATS.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                <select value={prefs.currency} onChange={(e) => update('currency', e.target.value)} className={selectClass}>
                  {CURRENCIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
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
