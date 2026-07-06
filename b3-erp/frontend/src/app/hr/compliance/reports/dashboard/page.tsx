'use client';

import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export default function Page() {
  const [complianceScore, setComplianceScore] = useState(94);
  const [stats, setStats] = useState({ licenses: 0, activeAudits: 0, findings: 0, overdue: 0 });

  useEffect(() => {
    async function loadData() {
      try {
        const [licenseRes, auditRes] = await Promise.all([
          fetch(`${API_BASE_URL}/hr/compliance-licenses/summary?companyId=default-company-id`),
          fetch(`${API_BASE_URL}/hr/compliance-audits/summary?companyId=default-company-id`),
        ]);
        const licenseSummary = licenseRes.ok ? await licenseRes.json() : {};
        const auditSummary = auditRes.ok ? await auditRes.json() : {};
        setStats({
          licenses: licenseSummary?.total ?? 0,
          activeAudits: auditSummary?.total ?? 0,
          findings: licenseSummary?.findings ?? auditSummary?.findings ?? 0,
          overdue: licenseSummary?.overdue ?? auditSummary?.overdue ?? 0,
        });
      } catch {
        // keep defaults on failure
      }
    }
    loadData();
  }, []);

  return (
    <div className="w-full h-full px-3 py-2">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-3">
        <BarChart3 className="h-6 w-6 text-indigo-600" />
        Compliance Dashboard
      </h1>
      <div className="grid grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-lg border border-green-200">
          <p className="text-xs font-semibold text-green-600 uppercase">Compliance Score</p>
          <p className="text-3xl font-bold text-green-900">{complianceScore}%</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg border border-blue-200">
          <p className="text-xs font-semibold text-blue-600 uppercase">Active Licenses</p>
          <p className="text-3xl font-bold text-blue-900">{stats.licenses}</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-3 rounded-lg border border-yellow-200">
          <p className="text-xs font-semibold text-yellow-600 uppercase">Open Findings</p>
          <p className="text-3xl font-bold text-yellow-900">{stats.findings}</p>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 p-3 rounded-lg border border-red-200">
          <p className="text-xs font-semibold text-red-600 uppercase">Overdue Items</p>
          <p className="text-3xl font-bold text-red-900">{stats.overdue}</p>
        </div>
      </div>
      <div className="bg-white p-3 rounded-lg border border-gray-200">
        <h2 className="text-lg font-bold text-gray-900 mb-2">Compliance Overview</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <span className="text-sm font-medium text-gray-900">Labor Laws</span>
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <span className="text-sm font-medium text-gray-900">POSH Compliance</span>
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
          <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
            <span className="text-sm font-medium text-gray-900">Safety Audits</span>
            <AlertCircle className="h-5 w-5 text-yellow-600" />
          </div>
        </div>
      </div>
    </div>
  );
}
