'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Factory, FileText, ArrowLeft, Download, Eye, Calendar } from 'lucide-react';
import { fetchReportCatalog } from '@/services/reports-management.service';

interface CatalogReport {
  id: string;
  name: string;
  description: string;
  category: string;
  frequency: string;
  lastGenerated?: string;
}

const defaultProductionReports: CatalogReport[] = [
  { id: '1', name: 'Work Order Status Report', description: 'Current status of all work orders', category: 'Work Orders', frequency: 'Daily', lastGenerated: '2025-10-27' },
  { id: '2', name: 'Production Efficiency Report', description: 'OEE and efficiency metrics by line/machine', category: 'Efficiency', frequency: 'Weekly', lastGenerated: '2025-10-26' },
  { id: '3', name: 'Capacity Utilization Report', description: 'Machine and labor capacity analysis', category: 'Capacity', frequency: 'Weekly', lastGenerated: '2025-10-26' },
  { id: '4', name: 'Quality Control Report', description: 'Defect rates and quality metrics', category: 'Quality', frequency: 'Daily', lastGenerated: '2025-10-27' },
  { id: '5', name: 'Production Schedule Adherence', description: 'Planned vs actual production timelines', category: 'Scheduling', frequency: 'Weekly', lastGenerated: '2025-10-25' },
  { id: '6', name: 'Material Consumption Report', description: 'Raw material usage and variance', category: 'Materials', frequency: 'Weekly', lastGenerated: '2025-10-26' },
  { id: '7', name: 'Downtime Analysis', description: 'Machine downtime tracking and reasons', category: 'Maintenance', frequency: 'Weekly', lastGenerated: '2025-10-24' },
  { id: '8', name: 'Labor Productivity Report', description: 'Worker efficiency and output analysis', category: 'Labor', frequency: 'Weekly', lastGenerated: '2025-10-26' },
  { id: '9', name: 'Cost of Production Report', description: 'Detailed production cost breakdown', category: 'Costing', frequency: 'Monthly', lastGenerated: '2025-10-20' },
];

export default function ProductionReportsPage() {
  const [filterCategory, setFilterCategory] = useState('all');
  const [productionReports, setProductionReports] = useState<CatalogReport[]>(defaultProductionReports);

  useEffect(() => {
    let cancelled = false;
    fetchReportCatalog('production')
      .then((items) => {
        if (cancelled || items.length === 0) return;
        setProductionReports(
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

  const categories = ['all', ...Array.from(new Set(productionReports.map(r => r.category)))];
  const filteredReports = filterCategory === 'all' ? productionReports : productionReports.filter(r => r.category === filterCategory);

  return (
    <div className="min-h-screen bg-gray-50 p-3">
      <div className="w-full">
        <div className="mb-3">
          <Link href="/reports" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Reports
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Factory className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Production Reports</h1>
              <p className="text-gray-600">Manufacturing efficiency and performance analytics</p>
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
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-red-600" />
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
