'use client';

import { useState, useMemo, useEffect } from 'react';
import { AlertTriangle, AlertCircle, CheckCircle, Clock, XCircle, Eye, TrendingDown, Users, MapPin, Calendar } from 'lucide-react';
import DataTable from '@/components/DataTable';
import { HrSelfServiceService } from '@/services/hr-self-service.service';

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
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

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
        if (!cancelled) setRows(mapped);
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

  const mockIncidents: SafetyIncident[] = rows.length ? rows : [
    {
      id: '1', incidentNumber: 'INC-2024-101', reportedDate: '2024-10-20', incidentDate: '2024-10-20',
      incidentTime: '10:30 AM', location: 'Production Floor - Section A', department: 'Manufacturing',
      severity: 'moderate', type: 'injury', description: 'Machine operator hand injury while operating CNC machine',
      reportedBy: 'Suresh Patel', employeeInvolved: 'Ramesh Kumar (KMF-2024-045)', witnessCount: 2,
      status: 'resolved', investigator: 'Safety Officer', rootCause: 'Safety guard not properly positioned',
      daysLost: 3, medicalAttention: true
    },
    {
      id: '2', incidentNumber: 'INC-2024-102', reportedDate: '2024-10-22', incidentDate: '2024-10-22',
      incidentTime: '02:15 PM', location: 'Warehouse - Loading Bay', department: 'Warehouse & Logistics',
      severity: 'minor', type: 'near_miss', description: 'Forklift nearly collided with pedestrian',
      reportedBy: 'Amit Singh', employeeInvolved: 'N/A', witnessCount: 3,
      status: 'investigating', investigator: 'Safety Officer', daysLost: 0, medicalAttention: false
    },
    {
      id: '3', incidentNumber: 'INC-2024-103', reportedDate: '2024-10-18', incidentDate: '2024-10-18',
      incidentTime: '09:45 AM', location: 'Quality Lab', department: 'Quality Assurance',
      severity: 'minor', type: 'chemical_spill', description: 'Small chemical spill during testing',
      reportedBy: 'Meena Rao', employeeInvolved: 'Lab Technician', witnessCount: 1,
      status: 'closed', investigator: 'Safety Officer', rootCause: 'Container improperly sealed',
      daysLost: 0, medicalAttention: false
    },
    {
      id: '4', incidentNumber: 'INC-2024-104', reportedDate: '2024-10-25', incidentDate: '2024-10-25',
      incidentTime: '11:00 AM', location: 'Maintenance Workshop', department: 'Maintenance',
      severity: 'serious', type: 'injury', description: 'Technician fell from ladder during maintenance work',
      reportedBy: 'Suresh Patel', employeeInvolved: 'Anil Patil (KMF-2024-078)', witnessCount: 2,
      status: 'action_pending', investigator: 'Safety Officer', rootCause: 'Ladder not properly secured',
      daysLost: 7, medicalAttention: true
    },
    {
      id: '5', incidentNumber: 'INC-2024-105', reportedDate: '2024-10-15', incidentDate: '2024-10-15',
      incidentTime: '03:30 PM', location: 'Assembly Line 2', department: 'Manufacturing',
      severity: 'minor', type: 'property_damage', description: 'Conveyor belt malfunction causing product damage',
      reportedBy: 'Rajesh Kumar', employeeInvolved: 'N/A', witnessCount: 4,
      status: 'closed', investigator: 'Maintenance Head', rootCause: 'Worn out belt, overdue maintenance',
      daysLost: 0, medicalAttention: false
    },
    {
      id: '6', incidentNumber: 'INC-2024-106', reportedDate: '2024-10-23', incidentDate: '2024-10-23',
      incidentTime: '01:00 PM', location: 'Cafeteria', department: 'Administration',
      severity: 'minor', type: 'injury', description: 'Employee slipped on wet floor',
      reportedBy: 'Admin Staff', employeeInvolved: 'Priya Desai (KMF-2024-092)', witnessCount: 5,
      status: 'resolved', investigator: 'Safety Officer', rootCause: 'Warning sign not placed after mopping',
      daysLost: 1, medicalAttention: true
    },
    {
      id: '7', incidentNumber: 'INC-2024-107', reportedDate: '2024-10-26', incidentDate: '2024-10-26',
      incidentTime: '08:15 AM', location: 'Electrical Panel Room', department: 'Maintenance',
      severity: 'critical', type: 'fire', description: 'Electrical panel short circuit causing small fire',
      reportedBy: 'Security', employeeInvolved: 'N/A', witnessCount: 1,
      status: 'investigating', investigator: 'Fire Safety Expert', daysLost: 0, medicalAttention: false
    },
    {
      id: '8', incidentNumber: 'INC-2024-108', reportedDate: '2024-10-21', incidentDate: '2024-10-21',
      incidentTime: '04:45 PM', location: 'Parking Area', department: 'Administration',
      severity: 'minor', type: 'near_miss', description: 'Vehicle near collision in parking lot',
      reportedBy: 'Security', employeeInvolved: 'N/A', witnessCount: 2,
      status: 'closed', investigator: 'Security Head', rootCause: 'Inadequate signage in parking area',
      daysLost: 0, medicalAttention: false
    }
  ];

  const filteredIncidents = useMemo(() => {
    return mockIncidents.filter(incident => {
      const matchesSeverity = selectedSeverity === 'all' || incident.severity === selectedSeverity;
      const matchesStatus = selectedStatus === 'all' || incident.status === selectedStatus;
      const matchesDept = selectedDepartment === 'all' || incident.department === selectedDepartment;
      return matchesSeverity && matchesStatus && matchesDept;
    });
  }, [selectedSeverity, selectedStatus, selectedDepartment, rows]);

  const stats = {
    total: mockIncidents.length,
    critical: mockIncidents.filter(i => i.severity === 'critical').length,
    serious: mockIncidents.filter(i => i.severity === 'serious').length,
    investigating: mockIncidents.filter(i => i.status === 'investigating').length,
    resolved: mockIncidents.filter(i => i.status === 'resolved').length,
    totalDaysLost: mockIncidents.reduce((sum, i) => sum + i.daysLost, 0),
    medicalCases: mockIncidents.filter(i => i.medicalAttention).length,
    mtir: ((mockIncidents.length / 229) * 200000).toFixed(2) // Mock LTIR calculation
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
        <button className="p-1 hover:bg-gray-100 rounded">
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
      <DataTable data={filteredIncidents} columns={columns} />

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
    </div>
  );
}
