'use client';

import React, { useState, useEffect } from 'react';
import {
  Award,
  Search,
  Filter,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Download,
  MoreVertical,
  Plus
} from 'lucide-react';
import { HrPagesService } from '@/services/hr-pages.service';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend
} from 'recharts';

// Mock Data
const expiryAlerts = [
  { id: 1, employee: 'John Doe', cert: 'AWS Solutions Architect', expiry: '2025-01-30', daysLeft: 8, status: 'Critical' },
  { id: 2, employee: 'Alice Smith', cert: 'PMP Certification', expiry: '2025-02-15', daysLeft: 24, status: 'Warning' },
  { id: 3, employee: 'Bob Wilson', cert: 'Cisco CCNP', expiry: '2025-02-28', daysLeft: 37, status: 'Warning' },
];

interface CertificationRecord {
  id: number | string;
  employee: string;
  role: string;
  cert: string;
  provider: string;
  issued: string;
  expires: string;
  status: string;
}

const complianceData = [
  { name: 'Compliant', value: 350, color: '#22c55e' },
  { name: 'Non-Compliant', value: 45, color: '#ef4444' },
  { name: 'Expiring Soon', value: 30, color: '#f59e0b' },
];

export default function CertificationsPage() {
  const [filterStatus, setFilterStatus] = useState('All');
  const [certifications, setCertifications] = useState<CertificationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = (await HrPagesService.skillAssessments()) as any[];
        const mapped: CertificationRecord[] = (Array.isArray(raw) ? raw : []).map((r) => ({
          id: r.id ?? '',
          employee: r.employee ?? '',
          role: r.role ?? '',
          cert: r.cert ?? r.certification ?? '',
          provider: r.provider ?? '',
          issued: r.issued ?? '',
          expires: r.expires ?? '',
          status: r.status ?? 'Active',
        }));
        if (!cancelled) setCertifications(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load certifications');
          setCertifications([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Award className="h-8 w-8 text-purple-600" />
            Certification Tracking
          </h1>
          <p className="text-gray-500 mt-1">Manage professional certifications and compliance</p>
        </div>
        <div className="flex gap-3">
          <button className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-colors">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </button>
          <button className="inline-flex items-center px-4 py-2 bg-purple-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-purple-700 shadow-sm transition-colors">
            <Plus className="w-4 h-4 mr-2" />
            Add Certification
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading certifications…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}

      {/* Expiry Alerts & Compliance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">

        {/* Compliance Chart */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 flex flex-col items-center justify-center">
          <h2 className="text-lg font-bold text-gray-900 w-full text-left mb-2">Overall Compliance</h2>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={complianceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {complianceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center mt-2">
            <span className="text-3xl font-bold text-gray-900">92%</span>
            <p className="text-xs text-gray-500">Compliance Rate</p>
          </div>
        </div>

        {/* Expiry Alerts */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-3">
          <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Expiring Within 60 Days
          </h2>
          <div className="space-y-3">
            {expiryAlerts.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${alert.status === 'Critical' ? 'bg-red-500' : 'bg-amber-500'}`}></div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{alert.cert}</h3>
                    <p className="text-xs text-gray-500">{alert.employee} • Expires {alert.expiry}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${alert.status === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                    {alert.daysLeft} days left
                  </span>
                  <button className="text-xs font-medium text-purple-600 hover:text-purple-800">
                    Remind
                  </button>
                </div>
              </div>
            ))}
            {expiryAlerts.length === 0 && (
              <p className="text-sm text-gray-500">No certifications expiring soon.</p>
            )}
          </div>
        </div>
      </div>

      {/* Certification Repository Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-gray-900">All Certifications</h2>
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 w-full sm:w-64"
              />
            </div>
            <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-500">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500">
              <tr>
                <th className="px-3 py-2">Employee / Role</th>
                <th className="px-3 py-2">Certification</th>
                <th className="px-3 py-2">Provider</th>
                <th className="px-3 py-2">Validity</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {certifications.map((cert) => (
                <tr key={cert.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-2">
                    <p className="font-semibold text-gray-900">{cert.employee}</p>
                    <p className="text-xs text-gray-500">{cert.role}</p>
                  </td>
                  <td className="px-3 py-2 font-medium text-gray-900">{cert.cert}</td>
                  <td className="px-3 py-2">{cert.provider}</td>
                  <td className="px-3 py-2">
                    <div className="flex flex-col text-xs">
                      <span className="text-green-700">Issued: {cert.issued}</span>
                      <span className="text-red-700">Expires: {cert.expires}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${cert.status === 'Active' ? 'text-green-700 bg-green-50 ring-green-600/20' :
                        'text-amber-700 bg-amber-50 ring-amber-600/20'
                      }`}>
                      {cert.status === 'Active' ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <AlertTriangle className="w-3 h-3 mr-1" />}
                      {cert.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
