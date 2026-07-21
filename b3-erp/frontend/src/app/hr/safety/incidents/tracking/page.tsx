'use client';

import { useState, useMemo, useEffect } from 'react';
import { AlertTriangle, AlertCircle, CheckCircle, Clock, XCircle, Eye, TrendingDown, Users, MapPin, Calendar } from 'lucide-react';
import DataTable from '@/components/DataTable';
import { EmptyState } from '@/components/ui/EmptyState';
import { HrSelfServiceService } from '@/services/hr-self-service.service';
import { HrSafetyService } from '@/services/hr-safety.service';

interface SafetyIncident {
  id: string;
  incidentNumber: string;
  reportedDate: string;
  incidentDate: string;
  incidentTime: string;
  location: string;
  department: string;
  severity: 'minor' | 'moderate' | 'serious' | 'critical';
  type: 'injury' | 'near_miss' | 'property_damage' | 'environmental' | 'fire' | 'chemical_spill';
  description: string;
  reportedBy: string;
  employeeInvolved: string;
  witnessCount: number;
  status: 'reported' | 'investigating' | 'action_pending' | 'resolved' | 'closed';
  investigator?: string;
  rootCause?: string;
  daysLost: number;
  medicalAttention: boolean;
}

export default function Page() {
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [rows, setRows] = useState<SafetyIncident[]>([]);
  const [ltir, setLtir] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [detailIncident, setDetailIncident] = useState<SafetyIncident | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = await HrSelfServiceService.getSafetyIncidents();
        const mapped: SafetyIncident[] = raw.map((r) => ({
          id: r.id,
          incidentNumber: r.incidentNumber ?? '',
          reportedDate: r.reportedDate ?? '',
          incidentDate: r.incidentDate ?? '',
          incidentTime: r.incidentTime ?? '',
          location: r.location ?? '',
          department: r.department ?? '',
          severity: (r.severity as SafetyIncident['severity']) ?? 'minor',
          type: (r.type as SafetyIncident['type']) ?? 'injury',
          description: r.description ?? '',
          reportedBy: r.reportedBy ?? '',
          employeeInvolved: r.employeeInvolved ?? '',
          witnessCount: Number(r.witnessCount ?? 0),
          status: (r.status as SafetyIncident['status']) ?? 'reported',
          investigator: r.investigator ?? undefined,
          rootCause: r.rootCause ?? undefined,
          daysLost: Number(r.daysLost ?? 0),
          medicalAttention: Boolean(r.medicalAttention ?? false),
        }));
        let trirLtir: number | null = null;
        try {
          const trends = await HrSafetyService.getTrends(12);
          trirLtir = trends.summary.ltir;
        } catch {
          trirLtir = null; // aggregate is best-effort; keep the list working
        }
        if (!cancelled) {
          setRows(mapped);
          setLtir(trirLtir);
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load safety incidents');
          setRows([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredIncidents = useMemo(() => {
    return rows.filter(incident => {
      const matchesSeverity = selectedSeverity === 'all' || incident.severity === selectedSeverity;
      const matchesStatus = selectedStatus === 'all' || incident.status === selectedStatus;
      const matchesDept = selectedDepartment === 'all' || incident.department === selectedDepartment;
      return matchesSeverity && matchesStatus && matchesDept;
    });
  }, [selectedSeverity, selectedStatus, selectedDepartment, rows]);

  const stats = {
    total: rows.length,
    critical: rows.filter(i => i.severity === 'critical').length,
    serious: rows.filter(i => i.severity === 'serious').length,
    investigating: rows.filter(i => i.status === 'investigating').length,
    resolved: rows.filter(i => i.status === 'resolved').length,
    totalDaysLost: rows.reduce((sum, i) => sum + i.daysLost, 0),
    medicalCases: rows.filter(i => i.medicalAttention).length,
    // LTIR = (lost-time injuries × 200,000 / hours worked), computed server-side
    // by the safety analytics aggregate. Falls back to 'N/A' if unavailable.
    mtir: (ltir != null ? ltir.toFixed(2) : 'N/A') as string,
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      minor: 'bg-yellow-100 text-yellow-800',
      moderate: 'bg-orange-100 text-orange-800',
      serious: 'bg-red-100 text-red-800',
      critical: 'bg-rose-100 text-rose-800'
    };
    return colors[severity as keyof typeof colors];
  };

  const getStatusColor = (status: string) => {
    const colors = {
      reported: 'bg-blue-100 text-blue-800',
      investigating: 'bg-purple-100 text-purple-800',
      action_pending: 'bg-orange-100 text-orange-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors];
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      injury: 'Injury',
      near_miss: 'Near Miss',
      property_damage: 'Property Damage',
      environmental: 'Environmental',
      fire: 'Fire',
      chemical_spill: 'Chemical Spill'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const columns = [
    { key: 'incidentNumber', label: 'Incident No.', sortable: true,
      render: (v: string) => <div className="font-semibold text-gray-900">{v}</div>
    },
    { key: 'incidentDate', label: 'Date & Time', sortable: true,
      render: (v: string, row: SafetyIncident) => (
        <div>
          <div className="text-sm text-gray-900">
            {new Date(v).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
          <div className="text-xs text-gray-500">{row.incidentTime}</div>
        </div>
      )
    },
    { key: 'location', label: 'Location', sortable: true,
      render: (v: string, row: SafetyIncident) => (
        <div>
          <div className="text-sm text-gray-900">{v}</div>
          <div className="text-xs text-gray-500">{row.department}</div>
        </div>
      )
    },
    { key: 'type', label: 'Type', sortable: true,
      render: (v: string) => (
        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
          {getTypeLabel(v)}
        </span>
      )
    },
    { key: 'severity', label: 'Severity', sortable: true,
      render: (v: string) => (
        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getSeverityColor(v)}`}>
          {v.toUpperCase()}
        </span>
      )
    },
    { key: 'employeeInvolved', label: 'Involved', sortable: true,
      render: (v: string) => <div className="text-sm text-gray-700">{v}</div>
    },
    { key: 'daysLost', label: 'Days Lost', sortable: true,
      render: (v: number) => (
        <div className={`text-sm font-semibold ${v > 0 ? 'text-red-600' : 'text-gray-700'}`}>
          {v}
        </div>
      )
    },
    { key: 'status', label: 'Status', sortable: true,
      render: (v: string) => (
        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(v)}`}>
          {v.replace('_', ' ').toUpperCase()}
        </span>
      )
    },
    { key: 'actions', label: 'Actions', sortable: false,
      render: (_: any, row: SafetyIncident) => (
        <button
          onClick={() => setDetailIncident(row)}
          className="p-1 hover:bg-gray-100 rounded"
          title="View details"
        >
          <Eye className="h-4 w-4 text-gray-600" />
        </button>
      )
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-3">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <AlertTriangle className="h-8 w-8 text-red-600" />
          Safety Incident Tracking
        </h1>
        <p className="text-gray-600 mt-2">Monitor and manage workplace safety incidents</p>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading safety incidents…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-8 gap-2 mb-3">
        <div className="bg-white border-2 border-red-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Incidents</p>
              <p className="text-2xl font-bold text-red-600">{stats.total}</p>
            </div>
            <AlertTriangle className="h-10 w-10 text-red-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-rose-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Critical</p>
              <p className="text-2xl font-bold text-rose-600">{stats.critical}</p>
            </div>
            <XCircle className="h-10 w-10 text-rose-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-orange-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Serious</p>
              <p className="text-2xl font-bold text-orange-600">{stats.serious}</p>
            </div>
            <AlertTriangle className="h-10 w-10 text-orange-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-purple-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Investigating</p>
              <p className="text-2xl font-bold text-purple-600">{stats.investigating}</p>
            </div>
            <Clock className="h-10 w-10 text-purple-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-green-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Resolved</p>
              <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
            </div>
            <CheckCircle className="h-10 w-10 text-green-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-yellow-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Days Lost</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.totalDaysLost}</p>
            </div>
            <Calendar className="h-10 w-10 text-yellow-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Medical</p>
              <p className="text-2xl font-bold text-blue-600">{stats.medicalCases}</p>
            </div>
            <Users className="h-10 w-10 text-blue-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-teal-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">LTIR</p>
              <p className="text-xl font-bold text-teal-600">{stats.mtir}</p>
            </div>
            <TrendingDown className="h-10 w-10 text-teal-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Severity:</label>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
            >
              <option value="all">All Severity Levels</option>
              <option value="minor">Minor</option>
              <option value="moderate">Moderate</option>
              <option value="serious">Serious</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status:</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
            >
              <option value="all">All Statuses</option>
              <option value="reported">Reported</option>
              <option value="investigating">Investigating</option>
              <option value="action_pending">Action Pending</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Department:</label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
            >
              <option value="all">All Departments</option>
              <option value="Manufacturing">Manufacturing</option>
              <option value="Warehouse & Logistics">Warehouse & Logistics</option>
              <option value="Quality Assurance">Quality Assurance</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Administration">Administration</option>
            </select>
          </div>
        </div>
      </div>

      {/* Incidents Table */}
      {rows.length === 0 && !isLoading ? (
        <EmptyState
          icon={AlertTriangle}
          title="No safety incidents found"
          description="There are no workplace safety incidents recorded yet."
        />
      ) : (
        <DataTable data={filteredIncidents} columns={columns} />
      )}

      {/* Severity Classification */}
      <div className="mt-6 bg-white border border-gray-200 rounded-lg p-3">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Incident Severity Classification</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-600">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <span className="w-3 h-3 bg-yellow-600 rounded-full"></span>
              Minor Incident
            </h4>
            <p className="text-sm text-gray-700">First aid treatment only, no days lost, minimal property damage under ₹10,000</p>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg border-l-4 border-orange-600">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <span className="w-3 h-3 bg-orange-600 rounded-full"></span>
              Moderate Incident
            </h4>
            <p className="text-sm text-gray-700">Medical treatment required, 1-3 days lost, property damage ₹10k-₹50k</p>
          </div>
          <div className="p-4 bg-red-50 rounded-lg border-l-4 border-red-600">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <span className="w-3 h-3 bg-red-600 rounded-full"></span>
              Serious Incident
            </h4>
            <p className="text-sm text-gray-700">Hospitalization required, 4-7 days lost, property damage ₹50k-₹2L</p>
          </div>
          <div className="p-4 bg-rose-50 rounded-lg border-l-4 border-rose-600">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <span className="w-3 h-3 bg-rose-600 rounded-full"></span>
              Critical Incident
            </h4>
            <p className="text-sm text-gray-700">Fatality, permanent disability, 8+ days lost, property damage above ₹2L</p>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-red-900 mb-2">Safety Incident Response Protocol</h3>
        <ul className="text-sm text-red-800 space-y-1">
          <li>• All incidents must be reported within 2 hours of occurrence</li>
          <li>• Critical incidents require immediate notification to management and authorities</li>
          <li>• Investigation must be completed within 48 hours for serious/critical incidents</li>
          <li>• LTIR (Lost Time Injury Rate) = (Total lost time injuries / Total hours worked) × 200,000</li>
          <li>• Root cause analysis is mandatory for all incidents with days lost</li>
          <li>• Corrective actions must be implemented within 7 days of investigation closure</li>
        </ul>
      </div>

      {/* Incident Detail Modal */}
      {detailIncident && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setDetailIncident(null)}
        >
          <div
            className="w-full max-w-lg rounded-xl bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-bold text-gray-900">
                {detailIncident.incidentNumber || 'Incident Detail'}
              </h2>
              <button
                onClick={() => setDetailIncident(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 px-6 py-4 text-sm">
              <div><p className="text-xs text-gray-500">Date</p><p className="font-medium text-gray-900">{detailIncident.incidentDate} {detailIncident.incidentTime}</p></div>
              <div><p className="text-xs text-gray-500">Location</p><p className="font-medium text-gray-900">{detailIncident.location} · {detailIncident.department}</p></div>
              <div><p className="text-xs text-gray-500">Type</p><p className="font-medium text-gray-900">{getTypeLabel(detailIncident.type)}</p></div>
              <div><p className="text-xs text-gray-500">Severity</p><p className="font-medium text-gray-900">{detailIncident.severity}</p></div>
              <div><p className="text-xs text-gray-500">Employee Involved</p><p className="font-medium text-gray-900">{detailIncident.employeeInvolved || '—'}</p></div>
              <div><p className="text-xs text-gray-500">Reported By</p><p className="font-medium text-gray-900">{detailIncident.reportedBy || '—'}</p></div>
              <div><p className="text-xs text-gray-500">Days Lost</p><p className="font-medium text-gray-900">{detailIncident.daysLost}</p></div>
              <div><p className="text-xs text-gray-500">Status</p><p className="font-medium text-gray-900">{detailIncident.status}</p></div>
              <div className="col-span-2"><p className="text-xs text-gray-500">Investigator</p><p className="font-medium text-gray-900">{detailIncident.investigator || '—'}</p></div>
              <div className="col-span-2"><p className="text-xs text-gray-500">Description</p><p className="font-medium text-gray-900">{detailIncident.description || '—'}</p></div>
              {detailIncident.rootCause && (
                <div className="col-span-2"><p className="text-xs text-gray-500">Root Cause</p><p className="font-medium text-gray-900">{detailIncident.rootCause}</p></div>
              )}
            </div>
            <div className="flex justify-end border-t border-gray-200 px-6 py-4">
              <button
                onClick={() => setDetailIncident(null)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
