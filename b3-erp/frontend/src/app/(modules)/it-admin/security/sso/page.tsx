'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Shield, Lock, Globe, CheckCircle, AlertTriangle, Save, RefreshCw, Server } from 'lucide-react';
import Link from 'next/link';
import { ItAdminService } from '@/services/it-admin.service';

export default function SSOPage() {
    const [enabled, setEnabled] = useState(false);
    const [provider, setProvider] = useState('google');

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const res = await ItAdminService.getConfigValue('it.sso.config');
                const value = res?.value as { enabled?: boolean; provider?: string } | undefined;
                if (!mounted || !value) return;
                if (typeof value.enabled === 'boolean') setEnabled(value.enabled);
                if (typeof value.provider === 'string') setProvider(value.provider);
            } catch {
                // config not set yet — keep defaults
            }
        })();
        return () => {
            mounted = false;
        };
    }, []);

    const handleSave = async () => {
        try {
            await ItAdminService.setConfigValue('it.sso.config', { enabled, provider });
            alert('SSO configuration saved successfully!');
        } catch {
            alert('Failed to save SSO configuration. Please try again.');
        }
    };

    return (
        <div className="w-full min-h-screen bg-gray-50 p-3">
            <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Link href="/settings" className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                        <span className="text-gray-700">Back</span>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Single Sign-On (SSO)</h1>
                        <p className="text-gray-600 mt-1">Configure enterprise identity providers</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {enabled ? 'SSO Enabled' : 'SSO Disabled'}
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={enabled} onChange={() => setEnabled(!enabled)} />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Configuration */}
                <div className="lg:col-span-2 space-y-3">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
                        <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <Server className="w-5 h-5 text-blue-600" />
                            Identity Provider Settings
                        </h2>

                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Provider Type</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['google', 'azure', 'okta'].map((p) => (
                                        <button
                                            key={p}
                                            onClick={() => setProvider(p)}
                                            className={`flex flex-col items-center justify-center p-3 border rounded-xl transition-all ${provider === p
                                                    ? 'border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500'
                                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                }`}
                                        >
                                            <div className="w-8 h-8 mb-2 rounded-full bg-white shadow-sm flex items-center justify-center">
                                                {p === 'google' && <span className="font-bold text-red-500">G</span>}
                                                {p === 'azure' && <span className="font-bold text-blue-500">A</span>}
                                                {p === 'okta' && <span className="font-bold text-blue-800">O</span>}
                                            </div>
                                            <span className="capitalize font-medium">{p === 'azure' ? 'Azure AD' : p}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Client ID / App ID</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Enter Client ID"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Client Secret</label>
                                    <input
                                        type="password"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Enter Client Secret"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Metadata URL / Issuer URI</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="https://accounts.google.com/.well-known/openid-configuration"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                                <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                                    Test Connection
                                </button>
                                <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                                    <Save className="w-4 h-4" />
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
                        <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <Globe className="w-5 h-5 text-purple-600" />
                            Domain Restriction
                        </h2>
                        <p className="text-sm text-gray-600 mb-2">
                            Only allow SSO login for users with email addresses from specific domains.
                        </p>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="e.g. acme-corp.com"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                                Add Domain
                            </button>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm border border-blue-100">
                                kreup.ai
                                <button className="hover:text-blue-900">×</button>
                            </span>
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm border border-blue-100">
                                manufacturing-os.com
                                <button className="hover:text-blue-900">×</button>
                            </span>
                        </div>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-3">
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                        <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                            <Shield className="w-5 h-5" />
                            Security Status
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-blue-700">SSO Status</span>
                                <span className={`font-medium ${enabled ? 'text-green-600' : 'text-gray-500'}`}>
                                    {enabled ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-blue-700">Protocol</span>
                                <span className="font-medium text-blue-900">OIDC / OAuth 2.0</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-blue-700">Last Sync</span>
                                <span className="font-medium text-blue-900">Just now</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl p-3">
                        <h3 className="font-bold text-gray-900 mb-2">Setup Instructions</h3>
                        <ol className="space-y-2 text-sm text-gray-600 list-decimal list-inside">
                            <li>Create an application in your Identity Provider (IdP).</li>
                            <li>Add the following <strong>Redirect URI</strong> to your IdP configuration:
                                <div className="mt-2 p-2 bg-gray-100 rounded border border-gray-200 font-mono text-xs break-all select-all">
                                    https://app.manufacturing-os.com/api/auth/callback
                                </div>
                            </li>
                            <li>Copy the Client ID and Client Secret from your IdP.</li>
                            <li>Paste the credentials in the configuration form.</li>
                            <li>Test the connection before enabling.</li>
                        </ol>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-3">
                        <h3 className="font-bold text-yellow-800 mb-2 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" />
                            Emergency Access
                        </h3>
                        <p className="text-sm text-yellow-700 mb-3">
                            Ensure you have at least one admin account with a password-based login in case of SSO failure.
                        </p>
                        <Link href="/it-admin/users" className="text-sm font-medium text-yellow-800 hover:underline">
                            Manage Admin Accounts →
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
