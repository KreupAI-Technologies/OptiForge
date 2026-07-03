'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, FileText, ArrowLeft, Download, Eye, Calendar } from 'lucide-react';
import { fetchReportCatalog } from '@/services/reports-management.service';

interface CatalogReport {
  id: string;
  name: string;
  description: string;
  category: string;
  frequency: string;
  lastGenerated?: string;
}

const defaultHrReports: CatalogReport[] = [
  { id: '1', name: 'Attendance Report', description: 'Employee attendance tracking and punctuality', category: 'Attendance', frequency: 'Daily', lastGenerated: '2025-10-27' },
  { id: '2', name: 'Leave Balance Report', description: 'Employee leave balances by type', category: 'Leave', frequency: 'Monthly', lastGenerated: '2025-10-20' },
  { id: '3', name: 'Payroll Summary', description: 'Monthly payroll processing summary', category: 'Payroll', frequency: 'Monthly', lastGenerated: '2025-10-20' },
  { id: '4', name: 'Performance Metrics', description: 'Employee performance evaluation results', category: 'Performance', frequency: 'Quarterly', lastGenerated: '2025-10-15' },
  { id: '5', name: 'Headcount Report', description: 'Employee count by department/designation', category: 'Workforce', frequency: 'Monthly', lastGenerated: '2025-10-20' },
  { id: '6', name: 'Turnover Analysis', description: 'Employee attrition and retention metrics', category: 'Workforce', frequency: 'Quarterly', lastGenerated: '2025-10-15' },
  { id: '7', name: 'Training Completion Report', description: 'Employee training program completion status', category: 'Training', frequency: 'Monthly', lastGenerated: '2025-10-20' },
  { id: '8', name: 'Overtime Analysis', description: 'Overtime hours and cost analysis', category: 'Payroll', frequency: 'Monthly', lastGenerated: '2025-10-20' },
];

export default function HRReportsPage() {
  const [filterCategory, setFilterCategory] = useState('all');
  const [hrReports, setHrReports] = useState<CatalogReport[]>(defaultHrReports);

  useEffect(() => {
    let cancelled = false;
    fetchReportCatalog('hr')
      .then((items) => {
        if (cancelled || items.length === 0) return;
        setHrReports(
          items.map((it) => ({
            id: it.id,
            name: it.name,
            description: it.description ?? '',
            category: it.category ?? 'General',
            frequency: it.frequency ?? 'On-Demand',
            lastGenerated: it.lastGenerated ?? undefined,
          })),
        );
      })
      .catch(() => {
        // Keep built-in defaults when the catalog endpoint is unavailable.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const categories = ['all', ...Array.from(new Set(hrReports.map(r => r.category)))];
  const filteredReports = filterCategory === 'all' ? hrReports : hrReports.filter(r => r.category === filterCategory);

  return (
    <div className="min-h-screen bg-gray-50 p-3">
      <div className="w-full">
        <div className="mb-3">
          <Link href="/reports" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Reports
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">HR Reports</h1>
              <p className="text-gray-600">Employee analytics and workforce management</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border border-gray-200 p-3 mb-3">
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg">
            {categories.map(cat => (<option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredReports.map((report) => (
            <div key={report.id} className="bg-white rounded-lg shadow border border-gray-200 hover:shadow-lg transition-all p-3">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded">{report.frequency}</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{report.name}</h3>
              <p className="text-sm text-gray-600 mb-3">{report.description}</p>
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <span className="flex items-center gap-1 text-xs text-gray-500"><Calendar className="w-3 h-3" />{report.lastGenerated}</span>
                <div className="flex gap-2">
                  <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Eye className="w-4 h-4" /></button>
                  <button className="p-1.5 text-green-600 hover:bg-green-50 rounded"><Download className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
