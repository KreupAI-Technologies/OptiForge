'use client';

import { useEffect, useState } from 'react';
import { Settings, Loader2, AlertCircle, CheckCircle, Shield } from 'lucide-react';
import { ItAdminService, type PasswordPolicyDto } from '@/services/it-admin.service';

export default function ITAdminSettingsPage() {
  const [policy, setPolicy] = useState<PasswordPolicyDto | null>(null);
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
        const res = await ItAdminService.getPasswordPolicy();
        if (!cancelled) setPolicy(res);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load system settings');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const update = <K extends keyof PasswordPolicyDto>(key: K, value: PasswordPolicyDto[K]) => {
    setSaved(false);
    setPolicy((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const handleSave = async () => {
    if (!policy) return;
    try {
      setSaving(true);
      setError(null);
      setSaved(false);
      const res = await ItAdminService.savePasswordPolicy(policy);
      setPolicy(res);
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const numberField = (label: string, key: keyof PasswordPolicyDto) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type="number"
        value={Number(policy?.[key] ?? 0)}
        onChange={(e) => update(key, Number(e.target.value) as never)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
      />
    </div>
  );

  const toggleField = (label: string, key: keyof PasswordPolicyDto) => (
    <label className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
      <input
        type="checkbox"
        checked={Boolean(policy?.[key])}
        onChange={(e) => update(key, e.target.checked as never)}
        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
      />
      <span className="text-sm text-gray-900">{label}</span>
    </label>
  );

  return (
    <div className="min-h-screen bg-gray-50 px-3 py-2">
      <div className="mb-3 flex items-center gap-2">
        <Settings className="w-7 h-7 text-green-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Password and security policy configuration</p>
        </div>
      </div>

      {error && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6 flex items-center gap-2 text-gray-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Loading settings…</span>
        </div>
      ) : !policy ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-sm text-gray-500">
          No system settings are available yet.
        </div>
      ) : (
        <div className="max-w-3xl bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-600" /> Password Policy
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            {numberField('Minimum Length', 'minLength')}
            {numberField('Maximum Length', 'maxLength')}
            {numberField('Expiry (days)', 'expiryDays')}
            {numberField('Password History Count', 'historyCount')}
            {numberField('Lockout Threshold', 'lockoutThreshold')}
            {numberField('Lockout Duration (mins)', 'lockoutDurationMinutes')}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
            {toggleField('Require uppercase letters', 'requireUppercase')}
            {toggleField('Require lowercase letters', 'requireLowercase')}
            {toggleField('Require numbers', 'requireNumbers')}
            {toggleField('Require special characters', 'requireSpecialChars')}
            {toggleField('MFA required', 'mfaRequired')}
          </div>
        </div>
      )}

      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving || loading || !policy}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
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
  );
}
