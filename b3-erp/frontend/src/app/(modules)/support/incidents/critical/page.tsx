'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Clock, Users, TrendingUp, Activity, Phone, Mail, Bell, Eye, CheckCircle2, XCircle } from 'lucide-react';
import { ITILService } from '@/services/support.service';

const COMPANY_ID = process.env.NEXT_PUBLIC_COMPANY_ID || 'company-1';

interface CriticalIncident {
  id: string;
  incidentNumber: string;
  title: string;
  description: string;
  priority: 'P0' | 'P1';
  severity: 'Critical' | 'High';
  status: string;
  category: string;
  affectedServices: string[];
  reportedBy: string;
  reportedAt: string;
  assignedTo: string;
  assignedTeam: string;
  impactedUsers: number;
  estimatedResolution: string;
  timeElapsed: string;
  slaStatus: 'Within SLA' | 'At Risk' | 'Breached';
  slaRemaining: string;
  escalationLevel: number;
  escalationPath: string[];
  warRoom: boolean;
  businessImpact: string;
  revenueImpact: string;
  lastUpdate: string;
  updateFrequency: string;
  criticalityScore: number;
}

const CriticalIncidentsPage = () => {
  const [selectedIncident, setSelectedIncident] = useState<CriticalIncident | null>(null);

  const [incidents, setIncidents] = useState<CriticalIncident[]>([]);

  useEffect(() => {
    let cancelled = false;

    const loadIncidents = async () => {
      try {
        const res = await ITILService.getIncidents(COMPANY_ID, { priority: 'P1' });
        const rows = Array.isArray(res?.data) ? res.data : [];
        const mapped: CriticalIncident[] = rows.map((r: any) => ({
          id: r?.id ?? '',
          incidentNumber: r?.incidentNumber ?? '',
          title: r?.title ?? '',
          description: r?.description ?? '',
          priority: (r?.priority === 'critical' ? 'P0' : 'P1') as 'P0' | 'P1',
          severity: (r?.impact === 'critical' ? 'Critical' : 'High') as 'Critical' | 'High',
          status: r?.status ?? '',
          category: r?.category ?? '',
          affectedServices: Array.isArray(r?.affectedServices) ? r.affectedServices : [],
          reportedBy: r?.reportedBy ?? '',
          reportedAt: r?.createdAt ? String(r.createdAt) : '',
          assignedTo: r?.assignedTo ?? 'Unassigned',
          assignedTeam: r?.assignedTeam ?? '',
          impactedUsers: typeof r?.impactedUsers === 'number' ? r.impactedUsers : 0,
          estimatedResolution: r?.resolvedAt ? String(r.resolvedAt) : '',
          timeElapsed: '',
          slaStatus: 'Within SLA',
          slaRemaining: '',
          escalationLevel: typeof r?.reopenedCount === 'number' ? r.reopenedCount : 0,
          escalationPath: [],
          warRoom: false,
          businessImpact: r?.impact ? `Impact: ${r.impact}` : '',
          revenueImpact: '',
          lastUpdate: r?.updatedAt ? String(r.updatedAt) : '',
          updateFrequency: '',
          criticalityScore: r?.priority === 'critical' ? 95 : 85,
        }));
        if (!cancelled) setIncidents(mapped);
      } catch {
        if (!cancelled) setIncidents([]);
      }
    };

    loadIncidents();
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = {
    totalCritical: incidents.length,
    p0: incidents.filter(i => i.priority === 'P0').length,
    p1: incidents.filter(i => i.priority === 'P1').length,
    warRoom: incidents.filter(i => i.warRoom).length,
    slaBreach: incidents.filter(i => i.slaStatus === 'Breached').length,
    avgCriticality: Math.round(incidents.reduce((sum, i) => sum + i.criticalityScore, 0) / incidents.length),
  };

  const getSLAColor = (status: string) => {
    switch (status) {
      case 'Within SLA': return 'text-green-700 bg-green-50';
      case 'At Risk': return 'text-yellow-700 bg-yellow-50';
      case 'Breached': return 'text-red-700 bg-red-50';
      default: return 'text-gray-700 bg-gray-50';
    }
  };

  const getPriorityColor = (priority: string) => {
    return priority === 'P0' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800';
  };

  const getCriticalityColor = (score: number) => {
    if (score >= 95) return 'text-red-600';
    if (score >= 85) return 'text-orange-600';
    return 'text-yellow-600';
  };

  const handleViewDetails = (incident: CriticalIncident) => {
    setSelectedIncident(incident);
  };

  const handleCloseDetails = () => {
    setSelectedIncident(null);
  };

  const handleEscalate = (incidentNumber: string) => {
    alert(`Escalating incident ${incidentNumber} to next level`);
  };

  const handleInitiateWarRoom = (incidentNumber: string) => {
    alert(`Initiating war room for incident ${incidentNumber}`);
  };

  return (
    <div className="p-6 max-w-[1600px]">
      {/* Header with Alert */}
      <div className="mb-3">
        <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl p-3 mb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-3 bg-white/20 rounded-lg">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Critical Incidents Dashboard</h1>
                <p className="text-red-100 mt-1">P0/P1 Priority - Immediate Attention Required</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold">{stats.totalCritical}</div>
              <div className="text-red-100">Active Critical Incidents</div>
            </div>
          </div>
        </div>

        {/* SLA Breach Alert */}
        {stats.slaBreach > 0 && (
          <div className="bg-red-50 border-l-4 border-red-600 p-3 rounded-r-lg mb-2">
            <div className="flex items-center gap-3">
              <Bell className="w-6 h-6 text-red-600 animate-pulse" />
              <div>
                <div className="font-bold text-red-900">SLA Breach Alert</div>
                <div className="text-red-700">{stats.slaBreach} incident(s) have breached SLA targets - Immediate escalation required</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-2 mb-3">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Total Critical</span>
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-red-600">{stats.totalCritical}</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">P0 Priority</span>
            <XCircle className="w-4 h-4 text-red-700" />
          </div>
          <div className="text-2xl font-bold text-red-700">{stats.p0}</div>
          <div className="text-xs text-gray-500 mt-1">15 min response</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">P1 Priority</span>
            <AlertTriangle className="w-4 h-4 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-orange-600">{stats.p1}</div>
          <div className="text-xs text-gray-500 mt-1">1 hour response</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">War Rooms</span>
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-600">{stats.warRoom}</div>
          <div className="text-xs text-gray-500 mt-1">Active</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">SLA Breach</span>
            <Clock className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-red-600">{stats.slaBreach}</div>
          <div className="text-xs text-gray-500 mt-1">Exceeded</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Avg Criticality</span>
            <TrendingUp className="w-4 h-4 text-orange-600" />
          </div>
          <div className={`text-2xl font-bold ${getCriticalityColor(stats.avgCriticality)}`}>{stats.avgCriticality}</div>
          <div className="text-xs text-gray-500 mt-1">Out of 100</div>
        </div>
      </div>

      {/* Critical Incidents List */}
      <div className="space-y-2">
        {incidents.sort((a, b) => b.criticalityScore - a.criticalityScore).map((incident) => (
          <div key={incident.id} className="bg-white rounded-xl shadow-sm border-2 border-red-200 overflow-hidden hover:shadow-md transition-shadow">
            {/* Incident Header */}
            <div className={`p-4 ${incident.priority === 'P0' ? 'bg-gradient-to-r from-red-50 to-orange-50' : 'bg-orange-50'}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${getPriorityColor(incident.priority)}`}>
                      {incident.priority}
                    </span>
                    <span className="font-mono text-lg font-bold text-gray-900">{incident.incidentNumber}</span>
                    {incident.warRoom && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                        <Users className="w-4 h-4" />
                        War Room Active
                      </span>
                    )}
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getSLAColor(incident.slaStatus)}`}>
                      {incident.slaStatus}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{incident.title}</h3>
                  <p className="text-gray-700 mb-3">{incident.description}</p>
                  
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Time Elapsed</div>
                      <div className="font-bold text-red-600">{incident.timeElapsed}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">SLA Remaining</div>
                      <div className={`font-bold ${incident.slaStatus === 'Breached' ? 'text-red-600' : 'text-green-600'}`}>
                        {incident.slaRemaining}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Impacted Users</div>
                      <div className="font-bold text-gray-900">{incident.impactedUsers}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Revenue Impact</div>
                      <div className="font-bold text-red-600">{incident.revenueImpact}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700">{incident.assignedTo} ({incident.assignedTeam})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700">Updates: {incident.updateFrequency}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700">Escalation Level {incident.escalationLevel}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right ml-6">
                  <div className="mb-2">
                    <div className="text-sm text-gray-600 mb-1">Criticality Score</div>
                    <div className={`text-5xl font-bold ${getCriticalityColor(incident.criticalityScore)}`}>
                      {incident.criticalityScore}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Incident Details */}
            <div className="p-4 bg-gray-50 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2">Business Impact:</div>
                  <div className="text-sm text-red-700 bg-red-50 rounded-lg p-3">{incident.businessImpact}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2">Affected Services:</div>
                  <div className="flex flex-wrap gap-2">
                    {incident.affectedServices.map((service, idx) => (
                      <span key={idx} className="px-2 py-1 bg-white border border-gray-300 text-gray-700 rounded text-xs">
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <div className="text-sm font-medium text-gray-700 mb-2">Escalation Path:</div>
                <div className="flex items-center gap-2">
                  {incident.escalationPath.map((level, idx) => (
                    <div key={idx} className="flex items-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        idx < incident.escalationLevel 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {level}
                      </span>
                      {idx < incident.escalationPath.length - 1 && (
                        <div className="w-8 h-0.5 bg-gray-300 mx-1"></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="p-4 bg-white border-t border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleViewDetails(incident)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </button>
                {!incident.warRoom && (
                  <button
                    onClick={() => handleInitiateWarRoom(incident.incidentNumber)}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Users className="w-4 h-4" />
                    Initiate War Room
                  </button>
                )}
                <button
                  onClick={() => handleEscalate(incident.incidentNumber)}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  <TrendingUp className="w-4 h-4" />
                  Escalate
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button className="inline-flex items-center gap-1.5 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm">
                  <Phone className="w-4 h-4" />
                  <span className="text-gray-700">Call</span>
                </button>
                <button className="inline-flex items-center gap-1.5 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm">
                  <Mail className="w-4 h-4" />
                  <span className="text-gray-700">Email</span>
                </button>
                <button className="inline-flex items-center gap-1.5 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm">
                  <Bell className="w-4 h-4" />
                  <span className="text-gray-700">Notify</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {selectedIncident && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-xl shadow-xl  w-full max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-red-50">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selectedIncident.incidentNumber}</h3>
                <p className="text-gray-600">{selectedIncident.title}</p>
              </div>
              <button
                onClick={handleCloseDetails}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm"
              >
                <XCircle className="w-5 h-5" />
                <span className="text-gray-700">Close</span>
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
                    <div className="bg-gray-50 rounded-lg p-3 text-gray-900">{selectedIncident.description}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Business Impact</label>
                    <div className="bg-red-50 rounded-lg p-3 text-red-900">{selectedIncident.businessImpact}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Revenue Impact</label>
                    <div className="bg-red-50 rounded-lg p-3 text-2xl font-bold text-red-900">{selectedIncident.revenueImpact}</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Priority</label>
                      <span className={`inline-flex px-3 py-1 rounded-full font-bold ${getPriorityColor(selectedIncident.priority)}`}>
                        {selectedIncident.priority}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Criticality</label>
                      <div className={`text-3xl font-bold ${getCriticalityColor(selectedIncident.criticalityScore)}`}>
                        {selectedIncident.criticalityScore}/100
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">SLA Status</label>
                    <span className={`inline-flex px-3 py-1 rounded-full font-medium ${getSLAColor(selectedIncident.slaStatus)}`}>
                      {selectedIncident.slaStatus}: {selectedIncident.slaRemaining}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Assigned To</label>
                    <div className="font-medium text-gray-900">{selectedIncident.assignedTo}</div>
                    <div className="text-sm text-gray-600">{selectedIncident.assignedTeam}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Time Elapsed</label>
                    <div className="text-2xl font-bold text-red-600">{selectedIncident.timeElapsed}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-3 border-t border-gray-200">
              <button
                onClick={handleCloseDetails}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CriticalIncidentsPage;
