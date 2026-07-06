'use client';

import { useState, useEffect } from 'react';
import { BookOpen, Download, FileText, Users, Calendar, CheckCircle } from 'lucide-react';
import { HrComplianceDocsService, ComplianceRegister } from '@/services/hr-compliance-docs.service';

interface StatutoryRegister {
  id: string;
  registerName: string;
  act: string;
  formNumber: string;
  applicability: string;
  frequency: 'daily' | 'monthly' | 'ongoing';
  responsibility: string;
  lastUpdated: string;
  status: 'up_to_date' | 'needs_update' | 'overdue';
  totalEntries: number;
  format: 'physical' | 'electronic' | 'both';
  retentionPeriod: string;
}

export default function Page() {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedFormat, setSelectedFormat] = useState('all');
  const [items, setItems] = useState<StatutoryRegister[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const rows = await HrComplianceDocsService.getRegisters('register');
        if (!active) return;
        const mapped: StatutoryRegister[] = rows.map((r: ComplianceRegister) => ({
          id: r.id,
          registerName: r.registerName || '',
          act: r.act || '',
          formNumber: r.formNumber || '',
          applicability: r.applicability || '',
          frequency: (r.frequency as StatutoryRegister['frequency']) || 'monthly',
          responsibility: r.responsibility || '',
          lastUpdated: r.lastUpdated || '',
          status: (r.status as StatutoryRegister['status']) || 'up_to_date',
          totalEntries: r.totalEntries || 0,
          format: (r.format as StatutoryRegister['format']) || 'both',
          retentionPeriod: r.retentionPeriod || '',
        }));
        setItems(mapped);
        setError(null);
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : 'Failed to load registers');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const sourceRegisters = items;

  const filteredRegisters = sourceRegisters.filter(register => {
    const matchesStatus = selectedStatus === 'all' || register.status === selectedStatus;
    const matchesFormat = selectedFormat === 'all' || register.format === selectedFormat;
    return matchesStatus && matchesFormat;
  });

  const stats = {
    total: sourceRegisters.length,
    upToDate: sourceRegisters.filter(r => r.status === 'up_to_date').length,
    needsUpdate: sourceRegisters.filter(r => r.status === 'needs_update').length,
    overdue: sourceRegisters.filter(r => r.status === 'overdue').length
  };

  const statusColors = {
    up_to_date: 'bg-green-100 text-green-700 border-green-300',
    needs_update: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    overdue: 'bg-red-100 text-red-700 border-red-300'
  };

  const formatBadgeColors = {
    physical: 'bg-blue-100 text-blue-700',
    electronic: 'bg-purple-100 text-purple-700',
    both: 'bg-teal-100 text-teal-700'
  };

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-red-600" />
          Statutory Labor Registers
        </h1>
        <p className="text-sm text-gray-600 mt-1">Maintain mandatory registers as per Indian labor laws</p>
      </div>

      {loading && (
        <div className="mb-3 text-sm text-gray-500">Loading registers…</div>
      )}
      {error && (
        <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error} — showing sample data.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-sm border border-blue-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Total Registers</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">{stats.total}</p>
            </div>
            <BookOpen className="h-10 w-10 text-blue-600 opacity-60" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-sm border border-green-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-green-600 uppercase tracking-wide">Up to Date</p>
              <p className="text-3xl font-bold text-green-900 mt-1">{stats.upToDate}</p>
            </div>
            <CheckCircle className="h-10 w-10 text-green-600 opacity-60" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg shadow-sm border border-yellow-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-yellow-600 uppercase tracking-wide">Needs Update</p>
              <p className="text-3xl font-bold text-yellow-900 mt-1">{stats.needsUpdate}</p>
            </div>
            <Calendar className="h-10 w-10 text-yellow-600 opacity-60" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg shadow-sm border border-red-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-red-600 uppercase tracking-wide">Overdue</p>
              <p className="text-3xl font-bold text-red-900 mt-1">{stats.overdue}</p>
            </div>
            <FileText className="h-10 w-10 text-red-600 opacity-60" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500">
              <option value="all">All Statuses</option>
              <option value="up_to_date">Up to Date</option>
              <option value="needs_update">Needs Update</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Format</label>
            <select value={selectedFormat} onChange={(e) => setSelectedFormat(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500">
              <option value="all">All Formats</option>
              <option value="physical">Physical</option>
              <option value="electronic">Electronic</option>
              <option value="both">Both</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {filteredRegisters.map((register) => (
          <div key={register.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-gray-900">{register.registerName}</h3>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full border-2 ${statusColors[register.status]}`}>
                    {register.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-gray-700 font-medium mb-1">{register.act}</p>
                <p className="text-xs text-gray-600">{register.formNumber}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-2">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-600 uppercase font-medium mb-1">Frequency</p>
                <p className="text-sm font-bold text-gray-900 capitalize">{register.frequency}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-600 uppercase font-medium mb-1">Format</p>
                <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${formatBadgeColors[register.format]}`}>
                  {register.format === 'both' ? 'Both' : register.format.charAt(0).toUpperCase() + register.format.slice(1)}
                </span>
              </div>
            </div>

            <div className="space-y-2 mb-2 text-sm">
              <div className="flex items-start gap-2">
                <Users className="h-4 w-4 text-gray-400 mt-0.5" />
                <div>
                  <span className="text-gray-600">Responsibility:</span>
                  <span className="font-semibold text-gray-900 ml-1">{register.responsibility}</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <FileText className="h-4 w-4 text-gray-400 mt-0.5" />
                <div>
                  <span className="text-gray-600">Total Entries:</span>
                  <span className="font-semibold text-gray-900 ml-1">{register.totalEntries.toLocaleString('en-IN')}</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 text-gray-400 mt-0.5" />
                <div>
                  <span className="text-gray-600">Last Updated:</span>
                  <span className="font-semibold text-gray-900 ml-1">
                    {new Date(register.lastUpdated).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2">
              <p className="text-xs text-blue-600 uppercase font-medium mb-1">Applicability</p>
              <p className="text-sm text-blue-900">{register.applicability}</p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-2">
              <p className="text-xs text-gray-600 uppercase font-medium mb-1">Retention Period</p>
              <p className="text-sm text-gray-900 font-semibold">{register.retentionPeriod}</p>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
                <FileText className="h-4 w-4" />
                View Register
              </button>
              <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700">
                <Download className="h-4 w-4" />
                Export
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
