'use client';

import React, { useState, useEffect } from 'react';
import {
  FileCheck,
  Shield,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  Download,
  ChevronRight,
  ArrowUpRight,
  Filter,
  Search,
  FileText,
  Building2,
  Scale,
  BookOpen,
  ClipboardCheck,
  AlertCircle,
  RefreshCcw,
  ExternalLink,
  Info
} from 'lucide-react';
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import { HrSafetyService, SafetyReport } from '@/services/hr-safety.service';

interface NonComplianceRow {
  id: string;
  requirement: string;
  framework: string;
  severity: string;
  identified: string;
  status: string;
  owner: string;
}

// Framework/category/deadline/audit breakdowns are distinct report shapes not
// carried by the non-compliance list; left as-is pending dedicated feeds.
const regulatoryFrameworks = [
  { name: 'OSHA Standards', total: 48, compliant: 46, score: 96, status: 'Compliant' },
  { name: 'EPA Regulations', total: 32, compliant: 30, score: 94, status: 'Compliant' },
  { name: 'DOT Requirements', total: 24, compliant: 24, score: 100, status: 'Compliant' },
  { name: 'State Safety Code', total: 28, compliant: 26, score: 93, status: 'Minor Issues' },
  { name: 'Industry Standards (ISO)', total: 24, compliant: 21, score: 88, status: 'Action Required' }
];

const complianceByCategory = [
  { category: 'PPE Requirements', compliant: 98 },
  { category: 'Emergency Procedures', compliant: 95 },
  { category: 'Hazard Communication', compliant: 92 },
  { category: 'Machine Guarding', compliant: 89 },
  { category: 'Electrical Safety', compliant: 96 },
  { category: 'Fire Protection', compliant: 94 }
];

const upcomingDeadlines = [
  { id: 'REQ-2024-089', requirement: 'Annual Fire Extinguisher Inspection', framework: 'OSHA', dueDate: '2024-02-15', daysLeft: 24, priority: 'High' },
  { id: 'REQ-2024-092', requirement: 'Forklift Operator Recertification', framework: 'OSHA', dueDate: '2024-02-28', daysLeft: 37, priority: 'Medium' },
  { id: 'REQ-2024-095', requirement: 'Hazmat Storage Audit', framework: 'EPA', dueDate: '2024-03-01', daysLeft: 39, priority: 'High' },
  { id: 'REQ-2024-101', requirement: 'Emergency Drill Documentation', framework: 'State', dueDate: '2024-03-15', daysLeft: 53, priority: 'Medium' },
  { id: 'REQ-2024-105', requirement: 'PPE Inventory Assessment', framework: 'OSHA', dueDate: '2024-03-20', daysLeft: 58, priority: 'Low' }
];

const auditHistory = [
  { date: '2024-01-15', type: 'Internal Audit', scope: 'Full Site', score: 94, findings: 3, status: 'Closed' },
  { date: '2023-11-20', type: 'External Audit', scope: 'Manufacturing', score: 92, findings: 5, status: 'Closed' },
  { date: '2023-09-10', type: 'OSHA Inspection', scope: 'Warehouse', score: 96, findings: 2, status: 'Closed' },
  { date: '2023-07-05', type: 'Insurance Audit', scope: 'Full Site', score: 89, findings: 8, status: 'Closed' }
];

export default function ComplianceReportsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFramework, setSelectedFramework] = useState('all');
  const [nonComplianceItems, setNonComplianceItems] = useState<NonComplianceRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // derived: totals from the reference frameworks, open items from fetched list
  const totalRequirements = regulatoryFrameworks.reduce((s, f) => s + f.total, 0);
  const compliantRequirements = regulatoryFrameworks.reduce((s, f) => s + f.compliant, 0);
  const complianceStats = {
    overallScore: totalRequirements
      ? Math.round((compliantRequirements / totalRequirements) * 1000) / 10
      : 0,
    totalRequirements,
    compliant: compliantRequirements,
    nonCompliant: nonComplianceItems.length, // derived from fetched non-compliance list
    pending: nonComplianceItems.filter((i) => i.status === 'In Progress').length,
    upcomingDeadlines: upcomingDeadlines.length,
  };

  // derived from complianceStats.overallScore
  const complianceGaugeData = [
    { name: 'Score', value: complianceStats.overallScore, fill: '#22c55e' },
  ];

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const rows = await HrSafetyService.getReports('compliance');
        const mapped: NonComplianceRow[] = rows.map((row: SafetyReport) => {
          const meta = (row.meta || {}) as any;
          return {
            id: String(row.id),
            requirement: row.label ?? '',
            framework: row.framework ?? '',
            severity: row.severity ?? '',
            identified: row.period ?? meta.identified ?? '',
            status: row.status ?? '',
            owner: meta.owner ?? '',
          };
        });
        if (!cancelled) setNonComplianceItems(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load compliance items');
          setNonComplianceItems([]);
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
    <div className="p-6 space-y-3 text-sm font-medium">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileCheck className="h-8 w-8 text-orange-600" />
            Compliance Reports & Regulatory Tracking
          </h1>
          <p className="text-gray-500 mt-1 uppercase text-[10px] font-black tracking-widest leading-none">
            Monitor regulatory compliance status and audit readiness
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 border border-blue-100 bg-blue-50 text-blue-600 rounded-lg font-black uppercase text-[10px] tracking-widest hover:bg-blue-100 transition-colors flex items-center gap-2">
            <RefreshCcw className="w-4 h-4" /> Sync Status
          </button>
          <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2 shadow-md font-black uppercase text-[10px] tracking-widest">
            <Download className="w-4 h-4" /> Export Report
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading compliance items…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}

      {/* Compliance Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {/* Compliance Score Gauge */}
        <div className="md:col-span-2 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Overall Compliance Score</p>
              <p className="text-4xl font-black text-green-600 mt-2 italic tracking-tighter leading-none">{complianceStats.overallScore}%</p>
            </div>
            <div className="w-24 h-24">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" data={complianceGaugeData} startAngle={90} endAngle={-270}>
                  <RadialBar dataKey="value" fill="#22c55e" />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span className="text-[11px] text-gray-600 font-bold">All critical requirements met</span>
          </div>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Compliant</p>
              <p className="text-3xl font-black text-green-600 mt-1 italic tracking-tighter leading-none">{complianceStats.compliant}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-xl text-green-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[10px] text-gray-400 mt-4 font-bold">of {complianceStats.totalRequirements} requirements</p>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-red-100 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">Non-Compliant</p>
              <p className="text-3xl font-black text-red-600 mt-1 italic tracking-tighter leading-none">{complianceStats.nonCompliant}</p>
            </div>
            <div className="p-3 bg-red-50 rounded-xl text-red-600">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[10px] text-red-600 mt-4 font-black uppercase tracking-widest">Action Required</p>
        </div>

        <div className="bg-gray-900 p-3 rounded-2xl text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Upcoming Deadlines</p>
              <p className="text-3xl font-black text-white mt-1 italic tracking-tighter leading-none">{complianceStats.upcomingDeadlines}</p>
            </div>
            <div className="p-3 bg-gray-800 rounded-xl text-orange-500">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[10px] text-orange-500 mt-4 font-black uppercase tracking-widest">Next 60 days</p>
          <FileCheck className="absolute -bottom-4 -right-4 w-20 h-20 text-white opacity-5" />
        </div>
      </div>

      {/* Regulatory Frameworks & Category Compliance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Regulatory Frameworks */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-50 flex items-center justify-between">
            <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest italic flex items-center gap-2">
              <Scale className="w-4 h-4 text-orange-600" /> Regulatory Framework Status
            </h3>
            <button className="text-[10px] font-black text-orange-600 hover:text-orange-700 uppercase tracking-widest transition-colors flex items-center gap-1">
              View Details <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-[10px] uppercase font-black text-gray-400 border-b border-gray-100">
                <tr>
                  <th className="px-3 py-2">Framework</th>
                  <th className="px-3 py-2 text-center">Requirements</th>
                  <th className="px-3 py-2 text-center">Compliant</th>
                  <th className="px-3 py-2 text-center">Score</th>
                  <th className="px-3 py-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {regulatoryFrameworks.map((framework) => (
                  <tr key={framework.name} className="hover:bg-gray-50 transition-colors group cursor-pointer">
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600 group-hover:bg-blue-100 transition-colors">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors">{framework.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-center text-gray-600 font-bold">{framework.total}</td>
                    <td className="px-3 py-2 text-center text-green-600 font-black">{framework.compliant}</td>
                    <td className="px-3 py-2 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${framework.score >= 95 ? 'bg-green-500' : framework.score >= 90 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${framework.score}%` }}
                          ></div>
                        </div>
                        <span className="text-[10px] font-black text-gray-600">{framework.score}%</span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${framework.status === 'Compliant' ? 'bg-green-50 text-green-600' :
                          framework.status === 'Minor Issues' ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-600'
                        }`}>
                        {framework.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Compliance by Category */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3">
          <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest italic flex items-center gap-2 mb-3">
            <ClipboardCheck className="w-4 h-4 text-orange-600" /> By Safety Category
          </h3>
          <div className="space-y-2">
            {complianceByCategory.map((cat, i) => (
              <div key={i}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] text-gray-600 font-bold">{cat.category}</span>
                  <span className={`text-[10px] font-black ${cat.compliant >= 95 ? 'text-green-600' : cat.compliant >= 90 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {cat.compliant}%
                  </span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${cat.compliant >= 95 ? 'bg-green-500' : cat.compliant >= 90 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${cat.compliant}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upcoming Deadlines & Non-Compliance Issues */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Upcoming Deadlines */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-50 flex items-center justify-between">
            <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest italic flex items-center gap-2">
              <Calendar className="w-4 h-4 text-orange-600" /> Upcoming Compliance Deadlines
            </h3>
          </div>
          <div className="divide-y divide-gray-50">
            {upcomingDeadlines.map((deadline) => (
              <div key={deadline.id} className="p-4 hover:bg-gray-50 transition-colors cursor-pointer group">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] text-gray-400 font-bold">{deadline.id}</span>
                      <span className="text-[9px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded font-bold">{deadline.framework}</span>
                    </div>
                    <p className="text-[11px] font-bold text-gray-900 group-hover:text-orange-600 transition-colors">{deadline.requirement}</p>
                    <p className="text-[10px] text-gray-500 mt-1">Due: {deadline.dueDate}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase ${deadline.priority === 'High' ? 'bg-red-50 text-red-600' :
                        deadline.priority === 'Medium' ? 'bg-yellow-50 text-yellow-600' : 'bg-gray-50 text-gray-600'
                      }`}>
                      {deadline.priority}
                    </span>
                    <p className={`text-[10px] font-black mt-2 ${deadline.daysLeft <= 30 ? 'text-red-600' : 'text-gray-500'}`}>
                      {deadline.daysLeft} days left
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Non-Compliance Items */}
        <div className="bg-white rounded-2xl border border-red-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-red-50 bg-red-50 flex items-center justify-between">
            <h3 className="text-xs font-black text-red-800 uppercase tracking-widest italic flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Active Non-Compliance Items
            </h3>
            <span className="text-[10px] font-black text-red-600 bg-red-100 px-2 py-0.5 rounded-full">{nonComplianceItems.length} Open</span>
          </div>
          <div className="divide-y divide-gray-50">
            {nonComplianceItems.map((item) => (
              <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors cursor-pointer group">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] text-gray-400 font-bold">{item.id}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${item.severity === 'High' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                        {item.severity}
                      </span>
                    </div>
                    <p className="text-[11px] font-bold text-gray-900 group-hover:text-orange-600 transition-colors">{item.requirement}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[10px] text-gray-500">Framework: {item.framework}</span>
                      <span className="text-[10px] text-gray-500">Owner: {item.owner}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase ${item.status === 'Open' ? 'bg-red-50 text-red-600' :
                        item.status === 'In Progress' ? 'bg-blue-50 text-blue-600' : 'bg-yellow-50 text-yellow-600'
                      }`}>
                      {item.status}
                    </span>
                    <p className="text-[10px] text-gray-400 mt-2">Since: {item.identified}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Audit History */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-50 flex items-center justify-between">
          <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest italic flex items-center gap-2">
            <FileText className="w-4 h-4 text-orange-600" /> Recent Audit History
          </h3>
          <button className="text-[10px] font-black text-orange-600 hover:text-orange-700 uppercase tracking-widest transition-colors flex items-center gap-1">
            View All Audits <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-[10px] uppercase font-black text-gray-400 border-b border-gray-100">
              <tr>
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">Audit Type</th>
                <th className="px-3 py-2">Scope</th>
                <th className="px-3 py-2 text-center">Score</th>
                <th className="px-3 py-2 text-center">Findings</th>
                <th className="px-3 py-2 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {auditHistory.map((audit, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors group cursor-pointer">
                  <td className="px-3 py-2 text-[11px] text-gray-600 font-bold">{audit.date}</td>
                  <td className="px-3 py-2">
                    <span className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors">{audit.type}</span>
                  </td>
                  <td className="px-3 py-2 text-[11px] text-gray-600">{audit.scope}</td>
                  <td className="px-3 py-2 text-center">
                    <span className={`text-sm font-black ${audit.score >= 95 ? 'text-green-600' : audit.score >= 90 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {audit.score}%
                    </span>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <span className="text-[11px] font-bold text-gray-600">{audit.findings}</span>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-green-50 text-green-600">
                      {audit.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Compliance Notice */}
      <div className="bg-blue-50 p-3 rounded-2xl border border-blue-100 flex items-start gap-2">
        <div className="p-2 bg-blue-100 rounded-xl text-blue-600">
          <Info className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[11px] font-bold text-blue-900">Next scheduled external audit: March 15, 2024</p>
          <p className="text-[10px] text-blue-700 mt-1">OSHA compliance inspection covering manufacturing and warehouse facilities. Prepare documentation and ensure all corrective actions are closed.</p>
        </div>
        <button className="ml-auto px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-colors flex items-center gap-1 whitespace-nowrap">
          Prepare Checklist <ExternalLink className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
